const { QdrantClient } = require("@qdrant/js-client-rest");
const { pipeline } = require("@huggingface/transformers");

require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});
const QDRANT_COLLECTION = "shopsense_products";
const VECTOR_SIZE = 384;
const CATEGORIES = [
  "Mobile",
  "Laptop",
  "Tablet",
  "Notebook",
  "Keyboard",
  "Mouse",
  "Headphones",
  "Accessories",
];

let products;
let clerkClient;
let getAuth;
let qdrantReady = false;

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function optionalNumber(value, label) {
  if (value === "" || value === null || value === undefined) return null;

  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw httpError(400, `${label} must be a non-negative number.`);
  }

  return number;
}

function requiredText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw httpError(400, `${label} is required.`);
  return text;
}

function normalizeProduct(input, existing = {}) {
  const source = { ...existing, ...input };
  const price = Number(source.Price_INR);

  if (!Number.isFinite(price) || price < 0) {
    throw httpError(400, "Price must be a non-negative number.");
  }

  const availability =
    source.Available === false ||
    String(source.Available).toLowerCase() === "false";

  return {
    Category: requiredText(source.Category, "Category"),
    Brand: requiredText(source.Brand, "Brand"),
    Model_Name: requiredText(source.Model_Name, "Product name"),
    Description: String(source.Description ?? "").trim(),
    Image_URL: String(
      source.Image_URL ??
        source.Image_Url ??
        source.imageUrl ??
        source.image_url ??
        "",
    ).trim(),
    Price_INR: price,
    Processor: String(source.Processor ?? "").trim(),
    RAM_GB: optionalNumber(source.RAM_GB, "RAM"),
    Storage_GB: optionalNumber(source.Storage_GB, "Storage"),
    Screen_Size_inch: optionalNumber(source.Screen_Size_inch, "Screen size"),
    Battery_mAh: optionalNumber(source.Battery_mAh, "Battery"),
    Launch_Year: optionalNumber(source.Launch_Year, "Launch year"),
    OS: String(source.OS ?? "").trim(),
    Connectivity: Array.isArray(source.Connectivity)
      ? source.Connectivity.join(", ")
      : String(source.Connectivity ?? "").trim(),
    Country_Origin: String(source.Country_Origin ?? "").trim(),
    Popular_in_India:
      source.Popular_in_India === true ||
      String(source.Popular_in_India).toLowerCase() === "yes",
    Available: !availability,
  };
}

function publicProduct(product) {
  if (!product) return null;
  const { _id, ...fields } = product;

  // Existing CSV rows don't have an Available field; treat them as listed
  // until an admin changes their status.
  return { ...fields, Available: product.Available ?? true };
}

function pointId(productId) {
  const hash = crypto
    .createHash("sha256")
    .update(String(productId))
    .digest("hex")
    .slice(0, 32);

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join("-");
}

function wordBucket(word) {
  let hash = 2166136261;
  for (const character of word) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) % 48;
}

function addWords(vector, text) {
  const words =
    String(text ?? "")
      .toLowerCase()
      .match(/[a-z0-9]+/g) || [];
  for (const word of words) vector[wordBucket(word)] += 1;
}

function normalized(vector) {
  const magnitude =
    Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / magnitude);
}

function productVector(product) {
  const vector = Array(VECTOR_SIZE).fill(0);

  addWords(
    vector,
    [
      product.Category,
      product.Brand,
      product.Model_Name,
      product.Processor,
      product.OS,
      product.Connectivity,
      product.Description,
    ].join(" "),
  );

  const categoryIndex = CATEGORIES.indexOf(product.Category);
  if (categoryIndex >= 0) vector[48 + categoryIndex] = 1;

  vector[56] = Math.min(Number(product.Price_INR || 0) / 500000, 1);
  vector[57] = Math.min(Number(product.RAM_GB || 0) / 64, 1);
  vector[58] = Math.min(Number(product.Storage_GB || 0) / 4096, 1);
  vector[59] = Math.min(Number(product.Screen_Size_inch || 0) / 20, 1);
  vector[60] = Math.min(Number(product.Battery_mAh || 0) / 20000, 1);
  vector[61] = Math.min(Number(product.Launch_Year || 0) / 2030, 1);
  vector[62] = product.Available === false ? 0 : 1;
  vector[63] = product.Popular_in_India ? 1 : 0;

  return normalized(vector);
}

