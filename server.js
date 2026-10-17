
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 5000;

const client = new MongoClient(
  "mongodb://127.0.0.1:27017"
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("ShopSense backend is running!");
});

// Get products from MongoDB
app.get("/api/products", async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 50, 1),
      500
    );

    const products = await client
      .db("shopsense")
      .collection("products")
      .find({})
      .sort({ Gadget_ID: 1 })
      .limit(limit)
      .toArray();

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      error: "Could not fetch products"
    });
  }
});

// Get one product by its ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await client
      .db("shopsense")
      .collection("products")
      .findOne({ Gadget_ID: req.params.id });

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);

    res.status(500).json({
      error: "Could not fetch product"
    });
  }
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    await client.connect();

    console.log("Connected to MongoDB!");

    app.listen(PORT, () => {
      console.log(
        `ShopSense running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    await client.close().catch(() => {});
    process.exitCode = 1;
  }
}

startServer();