function preferenceVector(preferences) {
  const vector = Array(VECTOR_SIZE).fill(0);
  addWords(vector, preferences.requirements || "");

  const categoryIndex = CATEGORIES.indexOf(preferences.category);
  if (categoryIndex >= 0) vector[48 + categoryIndex] = 1;

  vector[56] = Math.min(Number(preferences.budget || 0) / 500000, 1);
  vector[57] = Math.min(Number(preferences.minRamGb || 0) / 64, 1);
  vector[58] = Math.min(Number(preferences.minStorageGb || 0) / 4096, 1);
  vector[62] = preferences.onlyAvailable === false ? 0 : 1;

  return normalized(vector);
}

function qdrantConfigured() {
  return Boolean(process.env.QDRANT_URL);
}

async function qdrantFetch(path, options = {}) {
  if (!qdrantConfigured()) {
    throw httpError(503, "Set QDRANT_URL to enable recommendations.");
  }

  const baseUrl = process.env.QDRANT_URL.replace(/\/+$/, "");
  const headers = {
    "Content-Type": "application/json",
    ...(process.env.QDRANT_API_KEY
      ? { "api-key": process.env.QDRANT_API_KEY }
      : {}),
    ...(options.headers || {}),
  };

  const body =
    options.body === undefined ? undefined : JSON.stringify(options.body);

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
    body,
  });
}

async function qdrantJson(path, options = {}) {
  const response = await qdrantFetch(path, options);

  if (!response.ok) {
    throw httpError(503, `Qdrant returned status ${response.status}.`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function ensureQdrantCollection() {
  const collectionPath = `/collections/${encodeURIComponent(QDRANT_COLLECTION)}`;
  const response = await qdrantFetch(collectionPath);

  if (response.status === 404) {
    await qdrantJson(collectionPath, {
      method: "PUT",
      body: {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      },
    });
  } else if (!response.ok) {
    throw httpError(503, `Qdrant returned status ${response.status}.`);
  }

  qdrantReady = true;
}

let embeddingExtractorPromise;

function getEmbeddingExtractor() {
  if (!embeddingExtractorPromise) {
    embeddingExtractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }

  return embeddingExtractorPromise;
}

async function productVector(product) {
  const extractor = await getEmbeddingExtractor();
  const text = [
    product.Category,
    product.Brand,
    product.Model_Name,
    product.Processor,
    product.OS,
    product.Connectivity,
    product.Description,
  ].filter(Boolean).join(". ");
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

async function makePoint(product) {
  return {
    id: pointId(product.Gadget_ID),
    vector: await productVector(product),
    payload: {
      productId: product.Gadget_ID,
      gadgetId: product.Gadget_ID,
      Category: product.Category,
      category: product.Category,
      Price_INR: product.Price_INR,
      priceINR: product.Price_INR,
      RAM_GB: product.RAM_GB,
      Storage_GB: product.Storage_GB,
      Available: product.Available ?? true,
    },
  };
}

async function indexProduct(product) {
  if (!qdrantReady) return false;

  try {
    await qdrantJson(
      `/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points?wait=true`,
      {
        method: "PUT",
        body: { points: [await makePoint(publicProduct(product))] },
      },
    );
    return true;
  } catch (error) {
    console.error("Qdrant product indexing failed:", error.message);
    return false;
  }
}

async function removeProductPoint(productId) {
  if (!qdrantReady) return false;

  try {
    await qdrantJson(
      `/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points/delete?wait=true`,
      {
        method: "POST",
        body: { points: [pointId(productId)] },
      },
    );
    return true;
  } catch (error) {
    console.error("Qdrant product deletion failed:", error.message);
    return false;
  }
}

async function loadShopUser(req) {
  const { userId } = getAuth(req);
  if (!userId) return null;

  const user = await clerkClient.users.getUser(userId);

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? "",
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    role: user.publicMetadata?.role === "admin" ? "admin" : "user",
  };
}

async function requireAdmin(req, res, next) {
  try {
    const user = await loadShopUser(req);

    if (!user) {
      res.status(401).json({ error: "Please sign in." });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ error: "Admin access is required." });
      return;
    }

    req.shopUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

function sendError(res, error, fallback) {
  const statusCode = error.statusCode || 500;
  console.error(fallback, error.message);
  res.status(statusCode).json({
    error: statusCode < 500 ? error.message : fallback,
  });
}

async function rebuildSemanticIndex() {
  if (!qdrantReady || !products) return;

  try {
    const allProducts = await products.find({}).toArray();
    console.log(`Rebuilding Qdrant semantic index for ${allProducts.length} products...`);

    for (let start = 0; start < allProducts.length; start += 8) {
      const points = await Promise.all(
        allProducts
          .slice(start, start + 8)
          .map((product) => makePoint(publicProduct(product))),
      );

      await qdrantJson(
        `/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points?wait=true`,
        { method: "PUT", body: { points } },
      );
    }

    console.log(`Qdrant semantic index ready: ${allProducts.length} products indexed.`);
  } catch (error) {
    console.error("Qdrant semantic index rebuild failed:", error.message);
  }
}

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Set MONGODB_URI to a MongoDB instance reachable from this app.",
    );
  }
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("Set up Clerk before starting the API server.");
  }

  const { clerkMiddleware, getAuth: getClerkAuth } =
    await import("@clerk/express");
  const { createClerkClient } = await import("@clerk/backend");

  getAuth = getClerkAuth;
  clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const database = client.db(process.env.MONGODB_DB || "shopsense");

  products = database.collection("products");
  const wishlists = database.collection("wishlists");

  await products.createIndex({ Gadget_ID: 1 }, { unique: true });
  await wishlists.createIndex({ userId: 1 }, { unique: true });

  app.use(clerkMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/status", (_req, res) => {
    res.json({ mongo: true, qdrant: qdrantReady });
  });

  app.get("/api/me", async (req, res) => {
    try {
      const user = await loadShopUser(req);
      res.json(
        user
          ? { authenticated: true, ...user }
          : { authenticated: false, role: null },
      );
    } catch (error) {
      sendError(res, error, "Could not read the signed-in user.");
    }
  });

  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await products.distinct("Category");
      res.json(categories.filter(Boolean).sort());
    } catch (error) {
      sendError(res, error, "Could not load categories.");
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const clauses = [];
      const search = String(req.query.q || "").trim();
      const category = String(req.query.category || "").trim();
      const minPrice = optionalNumber(req.query.minPrice, "Minimum price");
      const maxPrice = optionalNumber(req.query.maxPrice, "Maximum price");

      if (search) {
        const exactBrand = await products.findOne({
          Brand: { $regex: `^${escapeRegex(search)}$`, $options: "i" },
        });

        clauses.push(
          exactBrand
            ? {
                Brand: {
                  $regex: `^${escapeRegex(exactBrand.Brand)}$`,
                  $options: "i",
                },
              }
            : {
                $or: [
                  { Brand: { $regex: escapeRegex(search), $options: "i" } },
                  {
                    Model_Name: { $regex: escapeRegex(search), $options: "i" },
                  },
                  { Processor: { $regex: escapeRegex(search), $options: "i" } },
                  {
                    Description: { $regex: escapeRegex(search), $options: "i" },
                  },
                ],
              },
        );
      }

      if (category) clauses.push({ Category: category });

      const priceRange = {};
      if (minPrice !== null) priceRange.$gte = minPrice;
      if (maxPrice !== null) priceRange.$lte = maxPrice;
      if (Object.keys(priceRange).length)
        clauses.push({ Price_INR: priceRange });

      if (req.query.available === "true") {
        clauses.push({
          $or: [{ Available: true }, { Available: { $exists: false } }],
        });
      } else if (req.query.available === "false") {
        clauses.push({ Available: false });
      }

      const filter = clauses.length ? { $and: clauses } : {};
      const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
      const pageSize = Math.min(
        100,
        Math.max(1, Number.parseInt(req.query.pageSize, 10) || 24),
      );

      const sortBy = req.query.sortBy === "name" ? "name" : "price";
      const direction = req.query.sortOrder === "desc" ? -1 : 1;
      const sort =
        sortBy === "name"
          ? { Brand: direction, Model_Name: direction }
          : { Price_INR: direction };

      const [items, total] = await Promise.all([
        products
          .find(filter)
          .sort(sort)
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .toArray(),
        products.countDocuments(filter),
      ]);

      res.json({
        items: items.map(publicProduct),
        total,
        page,
        pageSize,
      });
    } catch (error) {
      sendError(res, error, "Could not load products.");
    }
  });

  app.get("/api/semantic-search", async (req, res) => {
    try {
      const query = String(req.query.q || "").trim();

      if (!query) {
        return res.status(400).json({
          error: "Please provide a search query using the q parameter.",
        });
      }

      if (query.length > 500) {
        return res.status(400).json({
          error: "Search query must be 500 characters or fewer.",
        });
      }

      const maxPrice = optionalNumber(req.query.maxPrice, "Maximum price");

      const minRAM = optionalNumber(req.query.minRAM, "Minimum RAM");

      if (minRAM !== null && minRAM < 0) {
        return res.status(400).json({
          error: "Minimum RAM cannot be negative.",
        });
      }

      if (maxPrice !== null && maxPrice < 0) {
        return res.status(400).json({
          error: "Maximum price cannot be negative.",
        });
      }

      const category = String(req.query.category || "").trim();

      const processor = String(req.query.processor || "")
        .trim()
        .toLowerCase();

      const extractor = await getEmbeddingExtractor();

      const output = await extractor(query, {
        pooling: "mean",
        normalize: true,
      });

      const vector = Array.from(output.data);

      const qdrantFilter = {
        must: [],
      };

      if (category) {
        qdrantFilter.must.push({
          key: "category",
          match: { value: category },
        });
      }

      if (maxPrice !== null) {
        qdrantFilter.must.push({
          key: "priceINR",
          range: { lte: maxPrice },
        });
      }

      const searchOptions = {
        query: vector,
        limit: 20,
        with_payload: true,
      };

      if (qdrantFilter.must.length > 0) {
        searchOptions.filter = qdrantFilter;
      }

      console.log(
        "Semantic search filters:",
        JSON.stringify(searchOptions.filter || {}),
      );

      const searchResult = await qdrant.query(QDRANT_COLLECTION, searchOptions);

      const matches = searchResult.points || [];

      const ids = matches
        .map((match) => match.payload?.gadgetId)
        .filter(Boolean);

      const currentProducts = ids.length
        ? await products
            .find({
              Gadget_ID: { $in: ids },
            })
            .toArray()
        : [];

      const productsById = new Map(
        currentProducts.map((product) => [String(product.Gadget_ID), product]),
      );

      const items = matches
        .map((match) => {
          const gadgetId = String(match.payload?.gadgetId || "");
          const product = productsById.get(gadgetId);

          if (!product) return null;

          return {
            ...publicProduct(product),
            semanticScore: Number(match.score.toFixed(4)),
          };
        })
        .filter(Boolean)

        .filter((product) => {
          return minRAM === null || Number(product.RAM_GB) >= minRAM;
        })
        .filter((product) => {
          if (!processor) return true;

          const productProcessor = String(product.Processor || "")
            .toLowerCase()
            .replace(/\s+/g, " ");

          const requestedProcessor = processor.replace(/\s+/g, " ").trim();

          if (/^i[3579]$/.test(requestedProcessor)) {
            return new RegExp(`\\b${requestedProcessor}\\b`, "i").test(
              productProcessor,
            );
          }

          if (/^m[123]$/.test(requestedProcessor)) {
            return new RegExp(`\\b${requestedProcessor}\\b`, "i").test(
              productProcessor,
            );
          }

          return productProcessor.includes(requestedProcessor);
        });

      res.json({
        query,
        total: items.length,
        items,
      });
    } catch (error) {
      console.error("Semantic search error:", error);
      console.error("Qdrant response:", error.data);
      sendError(res, error, "Could not perform semantic product search.");
    }
  });

  // Get the signed-in user's wishlist
  app.get("/api/wishlist", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const wishlist = await wishlists.findOne({ userId: user.id });
      const ids = wishlist?.productIds || [];

      const savedProducts = await products
        .find({ Gadget_ID: { $in: ids } })
        .toArray();

      // Preserve the order in which products were saved.
      const productMap = new Map(
        savedProducts.map((product) => [
          product.Gadget_ID,
          publicProduct(product),
        ]),
      );

      res.json({
        items: ids.map((id) => productMap.get(id)).filter(Boolean),
      });
    } catch (error) {
      sendError(res, error, "Could not load wishlist.");
    }
  });

  // Add a product to the signed-in user's wishlist
  app.post("/api/wishlist/:id", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const product = await products.findOne({
        Gadget_ID: req.params.id,
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }

      await wishlists.updateOne(
        { userId: user.id },
        {
          $addToSet: { productIds: product.Gadget_ID },
          $setOnInsert: { userId: user.id },
        },
        { upsert: true },
      );

      res.json({ saved: true, productId: product.Gadget_ID });
    } catch (error) {
      sendError(res, error, "Could not save product to wishlist.");
    }
  });

  // Remove a product from the signed-in user's wishlist
  app.delete("/api/wishlist/:id", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      await wishlists.updateOne(
        { userId: user.id },
        { $pull: { productIds: req.params.id } },
      );

      res.json({ removed: true, productId: req.params.id });
    } catch (error) {
      sendError(res, error, "Could not remove product from wishlist.");
    }
  });

  // Get the signed-in user's cart
  app.get("/api/cart", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const carts = products.db.collection("carts");
      const cart = await carts.findOne({ userId: user.id });
      const ids = cart?.items || [];

      const savedProducts = await products
        .find({ Gadget_ID: { $in: ids.map((item) => item.productId) } })
        .toArray();

      const productMap = new Map(
        savedProducts.map((product) => [
          product.Gadget_ID,
          publicProduct(product),
        ]),
      );

      res.json({
        items: ids
          .map((item) => {
            const product = productMap.get(item.productId);
            return product ? { product, quantity: item.quantity } : null;
          })
          .filter(Boolean),
      });
    } catch (error) {
      sendError(res, error, "Could not load cart.");
    }
  });

  // Add a product to the cart or increase its quantity
  app.post("/api/cart/:id", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const product = await products.findOne({
        Gadget_ID: req.params.id,
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found." });
      }

      const carts = products.db.collection("carts");
      const cart = await carts.findOne({ userId: user.id });
      const existingItem = cart?.items?.find(
        (item) => item.productId === product.Gadget_ID,
      );

      if (existingItem) {
        await carts.updateOne(
          {
            userId: user.id,
            "items.productId": product.Gadget_ID,
          },
          { $inc: { "items.$.quantity": 1 } },
        );
      } else {
        await carts.updateOne(
          { userId: user.id },
          {
            $push: {
              items: {
                productId: product.Gadget_ID,
                quantity: 1,
              },
            },
            $setOnInsert: { userId: user.id },
          },
          { upsert: true },
        );
      }

      res.json({ added: true, productId: product.Gadget_ID });
    } catch (error) {
      sendError(res, error, "Could not add product to cart.");
    }
  });

  // Remove a product completely from the cart
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const carts = products.db.collection("carts");

      await carts.updateOne(
        { userId: user.id },
        { $pull: { items: { productId: req.params.id } } },
      );

      res.json({ removed: true, productId: req.params.id });
    } catch (error) {
      sendError(res, error, "Could not remove product from cart.");
    }
  });

  // Create an order from the signed-in user's cart
  app.post("/api/orders", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const carts = products.db.collection("carts");
      const orders = products.db.collection("orders");

      const cart = await carts.findOne({ userId: user.id });

      if (!cart?.items?.length) {
        return res.status(400).json({ error: "Your cart is empty." });
      }

      // Read current product details and prices from MongoDB.
      const productIds = cart.items.map((item) => item.productId);

      const savedProducts = await products
        .find({ Gadget_ID: { $in: productIds } })
        .toArray();

      const productMap = new Map(
        savedProducts.map((product) => [product.Gadget_ID, product]),
      );

      const orderItems = [];

      for (const item of cart.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          return res.status(400).json({
            error: `Product ${item.productId} is no longer available.`,
          });
        }

        const quantity = Number(item.quantity);
        const price = Number(product.Price_INR);

        if (
          !Number.isSafeInteger(quantity) ||
          quantity < 1 ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          return res.status(400).json({
            error: "The cart contains invalid product information.",
          });
        }

        orderItems.push({
          productId: product.Gadget_ID,
          brand: product.Brand,
          modelName: product.Model_Name,
          category: product.Category,
          priceINR: price,
          quantity,
          subtotalINR: price * quantity,
        });
      }

      const totalINR = orderItems.reduce(
        (total, item) => total + item.subtotalINR,
        0,
      );

      if (!Number.isSafeInteger(totalINR)) {
        return res.status(400).json({
          error: "The order total is invalid.",
        });
      }

      const now = new Date();

      const order = {
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        items: orderItems,
        totalINR,
        status: "Pending",
        createdAt: now,
        updatedAt: now,
      };

      const result = await orders.insertOne(order);

      // Clear the cart only after MongoDB successfully saves the order.
      await carts.updateOne({ userId: user.id }, { $set: { items: [] } });

      res.status(201).json({
        message: "Order placed successfully.",
        order: {
          ...order,
          _id: result.insertedId,
        },
      });
    } catch (error) {
      sendError(res, error, "Could not place order.");
    }
  });

  // Get orders belonging to the signed-in customer
  app.get("/api/orders", async (req, res) => {
    try {
      const user = await loadShopUser(req);

      if (!user) {
        return res.status(401).json({ error: "Please sign in." });
      }

      const orders = products.db.collection("orders");

      const customerOrders = await orders
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      res.json({ orders: customerOrders });
    } catch (error) {
      sendError(res, error, "Could not load your order history.");
    }
  });

  // Get all orders for the admin dashboard
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = products.db.collection("orders");

      const result = await orders
        .find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      res.json({ orders: result });
    } catch (error) {
      sendError(res, error, "Could not load orders.");
    }
  });

  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const orders = products.db.collection("orders");

      const [totalOrders, statusCounts] = await Promise.all([
        orders.countDocuments({}),
        orders
          .aggregate([
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

      const orderStatuses = {
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Cancelled: 0,
      };

      for (const item of statusCounts) {
        if (Object.hasOwn(orderStatuses, item._id)) {
          orderStatuses[item._id] = item.count;
        }
      }

      res.json({
        totalOrders,
        orderStatuses,
      });
    } catch (error) {
      sendError(res, error, "Could not load order analytics.");
    }
  });

  // Update an order's status from the admin dashboard
  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      const { status } = req.body;

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid order status.",
          allowedStatuses,
        });
      }

      const { ObjectId } = require("mongodb");

      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid order ID." });
      }

      const orders = products.db.collection("orders");

      const result = await orders.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Order not found." });
      }

      res.json({ updated: true, orderId: req.params.id, status });
    } catch (error) {
      sendError(res, error, "Could not update order status.");
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const result = await clerkClient.users.getUserList({
        limit: 100,
        orderBy: "-created_at",
      });

      const users = result.data.map((user) => {
        const primaryEmail = user.emailAddresses.find(
          (email) => email.id === user.primaryEmailAddressId,
        );

        return {
          id: user.id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: primaryEmail?.emailAddress || "",
          role: user.publicMetadata?.role === "admin" ? "admin" : "customer",
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
        };
      });

      res.json({
        users,
        totalCount: result.totalCount,
      });
    } catch (error) {
      sendError(res, error, "Could not load users.");
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const { role } = req.body;
      const targetUserId = req.params.id;

      if (!["admin", "customer"].includes(role)) {
        return res.status(400).json({
          error: "Role must be admin or customer.",
        });
      }

      const currentAdmin = req.shopUser;

      if (currentAdmin.id === targetUserId && role !== "admin") {
        return res.status(400).json({
          error: "You cannot remove your own admin role.",
        });
      }

      const targetUser = await clerkClient.users.getUser(targetUserId);

      if (!targetUser) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      await clerkClient.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          role,
        },
      });

      res.json({
        message: "User role updated successfully.",
        user: {
          id: targetUserId,
          role,
        },
      });
    } catch (error) {
      sendError(res, error, "Could not update user role.");
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await products.findOne({ Gadget_ID: req.params.id });

      if (!product) {
        res.status(404).json({ error: "Product not found." });
        return;
      }

      res.json(publicProduct(product));
    } catch (error) {
      sendError(res, error, "Could not load product.");
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const product = normalizeProduct(req.body);
      product.Gadget_ID = `G-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

      await products.insertOne(product);
      const vectorIndexed = await indexProduct(product);

      res.status(201).json({
        product: publicProduct(product),
        vectorIndexed,
      });
    } catch (error) {
      sendError(res, error, "Could not create product.");
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const existing = await products.findOne({ Gadget_ID: req.params.id });

      if (!existing) {
        res.status(404).json({ error: "Product not found." });
        return;
      }

      const updated = normalizeProduct(req.body, existing);
      await products.updateOne({ Gadget_ID: req.params.id }, { $set: updated });

      const saved = { ...existing, ...updated };
      const vectorIndexed = await indexProduct(saved);

      res.json({ product: publicProduct(saved), vectorIndexed });
    } catch (error) {
      sendError(res, error, "Could not update product.");
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const existing = await products.findOne({ Gadget_ID: req.params.id });

      if (!existing) {
        res.status(404).json({ error: "Product not found." });
        return;
      }

      await products.deleteOne({ Gadget_ID: req.params.id });
      const vectorDeleted = await removeProductPoint(req.params.id);

      res.json({ deleted: true, vectorDeleted });
    } catch (error) {
      sendError(res, error, "Could not delete product.");
    }
  });

  app.post("/api/admin/reindex", requireAdmin, async (_req, res) => {
    try {
      if (!qdrantReady) {
        res
          .status(503)
          .json({ error: "Qdrant is not configured or reachable." });
        return;
      }

      const allProducts = await products.find({}).toArray();

      for (let start = 0; start < allProducts.length; start += 64) {
        const points = await Promise.all(
          allProducts
            .slice(start, start + 64)
            .map((product) => makePoint(publicProduct(product))),
        );

        await qdrantJson(
          `/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points?wait=true`,
          { method: "PUT", body: { points } },
        );
      }

      res.json({ indexed: allProducts.length });
    } catch (error) {
      sendError(res, error, "Could not index products.");
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      if (!qdrantReady) {
        res.status(503).json({
          error: "Qdrant is not configured or reachable.",
        });
        return;
      }

      const preferences = {
        budget: optionalNumber(req.body.budget, "Budget"),
        minRamGb: optionalNumber(req.body.minRamGb, "Minimum RAM"),
        minStorageGb: optionalNumber(req.body.minStorageGb, "Minimum storage"),
        category: String(req.body.category || "").trim(),
        requirements: String(req.body.requirements || "")
          .trim()
          .slice(0, 200),
        onlyAvailable: req.body.onlyAvailable !== false,
      };

      if (
        !preferences.budget &&
        !preferences.category &&
        !preferences.minRamGb &&
        !preferences.minStorageGb &&
        !preferences.requirements
      ) {
        res.status(400).json({
          error: "Enter a budget, category, minimum specs, or requirements.",
        });
        return;
      }

      const must = [];

      if (preferences.category) {
        must.push({
          key: "Category",
          match: { value: preferences.category },
        });
      }
      if (preferences.budget) {
        must.push({
          key: "Price_INR",
          range: { lte: preferences.budget },
        });
      }
      if (preferences.minRamGb) {
        must.push({
          key: "RAM_GB",
          range: { gte: preferences.minRamGb },
        });
      }
      if (preferences.minStorageGb) {
        must.push({
          key: "Storage_GB",
          range: { gte: preferences.minStorageGb },
        });
      }
      if (preferences.onlyAvailable) {
        must.push({
          key: "Available",
          match: { value: true },
        });
      }

      const extractor = await getEmbeddingExtractor();
      const recommendationQuery = [
        preferences.requirements,
        preferences.category,
        preferences.budget ? `budget up to ${preferences.budget} rupees` : "",
        preferences.minRamGb ? `at least ${preferences.minRamGb} GB RAM` : "",
        preferences.minStorageGb ? `at least ${preferences.minStorageGb} GB storage` : "",
      ].filter(Boolean).join(". ");
      const queryOutput = await extractor(recommendationQuery, {
        pooling: "mean",
        normalize: true,
      });

      const result = await qdrantJson(
        `/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points/query`,
        {
          method: "POST",
          body: {
            query: Array.from(queryOutput.data),
            limit: 40,
            with_payload: true,
            ...(must.length ? { filter: { must } } : {}),
          },
        },
      );

      const points = result.result?.points || [];
      const ids = points
        .map((point) => point.payload?.productId)
        .filter(Boolean);

      const matchingProducts = await products
        .find({ Gadget_ID: { $in: ids } })
        .toArray();

      const byId = new Map(
        matchingProducts.map((product) => [
          product.Gadget_ID,
          publicProduct(product),
        ]),
      );

      const recommendations = points
        .map((point) => {
          const product = byId.get(point.payload?.productId);
          if (!product) return null;

          const reasons = [];
          if (preferences.category)
            reasons.push(`Matches ${preferences.category}`);
          if (preferences.budget) reasons.push("Within your budget");
          if (preferences.minRamGb) reasons.push("Meets your RAM requirement");
          if (preferences.minStorageGb)
            reasons.push("Meets your storage requirement");
          if (preferences.requirements)
            reasons.push("Matches your product requirements");

          return {
            ...product,
            score: Math.round(Number(point.score || 0) * 100),
            reasons,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      res.json({ recommendations });
    } catch (error) {
      sendError(res, error, "Could not find recommendations.");
    }
  });

  if (qdrantConfigured()) {
    try {
      await ensureQdrantCollection();
      console.log("Qdrant collection ready.");
    } catch (error) {
      console.error("Qdrant is not ready:", error.message);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShopSense API listening on port ${PORT}`);
    if (qdrantReady) {
      void rebuildSemanticIndex();
    } else {
      console.warn("AI semantic search is disabled until QDRANT_URL is configured and reachable.");
    }
  });
}

startServer().catch((error) => {
  console.error("ShopSense API could not start:", error.message);
  process.exitCode = 1;
});

