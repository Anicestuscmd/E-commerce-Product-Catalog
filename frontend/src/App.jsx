import { useEffect, useMemo, useState } from "react";
import { SignIn, SignUp, useUser, useClerk } from "@clerk/react";
import { Route, Switch } from "wouter";
import "./App.css";

const imageByCategory = {
  Mobile:
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85",
  Laptop:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
  Notebook:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
  Tablet:
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=85",
  Headphones:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  Keyboard:
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85",
  Mouse:
    "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85",
  default:
    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=900&q=85",
};
// Use category-level photos until individual product image URLs are available in the database.
const safeImage = (category) =>
  imageByCategory[category] || imageByCategory.default;
const productImage = (product) =>
  product?.Image_URL ||
  product?.Image_Url ||
  product?.imageUrl ||
  product?.image_url ||
  product?.image ||
  safeImage(product?.Category);

function Icon({ name, size = 18, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false",
    className: `app-icon ${className}`.trim(),
  };

  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-7h6v7" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 5 5" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="10" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </>
    ),
    "shopping-cart": (
      <>
        <circle cx="9" cy="20" r="1.3" />
        <circle cx="18" cy="20" r="1.3" />
        <path d="M2.5 3.5h2l2.4 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.5L21 8H6" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.5Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    chevron: <path d="m7 10 5 5 5-5" />,
    truck: (
      <>
        <path d="M3 6h11v11H3zM14 10h4l3 3v4h-7" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8M12 13v9" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    edit: (
      <>
        <path d="m14 5 5 5" />
        <path d="M4 20l4-.8L20 7a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" />
        <path d="M10 10v6M14 10v6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    "chart-no-axes-combined": (
      <>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-5 5" />
        <path d="M15 9h4v4" />
      </>
    ),
    "indian-rupee": (
      <>
        <path d="M6 3h12M6 8h12M6 3c7 0 7 10 0 10h2l8 8" />
        <path d="M6 13h6" />
      </>
    ),
    "shopping-bag": (
      <>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    "trending-up": (
      <>
        <path d="m3 17 6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </>
    ),
    laptop: (
      <>
        <rect x="4" y="4" width="16" height="12" rx="1.5" />
        <path d="M2 20h20l-2-4H4l-2 4Z" />
      </>
    ),
    smartphone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M10 5h4M11 18h2" />
      </>
    ),
    tablet: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    headphones: (
      <>
        <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
        <rect x="3" y="13" width="4" height="7" rx="1.5" />
        <rect x="17" y="13" width="4" height="7" rx="1.5" />
      </>
    ),
    keyboard: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M6 13h.01M9 13h.01M12 13h.01M15 13h.01M8 16h8" />
      </>
    ),
    mouse: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="6" />
        <path d="M12 2v6" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
        <path d="m19 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z" />
        <path d="m5 2 .7 2.3L8 5l-2.3.7L5 8l-.7-2.3L2 5l2.3-.7L5 2Z" />
      </>
    ),
    "check-circle": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    "circle-alert": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.package}</svg>;
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function printDemoInvoice(order) {
  if (!order) return;

  const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);

  const orderId = String(order._id || "DEMO").slice(-8).toUpperCase();
  const invoiceNumber = `SS-DEMO-${orderId}`;
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");
  const items = Array.isArray(order.items) ? order.items : [];
  const rows = items.map((item) => `
    <tr>
      <td>${escapeHtml(item.brand)} ${escapeHtml(item.modelName)}<br><small>${escapeHtml(item.category || "")}</small></td>
      <td class="number">${Number(item.quantity || 0)}</td>
      <td class="number">${escapeHtml(formatPrice(item.priceINR))}</td>
      <td class="number">${escapeHtml(formatPrice(item.subtotalINR ?? Number(item.priceINR || 0) * Number(item.quantity || 0)))}</td>
    </tr>`).join("");

  const invoiceWindow = window.open("", "_blank", "width=900,height=700");
  if (!invoiceWindow) {
    alert("Please allow pop-ups for ShopSense to open the demo invoice.");
    return;
  }

  invoiceWindow.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${invoiceNumber} — ShopSense Demo Invoice</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 32px; color: #1d2a38; font: 14px/1.5 Arial, sans-serif; }
  .invoice { max-width: 780px; margin: auto; }
  header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; border-bottom: 2px solid #17364f; padding-bottom: 18px; }
  h1 { margin: 0; color: #17364f; font-size: 30px; }
  h2 { margin: 0 0 6px; font-size: 18px; }
  p { margin: 4px 0; }
  .muted { color: #617182; }
  .demo { margin: 20px 0; padding: 10px 12px; background: #fff4d6; border: 1px solid #e7c76a; border-radius: 6px; font-weight: bold; }
  .meta { display: flex; justify-content: space-between; gap: 20px; margin: 24px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #17364f; color: white; text-align: left; }
  th, td { padding: 11px 10px; border-bottom: 1px solid #dbe2e8; }
  .number { text-align: right; white-space: nowrap; }
  .total { margin-left: auto; width: 260px; display: flex; justify-content: space-between; padding: 14px 0; border-top: 2px solid #17364f; font-size: 18px; font-weight: bold; }
  .actions { margin-top: 28px; display: flex; gap: 10px; }
  button { border: 0; border-radius: 6px; padding: 11px 16px; background: #17364f; color: white; cursor: pointer; font-weight: bold; }
  @media print { body { padding: 0; } .actions { display: none; } }
  @media (max-width: 600px) { body { padding: 16px; } header, .meta { flex-direction: column; } }
</style>
</head>
<body>
<div class="invoice">
<header>
  <div><h1>ShopSense</h1><p class="muted">E-commerce Product Catalog</p></div>
  <div><h2>INVOICE</h2><p><strong>${invoiceNumber}</strong></p><p class="muted">Date: ${escapeHtml(orderDate)}</p></div>
</header>
<div class="demo">DEMO INVOICE — No online payment was processed. This is not a tax invoice or proof of payment.</div>
<div class="meta">
  <div><h2>Bill to</h2><p>${escapeHtml(order.customerName || "ShopSense Customer")}</p><p>${escapeHtml(order.customerEmail || "")}</p></div>
  <div><h2>Order details</h2><p>Order ID: #${orderId}</p><p>Status: ${escapeHtml(order.status || "Pending")}</p></div>
</div>
<table>
<thead><tr><th>Product</th><th class="number">Qty</th><th class="number">Unit price</th><th class="number">Subtotal</th></tr></thead>
<tbody>${rows || '<tr><td colspan="4">No items found for this order.</td></tr>'}</tbody>
</table>
<div class="total"><span>Total</span><span>${escapeHtml(formatPrice(order.totalINR))}</span></div>
<p class="muted">Prepared for project demonstration. Taxes, shipping, and payment settlement are not calculated in this demo invoice.</p>
<div class="actions"><button onclick="window.print()">Print / Save as PDF</button><button onclick="window.close()">Close</button></div>
</div>
<script>window.onload = () => { window.focus(); };</script>
</body>
</html>`);
  invoiceWindow.document.close();
}

async function readApiJson(response, fallbackMessage = "The server returned an unexpected response.") {
  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  if (!contentType.toLowerCase().includes("application/json")) {
    const looksLikeHtml = /^(?:<!doctype\\s+html|<html)\\b/i.test(bodyText.trimStart());
    if (looksLikeHtml) {
      const title = bodyText.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.trim();
      const detail = [
        `HTTP ${response.status}`,
        response.url ? `URL: ${response.url}` : "",
        title ? `Page: ${title}` : "",
      ].filter(Boolean).join(" — ");
      throw new Error(
        `ShopSense expected JSON but received an HTML page (${detail}). This usually means the request reached the frontend fallback instead of the API. Check the Vercel deployment and /api rewrite.`
      );
    }
    throw new Error(`${fallbackMessage} (HTTP ${response.status}; content type: ${contentType || "unknown"}).`);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    throw new Error(`ShopSense received invalid JSON from ${response.url || "the API"} (HTTP ${response.status}).`);
  }
}

async function fetchWithRetry(url, attempts = 3) {
  let lastResponse;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    lastResponse = await fetch(url, { cache: "no-store" });
    if (![502, 503, 504].includes(lastResponse.status) || attempt === attempts) {
      return lastResponse;
    }
    // Render/Vercel transient gateway errors can occur while the free backend wakes up.
    await new Promise((resolve) => setTimeout(resolve, 700 * attempt));
  }
  return lastResponse;
}

async function fetchProductPage(url) {
  const response = await fetchWithRetry(url);
  if (![502, 503, 504].includes(response.status)) return response;

  // If Vercel's external rewrite is failing, try the same public endpoint on Render.
  const directUrl = url.replace(
    /^\/api\//,
    "https://shopsense-api-syrq.onrender.com/api/",
  );
  try {
    return await fetchWithRetry(directUrl, 2);
  } catch {
    return response;
  }
}

async function fetchAllProducts() {
  const firstResponse = await fetchProductPage("/api/products?page=1&pageSize=100");
  const firstData = await readApiJson(
    firstResponse,
    `Could not retrieve products (HTTP ${firstResponse.status}).`,
  );
  if (!firstResponse.ok) {
    throw new Error(`Could not retrieve products (HTTP ${firstResponse.status}).`);
  }
  if (Array.isArray(firstData)) return firstData;
  const allProducts = [...(firstData.items || [])];
  const pageSize = firstData.pageSize || 100;
  const totalPages = Math.ceil(
    (firstData.total || allProducts.length) / pageSize,
  );
  for (let page = 2; page <= totalPages; page++) {
    const response = await fetchProductPage(
      `/api/products?page=${page}&pageSize=${pageSize}`,
    );
    const data = await readApiJson(
      response,
      `Could not load product page ${page} (HTTP ${response.status}).`,
    );
    if (!response.ok) {
      throw new Error(`Could not load product page ${page} (HTTP ${response.status}).`);
    }
    allProducts.push(...(data.items || []));
  }
  return allProducts;
}

const categoryIcon = (category) =>
  ({
    Mobile: "smartphone",
    Laptop: "laptop",
    Notebook: "laptop",
    Tablet: "tablet",
    Headphones: "headphones",
    Keyboard: "keyboard",
    Mouse: "mouse",
    Accessories: "package",
  })[category] || "grid";

function App() {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  const [products, setProducts] = useState([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminCategory, setAdminCategory] = useState("All");
  const [adminPage, setAdminPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [searchMode, setSearchMode] = useState("keyword");
  const [aiResults, setAiResults] = useState([]);
  const [alternativeProduct, setAlternativeProduct] = useState(null);
  const [alternativeResults, setAlternativeResults] = useState([]);
  const [alternativeLoading, setAlternativeLoading] = useState(false);
  const [alternativeError, setAlternativeError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [tradeoffMode, setTradeoffMode] = useState(false);
  const [tradeoffWeights, setTradeoffWeights] = useState({
    price: 80,
    durability: 50,
    performance: 70,
    battery: 50,
    portability: 50,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [adminOrders, setAdminOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersLoading, setCustomerOrdersLoading] = useState(false);
  const [customerOrdersError, setCustomerOrdersError] = useState("");
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userPage, setUserPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [orderAnalytics, setOrderAnalytics] = useState({
    totalOrders: 0,
    orderStatuses: {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    },
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [featuredTab, setFeaturedTab] = useState("All");
  const [detailTab, setDetailTab] = useState("specifications");
  const [detailQty, setDetailQty] = useState(1);
  const [heroIndex, setHeroIndex] = useState(0);
  const [orderFilter, setOrderFilter] = useState("All");
  const [draftProduct, setDraftProduct] = useState({
    Category: "Mobile",
    Brand: "",
    Model_Name: "",
    Description: "",
    Price_INR: "",
    Processor: "",
    RAM_GB: "",
    Storage_GB: "",
    Available: true,
  });

  const dashboardStats = useMemo(() => {
    const categoryCounts = products.reduce((counts, product) => {
      const category = product.Category || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    const productPrices = products
      .map((product) => Number(product.Price_INR))
      .filter((price) => Number.isFinite(price) && price >= 0);

    const averagePrice =
      productPrices.length > 0
        ? productPrices.reduce((sum, price) => sum + price, 0) /
          productPrices.length
        : 0;

    return {
      totalProducts: products.length,
      totalCategories: Object.keys(categoryCounts).length,
      categoryCounts,
      averagePrice,
    };
  }, [products]);

  const adminFilteredProducts = useMemo(() => {
    const search = adminSearch.trim().toLowerCase();

    return products.filter((product) => {
      const searchableText = [
        product.Gadget_ID,
        product.Brand,
        product.Model_Name,
        product.Category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(search);
      const matchesCategory =
        adminCategory === "All" || product.Category === adminCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, adminSearch, adminCategory]);

  const adminPageSize = 10;
  const adminTotalPages = Math.max(
    1,
    Math.ceil(adminFilteredProducts.length / adminPageSize),
  );

  const adminVisibleProducts = adminFilteredProducts.slice(
    (adminPage - 1) * adminPageSize,
    adminPage * adminPageSize,
  );

  const filteredAdminUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return adminUsers.filter((account) => {
      const fullName =
        `${account.firstName || ""} ${account.lastName || ""}`.trim();

      const matchesSearch = [fullName, account.email, account.id]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));

      const matchesRole =
        userRoleFilter === "All" ||
        account.role === userRoleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [adminUsers, userSearch, userRoleFilter]);

  const userPageSize = 10;
  const userTotalPages = Math.max(
    1,
    Math.ceil(filteredAdminUsers.length / userPageSize),
  );

  const visibleAdminUsers = filteredAdminUsers.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize,
  );

  async function openProduct(productId) {
    setDetailsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}`,
      );
      if (!response.ok) throw new Error("Could not load product details.");
      setSelectedProduct(await readApiJson(response));
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  function extractMaxPrice(query) {
    const normalized = query.toLowerCase().replace(/,/g, "");

    const match = normalized.match(
      /(?:under|below|less than|within|up to|upto|budget(?: of)?|maximum(?: of)?|max(?:imum)?(?: price)?(?: of)?)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k)?\b/i,
    );

    if (!match) {
      return "";
    }

    const amount = Number(match[1]) * (match[2] ? 1000 : 1);

    return Number.isFinite(amount) && amount > 0 ? String(amount) : "";
  }

  function extractMinRAM(query) {
    const normalized = query.toLowerCase();

    const match = normalized.match(
      /(?:at least|minimum|min(?:imum)?|with)\s*(\d+)\s*gb\s*ram|\b(\d+)\s*gb\s*ram\b/i,
    );

    if (!match) {
      return "";
    }

    const amount = Number(match[1] || match[2]);

    return Number.isFinite(amount) && amount > 0 ? String(amount) : "";
  }

  function extractProcessor(query) {
    const normalized = query.toLowerCase();

    const match = normalized.match(
      /\b(ryzen\s*[3579]|intel\s*i[3579]|core\s*i[3579]|i[3579]|m[123])\b/i,
    );

    if (!match) {
      return "";
    }

    return match[1]
      .replace(/\s+/g, " ")
      .replace(/^core\s+/i, "")
      .toLowerCase();
  }

  function extractTradeoffPriorities(query) {
    const normalized = query.toLowerCase();

    const priorities = [];

    if (
      /\b(cheap|cheapest|affordable|budget|low price|save money)\b/.test(
        normalized,
      )
    ) {
      priorities.push("price");
    }

    if (/\b(ram|memory|multitasking)\b/.test(normalized)) {
      priorities.push("ram");
    }

    if (/\b(processor|cpu|intel|ryzen|performance|faster)\b/.test(normalized)) {
      priorities.push("processor");
    }

    if (/\b(storage|ssd|hard drive|space for files)\b/.test(normalized)) {
      priorities.push("storage");
    }

    if (/\b(battery|battery life|long lasting)\b/.test(normalized)) {
      priorities.push("battery");
    }

    return priorities;
  }

  function detectMissingInformation(query) {
    const normalized = query.toLowerCase();
    const missing = [];

    const hasBudget =
      /\b(under|below|less than|within|up to|upto|budget|maximum|max)\b/.test(
        normalized,
      ) || /₹\s*\d+|\b\d+\s*k\b|\b\d{4,}\b/.test(normalized);

    const hasUsage =
      /\b(programming|coding|gaming|study|student|work|office|travel|editing|design|machine learning|business)\b/.test(
        normalized,
      );

    const hasRAM = /\b\d+\s*gb\s*ram\b|\b(ram|memory|multitasking)\b/.test(
      normalized,
    );

    const hasProcessor =
      /\b(processor|cpu|intel|ryzen|core i[3579]|i[3579])\b/.test(normalized);

    const hasStorage = /\b(storage|ssd|hard drive|space for files)\b/.test(
      normalized,
    );

    if (!hasBudget) missing.push("Your budget");
    if (!hasUsage) missing.push("What you'll use the product for");

    if (/\blaptop\b|\bcomputer\b|\bpc\b/.test(normalized)) {
      if (!hasRAM) missing.push("Preferred RAM");
      if (!hasProcessor) missing.push("Processor preference");
      if (!hasStorage) missing.push("Storage capacity");
    }

    return missing;
  }

  function compareProductTradeoffs(products, weights) {
    if (!products.length) return [];

    const getNumber = (product, field) => {
      const value = Number(product[field]);
      return Number.isFinite(value) ? value : null;
    };

    const range = (field) => {
      const values = products
        .map((product) => getNumber(product, field))
        .filter((value) => value !== null);

      return {
        min: values.length ? Math.min(...values) : null,
        max: values.length ? Math.max(...values) : null,
      };
    };

    const priceRange = range("Price_INR");
    const ramRange = range("RAM_GB");
    const storageRange = range("Storage_GB");
    const batteryRange = range("Battery_mAh");

    const normalize = (value, limits, higherIsBetter = true) => {
      if (value === null || limits.min === null || limits.max === null) {
        return null;
      }

      if (limits.max === limits.min) return 1;

      const score = (value - limits.min) / (limits.max - limits.min);

      return higherIsBetter ? score : 1 - score;
    };

    const processorScore = (product) => {
      const value = String(product.Processor || "").toLowerCase();

      if (value.includes("i9") || value.includes("ryzen 9")) return 1;
      if (value.includes("i7") || value.includes("ryzen 7")) return 0.8;
      if (value.includes("i5") || value.includes("ryzen 5")) return 0.6;
      if (value.includes("i3") || value.includes("ryzen 3")) return 0.4;
      if (/\bm[123]\b/.test(value)) return 0.7;

      return null;
    };

    return products
      .map((product) => {
        const dimensions = {
          price: normalize(getNumber(product, "Price_INR"), priceRange, false),
          performance: [
            normalize(processorScore(product), { min: 0, max: 1 }),
            normalize(getNumber(product, "RAM_GB"), ramRange),
            normalize(getNumber(product, "Storage_GB"), storageRange),
          ].filter((value) => value !== null),
          battery: normalize(getNumber(product, "Battery_mAh"), batteryRange),
        };

        const performanceScore = dimensions.performance.length
          ? dimensions.performance.reduce((sum, value) => sum + value, 0) /
            dimensions.performance.length
          : null;

        const availableScores = {
          price: dimensions.price,
          performance: performanceScore,
          battery: dimensions.battery,
        };

        const weightedScores = Object.entries(availableScores).filter(
          ([key, score]) => {
            return score !== null && weights[key] > 0;
          },
        );

        const totalWeight = weightedScores.reduce(
          (sum, [key]) => sum + weights[key],
          0,
        );

        const score = totalWeight
          ? weightedScores.reduce(
              (sum, [key, value]) => sum + value * weights[key],
              0,
            ) / totalWeight
          : 0;

        return {
          ...product,
          tradeoffScore: Math.round(score * 100),
        };
      })
      .sort((a, b) => b.tradeoffScore - a.tradeoffScore);
  }

  function explainProductTradeoff(product, alternative) {
    if (!product || !alternative) {
      return { gains: [], losses: [] };
    }

    const gains = [];
    const losses = [];

    const priceDiff = Number(product.Price_INR) - Number(alternative.Price_INR);

    if (priceDiff < 0) {
      gains.push(
        `You save ₹${Math.abs(priceDiff).toLocaleString("en-IN")} compared with the alternative.`,
      );
    } else if (priceDiff > 0) {
      losses.push(
        `You pay ₹${priceDiff.toLocaleString("en-IN")} more than the alternative.`,
      );
    }

    const comparisons = [
      {
        field: "RAM_GB",
        label: "RAM",
        unit: "GB",
        benefit:
          "More RAM can help with multitasking and demanding applications.",
        drawback: "Less RAM may limit demanding multitasking.",
      },
      {
        field: "Storage_GB",
        label: "storage",
        unit: "GB",
        benefit:
          "More storage provides additional room for files and applications.",
        drawback: "Less storage leaves less room for files and applications.",
      },
      {
        field: "Battery_mAh",
        label: "battery capacity",
        unit: "mAh",
        benefit:
          "The recorded battery capacity is higher; actual battery life may differ.",
        drawback:
          "The recorded battery capacity is lower; actual battery life may differ.",
      },
    ];

    for (const item of comparisons) {
      const current = Number(product[item.field]);
      const other = Number(alternative[item.field]);

      if (
        !Number.isFinite(current) ||
        !Number.isFinite(other) ||
        current === other
      ) {
        continue;
      }

      const difference = Math.abs(current - other);

      if (current > other) {
        gains.push(
          `${difference.toLocaleString("en-IN")} ${item.unit} more ${item.label}. ${item.benefit}`,
        );
      } else {
        losses.push(
          `${difference.toLocaleString("en-IN")} ${item.unit} less ${item.label}. ${item.drawback}`,
        );
      }
    }

    if (gains.length === 0) {
      gains.push("No clear advantage in the available specifications.");
    }

    if (losses.length === 0) {
      losses.push("No clear disadvantage in the available specifications.");
    }

    return { gains, losses };
  }

  async function runAISearch() {
    const query = search.trim();

    if (!query) {
      setAiError("Describe what kind of product you need.");
      setAiResults([]);
      return;
    }

    setAiLoading(true);
    setAiError("");
    setSelectedProduct(null);

    try {
      const params = new URLSearchParams({ q: query });

      const minRAM = extractMinRAM(query);

      if (minRAM !== "") {
        params.set("minRAM", minRAM);
      }

      if (category !== "All") {
        params.set("category", category);
      }

      const processor = extractProcessor(query);

      if (processor !== "") {
        params.set("processor", processor);
      }

      const queryMaxPrice = extractMaxPrice(query);
      const effectiveMaxPrice = maxPrice !== "" ? maxPrice : queryMaxPrice;

      if (effectiveMaxPrice !== "") {
        params.set("maxPrice", effectiveMaxPrice);
      }

      const response = await fetch(`/api/semantic-search?${params.toString()}`);

      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || "AI search failed.");
      }

      setAiResults(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setAiError(error.message || "Could not perform AI search.");
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  }

  const findAlternatives = async (product) => {
    setAlternativeProduct(product);
    setAlternativeResults([]);
    setAlternativeError("");
    setAlternativeLoading(true);

    try {
      const query = [
        product.Brand,
        product.Model_Name,
        product.Category,
        "similar alternatives",
      ]
        .filter(Boolean)
        .join(" ");

      const params = new URLSearchParams({
        q: query,
        category: product.Category || "",
      });

      const response = await fetch(`/api/semantic-search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Could not find alternatives. Please try again.");
      }

      const data = await readApiJson(response);

      const alternatives = (data.items || []).filter(
        (item) => String(item.Gadget_ID) !== String(product.Gadget_ID),
      );

      setAlternativeResults(alternatives.slice(0, 4));

      if (alternatives.length === 0) {
        setAlternativeError(
          "No similar alternatives found. Try another product.",
        );
      }
    } catch (error) {
      setAlternativeError(
        error.message || "Something went wrong while finding alternatives.",
      );
    } finally {
      setAlternativeLoading(false);
    }
  };

  async function changeUserRole(account) {
    const newRole = account.role === "admin" ? "customer" : "admin";
    const action = newRole === "admin" ? "promote" : "remove admin access from";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${account.email || account.firstName || "this user"}?`,
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/users/${encodeURIComponent(account.id)}/role`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Could not update user role.");
      }

      setAdminUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === account.id ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      window.alert(error.message || "Could not update user role.");
    }
  }

  function startAddProduct() {
    console.log("Before opening:", showProductForm);

    setEditingProduct(null);
    setDraftProduct({
      Category: "Mobile",
      Brand: "",
      Model_Name: "",
      Description: "",
      Price_INR: "",
      Processor: "",
      RAM_GB: "",
      Storage_GB: "",
      Available: true,
    });

    setShowProductForm(true);
    console.log("Add Product handler finished");
  }
  function startEditProduct(product) {
    setEditingProduct(product);
    setDraftProduct({
      Category: product.Category || "Mobile",
      Brand: product.Brand || "",
      Model_Name: product.Model_Name || "",
      Description: product.Description || "",
      Price_INR: product.Price_INR ?? "",
      Processor: product.Processor || "",
      RAM_GB: product.RAM_GB ?? "",
      Storage_GB: product.Storage_GB ?? "",
      Available: product.Available !== false,
    });
    setShowProductForm(true);
  }
  async function saveProduct(event) {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    try {
      const payload = {
        ...draftProduct,
        Price_INR: Number(draftProduct.Price_INR),
        RAM_GB: Number(draftProduct.RAM_GB || 0),
        Storage_GB: Number(draftProduct.Storage_GB || 0),
      };
      const url = editingProduct
        ? `/api/products/${encodeURIComponent(editingProduct.Gadget_ID)}`
        : "/api/products";
      const response = await fetch(url, {
        method: editingProduct ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readApiJson(response).catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Could not save product.");
      setShowProductForm(false);
      setEditingProduct(null);
      setProducts(await fetchAllProducts());
      setCategory("All");
      setSearch("");
      setMinPrice("");
      setMaxPrice("");
      setSort("default");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProduct(false);
    }
  }
  async function deleteProduct(product) {
    if (!window.confirm(`Delete ${product.Brand} ${product.Model_Name}?`))
      return;
    setError("");
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(product.Gadget_ID)}`,
        { method: "DELETE", credentials: "include" },
      );
      const result = await readApiJson(response).catch(() => ({}));
      if (!response.ok)
        throw new Error(result.error || "Could not delete product.");
      setProducts((current) =>
        current.filter((item) => item.Gadget_ID !== product.Gadget_ID),
      );
      if (selectedProduct?.Gadget_ID === product.Gadget_ID)
        setSelectedProduct(null);
    } catch (err) {
      setError(err.message);
    }
  }
  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await fetchAllProducts());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setFavorites([]);
      return;
    }

    let cancelled = false;

    async function loadWishlist() {
      setWishlistLoading(true);

      try {
        const response = await fetch("/api/wishlist", {
          credentials: "include",
        });

        const data = await readApiJson(response);

        if (!response.ok) {
          throw new Error(data.error || "Could not load wishlist.");
        }

        if (!cancelled) {
          setFavorites((data.items || []).map((product) => product.Gadget_ID));
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
        }
      } finally {
        if (!cancelled) {
          setWishlistLoading(false);
        }
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setCartItems([]);
      setCartCount(0);
      setCartLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCart() {
      setCartLoading(true);

      try {
        const response = await fetch("/api/cart", {
          credentials: "include",
        });

        const data = await readApiJson(response);

        if (!response.ok) {
          throw new Error(data.error || "Could not load cart.");
        }

        if (!cancelled) {
          const items = data.items || [];
          setCartItems(items);
          setCartCount(items.reduce((total, item) => total + item.quantity, 0));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Could not load cart:", error);
        }
      } finally {
        if (!cancelled) {
          setCartLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin || !showUsers) {
      return;
    }

    let cancelled = false;

    async function loadAdminUsers() {
      setUsersLoading(true);
      setUsersError("");

      try {
        const response = await fetch("/api/admin/users", {
          credentials: "include",
        });

        const data = await readApiJson(response);

        if (!response.ok) {
          throw new Error(data.error || "Could not load users.");
        }

        if (!cancelled) {
          setAdminUsers(data.users || []);
        }
      } catch (error) {
        if (!cancelled) {
          setUsersError(error.message || "Could not load users.");
        }
      } finally {
        if (!cancelled) {
          setUsersLoading(false);
        }
      }
    }

    loadAdminUsers();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin, showUsers, user?.id]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isAdmin || !showAdmin) {
      return;
    }

    let cancelled = false;

    async function loadOrderAnalytics() {
      setAnalyticsLoading(true);
      setAnalyticsError("");

      try {
        const response = await fetch("/api/admin/analytics", {
          credentials: "include",
        });

        const data = await readApiJson(response);

        if (!response.ok) {
          throw new Error(data.error || "Could not load order analytics.");
        }

        if (!cancelled) {
          setOrderAnalytics({
            totalOrders: data.totalOrders ?? 0,
            orderStatuses: {
              Pending: data.orderStatuses?.Pending ?? 0,
              Processing: data.orderStatuses?.Processing ?? 0,
              Shipped: data.orderStatuses?.Shipped ?? 0,
              Delivered: data.orderStatuses?.Delivered ?? 0,
              Cancelled: data.orderStatuses?.Cancelled ?? 0,
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setAnalyticsError(error.message || "Could not load order analytics.");
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadOrderAnalytics();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin, showAdmin]);

  useEffect(() => {
    if (
      !isLoaded ||
      !isSignedIn ||
      !isAdmin ||
      (!showOrders && !showAnalytics)
    ) {
      return;
    }

    let cancelled = false;

    async function loadAdminOrders() {
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const response = await fetch("/api/admin/orders");

        if (!response.ok) {
          const data = await readApiJson(response).catch(() => ({}));
          throw new Error(data.error || "Could not load orders.");
        }

        const data = await readApiJson(response);

        if (!cancelled) {
          setAdminOrders(data.orders || []);
        }
      } catch (error) {
        if (!cancelled) {
          setOrdersError(error.message || "Could not load orders.");
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    }

    loadAdminOrders();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isAdmin, showOrders, showAnalytics, user?.id]);

  // Load order history for the signed-in customer
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !showOrderHistory) {
      return;
    }

    let cancelled = false;

    async function loadCustomerOrders() {
      setCustomerOrdersLoading(true);
      setCustomerOrdersError("");

      try {
        const response = await fetch("/api/orders", {
          credentials: "include",
        });

        const data = await readApiJson(response);

        if (!response.ok) {
          throw new Error(data.error || "Could not load order history.");
        }

        if (!cancelled) {
          setCustomerOrders(data.orders || []);
        }
      } catch (error) {
        if (!cancelled) {
          setCustomerOrdersError(
            error.message || "Could not load order history.",
          );
        }
      } finally {
        if (!cancelled) {
          setCustomerOrdersLoading(false);
        }
      }
    }

    loadCustomerOrders();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, showOrderHistory, user?.id]);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.Category).filter(Boolean))],
    [products],
  );
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const exactBrand =
      q && products.some((p) => (p.Brand || "").trim().toLowerCase() === q);
    return products
      .filter((p) => {
        const brand = (p.Brand || "").toLowerCase();
        const model = (p.Model_Name || "").toLowerCase();
        const text =
          `${brand} ${model} ${p.Category || ""} ${p.Description || ""} ${p.Processor || ""}`.toLowerCase();
        const matchesSearch =
          !q || (exactBrand ? brand.trim() === q : text.includes(q));
        return (
          matchesSearch &&
          (category === "All" || p.Category === category) &&
          (minPrice === "" || Number(p.Price_INR) >= Number(minPrice)) &&
          (maxPrice === "" || Number(p.Price_INR) <= Number(maxPrice))
        );
      })
      .sort((a, b) =>
        sort === "low"
          ? Number(a.Price_INR) - Number(b.Price_INR)
          : sort === "high"
            ? Number(b.Price_INR) - Number(a.Price_INR)
            : 0,
      );
  }, [products, search, category, minPrice, maxPrice, sort]);

  const tradeoffPriorities = extractTradeoffPriorities(search);

  const displayedProducts =
    searchMode === "ai"
      ? tradeoffMode
        ? compareProductTradeoffs(aiResults, tradeoffWeights)
        : aiResults
      : filteredProducts;

  const featured = products
    .filter((p) => featuredTab === "All" || p.Category === featuredTab)
    .slice(0, 6);
  const featuredTabs = [
    ["All", "All"],
    ["Mobile", "Mobiles"],
    ["Laptop", "Laptops"],
    ["Tablet", "Tablets"],
    ["Headphones", "Audio"],
    ["Accessories", "Accessories"],
  ];
  const displayedCategories = [
    "Mobile",
    "Laptop",
    "Tablet",
    "Headphones",
    "Accessories",
    "Keyboard",
    "Mouse",
  ];
  const heroSlides = [
    {
      title: ["Latest Tech.", "Smarter Choices."],
      text: "Explore smartphones, laptops, tablets, accessories and more at the best prices.",
      image: imageByCategory.Laptop,
    },
    {
      title: ["Flagship Phones.", "Everyday Prices."],
      text: "Compare cameras, chips and battery life across the newest mobiles.",
      image: imageByCategory.Mobile,
    },
    {
      title: ["Sound That", "Moves You."],
      text: "Headphones and accessories picked to match how you listen.",
      image: imageByCategory.Headphones,
    },
  ];
  const heroSlide = heroSlides[heroIndex % heroSlides.length];
  const updateDraft = (key, value) =>
    setDraftProduct((d) => ({ ...d, [key]: value }));

  async function toggleFavorite(id) {
    const alreadySaved = favorites.includes(id);

    try {
      const response = await fetch(`/api/wishlist/${encodeURIComponent(id)}`, {
        method: alreadySaved ? "DELETE" : "POST",
        credentials: "include",
      });

      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Could not update wishlist.");
      }

      setFavorites((previous) =>
        alreadySaved
          ? previous.filter((item) => item !== id)
          : previous.includes(id)
            ? previous
            : [...previous, id],
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function placeOrder() {
    if (checkoutLoading) return;

    setCheckoutLoading(true);
    setOrderConfirmation(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await readApiJson(response);

      if (!response.ok) {
        throw new Error(data.error || "Could not place order.");
      }

      setOrderConfirmation(data.order);
      setCartItems([]);
      setCartCount(0);
      setShowCart(false);
      alert("Order placed successfully!");
    } catch (error) {
      alert(error.message || "Could not place order.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function refreshCart() {
    const cartResponse = await fetch("/api/cart", { credentials: "include" });
    const cartData = await readApiJson(cartResponse);
    if (!cartResponse.ok) throw new Error(cartData.error || "Could not refresh cart.");
    const items = cartData.items || [];
    setCartItems(items);
    setCartCount(items.reduce((total, item) => total + item.quantity, 0));
  }

  async function changeCartQuantity(product, quantity, delta) {
    const target = quantity + delta;
    if (target < 1 || target > 10) return;
    try {
      const id = encodeURIComponent(product.Gadget_ID);
      if (delta > 0) {
        await fetch(`/api/cart/${id}`, { method: "POST", credentials: "include" });
      } else {
        await fetch(`/api/cart/${id}`, { method: "DELETE", credentials: "include" });
        for (let i = 0; i < target; i++) {
          await fetch(`/api/cart/${id}`, { method: "POST", credentials: "include" });
        }
      }
      await refreshCart();
    } catch (error) {
      alert(error.message || "Could not update cart.");
    }
  }

  async function clearCart() {
    try {
      for (const { product } of cartItems) {
        await fetch(`/api/cart/${encodeURIComponent(product.Gadget_ID)}`, {
          method: "DELETE",
          credentials: "include",
        });
      }
      await refreshCart();
    } catch (error) {
      alert(error.message || "Could not clear cart.");
    }
  }

  async function addSelectedToCart(buyNow) {
    if (!isSignedIn) return;
    try {
      for (let i = 0; i < detailQty; i++) {
        const response = await fetch(
          `/api/cart/${encodeURIComponent(selectedProduct.Gadget_ID)}`,
          { method: "POST", credentials: "include" },
        );
        const data = await readApiJson(response);
        if (!response.ok) {
          throw new Error(data.error || "Could not add product to cart.");
        }
      }
      const cartResponse = await fetch("/api/cart", { credentials: "include" });
      const cartData = await readApiJson(cartResponse);
      if (!cartResponse.ok) {
        throw new Error(cartData.error || "Could not refresh cart.");
      }
      const items = cartData.items || [];
      setCartItems(items);
      setCartCount(items.reduce((total, item) => total + item.quantity, 0));
      setDetailQty(1);
      if (buyNow) {
        setSelectedProduct(null);
        setShowCart(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("Product added to your cart!");
      }
    } catch (error) {
      alert(error.message || "Could not add product to cart.");
    }
  }

  return (
    <div className={showAdmin && isAdmin ? "app-shell admin-mode" : "app-shell"}>
      <header className="topbar">
        <a
          className="brand-logo"
          href="#home"
          onClick={() => {
            setShowOrderHistory(false);
            setShowWishlist(false);
            setShowCart(false);
            setShowAdmin(false);
            setShowProfile(false);
            setSelectedProduct(null);
            setSelectedCategory(false);
          }}
        >
          <span className="brand-mark">S</span>
          <span>
            Shop<span>Sense</span>
          </span>
        </a>

        <div className="header-search-container">
          <form
            className="header-search"
            onSubmit={(e) => {
              e.preventDefault();

              setShowOrderHistory(false);
              setShowWishlist(false);
              setShowCart(false);
              setShowAdmin(false);
              setShowProfile(false);
              setSelectedProduct(null);

              if (searchMode === "ai") {
                runAISearch();
              }

              window.scrollTo({ top: 0, behavior: "smooth" });

              setTimeout(() => {
                document.getElementById("catalog")?.scrollIntoView({
                  behavior: "smooth",
                });
              }, 100);
            }}
          >
            <Icon name="search" size={16} />

            <input
              aria-label="Search products"
              placeholder="Search for products, brands, or specifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="submit" aria-label="Submit search">
              <Icon name="search" size={17} />
            </button>
          </form>
        </div>

        <nav className="main-nav">
          <button
            onClick={() => {
              setShowWishlist(false);
              setSelectedProduct(null);
              setShowCart(false);
              setShowAdmin(false);
              setShowOrderHistory(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Icon name="home" />
            Home
          </button>

          <button
            onClick={() => {
              setShowWishlist(false);
              setSelectedProduct(null);
              setShowCart(false);
              setShowAdmin(false);
              setSelectedCategory(false);
              document
                .getElementById("catalog")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Icon name="grid" />
            Categories
          </button>


          <button
            onClick={() => {
              setShowAdmin(false);
              setSelectedProduct(null);
              setShowWishlist(false);
              setShowCart(true);
              setShowOrderHistory(false);
            }}
          >
            <Icon name="cart" />
            Cart
            {cartCount > 0 && <b className="nav-count">{cartCount}</b>}
          </button>

          {isAdmin && (
            <button
              className="mobile-admin-link"
              onClick={() => {
                setShowAdmin(true);
                setShowProfile(false);
                setShowCart(false);
                setShowWishlist(false);
                setShowOrderHistory(false);
                setSelectedProduct(null);
                setShowUsers(false);
                setShowOrders(false);
                setShowAnalytics(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Icon name="chart-no-axes-combined" />
              Admin
            </button>
          )}

        </nav>

        <div className="profile-wrap">
          <button
            className="profile-button"
            onClick={() => setShowProfile(!showProfile)}
          >
            <span className="avatar">
              {(
                user?.firstName ||
                user?.emailAddresses?.[0]?.emailAddress ||
                "U"
              )
                .slice(0, 1)
                .toUpperCase()}
            </span>
            <span>{user?.firstName || "Account"}</span>
            <Icon name="chevron" size={14} />
          </button>
          {showProfile && (
            <div className="profile-menu">
              <span className="profile-email">
                {user?.emailAddresses?.[0]?.emailAddress}
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowAdmin(!showAdmin);
                    setShowProfile(false);
                    setSelectedProduct(null);
                  }}
                >
                  Admin dashboard
                </button>
              )}
              <button
                onClick={() => {
                  setShowOrderHistory(true);
                  setShowCart(false);
                  setShowWishlist(false);
                  setSelectedProduct(null);
                  setShowAdmin(false);
                  setShowProfile(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                My orders
              </button>
              <button
                onClick={() => {
                  setShowWishlist(true);
                  setShowOrderHistory(false);
                  setShowCart(false);
                  setSelectedProduct(null);
                  setShowAdmin(false);
                  setShowProfile(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Wishlist{favorites.length > 0 ? ` (${favorites.length})` : ""}
              </button>
              <button onClick={() => signOut({ redirectUrl: "/sign-in" })}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {showAdmin && isAdmin ? (
        <main className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-brand">
              <span className="brand-mark">S</span> ShopSense
            </div>
            <p>WORKSPACE</p>

            <button
              className={
                !showOrders && !showUsers && !showAnalytics ? "selected" : ""
              }
              onClick={() => {
                setShowOrders(false);
                setShowUsers(false);
                setShowAnalytics(false);
              }}
            >
              <Icon name="grid" />
              Dashboard
            </button>

            <button
              onClick={() => {
                setShowAdmin(false);
                document
                  .getElementById("catalog")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Icon name="package" />
              Products
            </button>
            <button
              className={showOrders ? "selected" : ""}
              onClick={() => {
                setShowOrders(true);
                setShowUsers(false);
              }}
            >
              <Icon name="cart" />
              Orders
            </button>

            <button
              className={showUsers ? "selected" : ""}
              onClick={() => {
                setShowUsers(true);
                setShowOrders(false);
                setShowAnalytics(false);
              }}
            >
              <Icon name="user" />
              Users
            </button>

            <button
              className={showAnalytics ? "selected" : ""}
              onClick={() => {
                setShowOrders(false);
                setShowUsers(false);
                setShowAnalytics(true);
              }}
            >
              <Icon name="chart-no-axes-combined" />
              Analytics
            </button>

            <button onClick={() => setShowAdmin(false)}>
              <Icon name="home" />
              Storefront
            </button>
            <button
              className="sidebar-bottom"
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
            >
              ↪ Sign out
            </button>
          </aside>

          <section className="admin-content">
            {showOrders ? (
              <>
                <div className="admin-title-row">
                  <div>
                    <p className="eyebrow">WORKSPACE</p>
                    <h1>Orders Management</h1>
                    <p>View customer orders and update their status.</p>
                  </div>

                  <button
                    className="button-outline"
                    onClick={() => setShowOrders(false)}
                  >
                    Back to Dashboard
                  </button>
                </div>

                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : ordersError ? (
                  <p className="error-message">{ordersError}</p>
                ) : adminOrders.length === 0 ? (
                  <div className="empty-state">
                    <Icon name="cart" />
                    <h3>No orders yet</h3>
                    <p>Customer orders will appear here after checkout.</p>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders.map((order) => (
                          <tr key={order._id}>
                            <td>
                              #{String(order._id).slice(-8).toUpperCase()}
                            </td>
                            <td>
                              <strong>
                                {order.customerName || "Customer"}
                              </strong>
                              <br />
                              <small>{order.customerEmail || "No email"}</small>
                            </td>
                            <td>
                              {order.items?.reduce(
                                (count, item) => count + item.quantity,
                                0,
                              ) || 0}
                            </td>
                            <td>
                              {Number(order.totalINR || 0).toLocaleString(
                                "en-IN",
                                {
                                  style: "currency",
                                  currency: "INR",
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </td>
                            <td>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                  )
                                : "—"}
                            </td>

                            <td>
                              <div className="order-status-cell">
                                <span
                                  className={`order-status-badge ${(
                                    order.status || "Pending"
                                  ).toLowerCase()}`}
                                >
                                  {order.status || "Pending"}
                                </span>

                                <select
                                  value={order.status || "Pending"}
                                  onChange={async (event) => {
                                    const newStatus = event.target.value;

                                    try {
                                      const response = await fetch(
                                        `/api/admin/orders/${order._id}/status`,
                                        {
                                          method: "PATCH",
                                          credentials: "include",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            status: newStatus,
                                          }),
                                        },
                                      );

                                      const data = await readApiJson(response);

                                      if (!response.ok) {
                                        throw new Error(
                                          data.error ||
                                            "Could not update order.",
                                        );
                                      }

                                      setAdminOrders((previous) =>
                                        previous.map((item) =>
                                          item._id === order._id
                                            ? { ...item, status: newStatus }
                                            : item,
                                        ),
                                      );
                                    } catch (error) {
                                      alert(
                                        error.message ||
                                          "Could not update order.",
                                      );
                                    }
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : showUsers ? (
              <>
                <div className="admin-title-row">
                  <div>
                    <p className="eyebrow">WORKSPACE</p>
                    <h1>User Management</h1>
                    <p>View registered ShopSense accounts.</p>
                  </div>

                  <button
                    className="button-outline"
                    onClick={() => setShowUsers(false)}
                  >
                    Back to Dashboard
                  </button>
                </div>

                <div className="admin-user-stats">
                  <div className="stat-card">
                    <span className="stat-icon blue">
                      <Icon name="users" />
                    </span>
                    <div>
                      <small>Registered Users</small>
                      <strong>{adminUsers.length}</strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon purple">
                      <Icon name="shield" />
                    </span>
                    <div>
                      <small>Administrators</small>
                      <strong>
                        {
                          adminUsers.filter(
                            (account) => account.role === "admin",
                          ).length
                        }
                      </strong>
                    </div>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="admin-table-card">
                    <p className="admin-users-message">
                      Loading registered users...
                    </p>
                  </div>
                ) : usersError ? (
                  <div className="admin-table-card">
                    <p className="admin-users-error">{usersError}</p>
                    <button
                      className="button-outline"
                      onClick={() => setShowUsers(false)}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="admin-table-card">
                    <div className="table-heading">
                      <div>
                        <h2>Registered Accounts</h2>
                        <p>User information provided by Clerk.</p>
                      </div>
                      <span>{adminUsers.length} users</span>
                    </div>

                    <div className="admin-product-filters">
                      <input
                        type="search"
                        placeholder="Search users by name, email or ID..."
                        value={userSearch}
                        onChange={(event) => {
                          setUserSearch(event.target.value);
                          setUserPage(1);
                        }}
                        aria-label="Search users"
                      />

                      <select
                        value={userRoleFilter}
                        onChange={(event) => {
                          setUserRoleFilter(event.target.value);
                          setUserPage(1);
                        }}
                        aria-label="Filter users by role"
                      >
                        <option value="All">All roles</option>
                        <option value="Admin">Admins</option>
                        <option value="Customer">Customers</option>
                      </select>

                      <span className="admin-result-count">
                        {filteredAdminUsers.length} users found
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table className="products-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Last Sign-in</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleAdminUsers.map((account) => (
                            <tr key={account.id}>
                              <td>
                                {`${account.firstName} ${account.lastName}`.trim() ||
                                  "Unnamed user"}
                              </td>
                              <td>{account.email || "No email available"}</td>
                              <td>
                                <span
                                  className={`admin-role-badge ${
                                    account.role === "admin"
                                      ? "admin"
                                      : "customer"
                                  }`}
                                >
                                  {account.role === "admin"
                                    ? "Admin"
                                    : "Customer"}
                                </span>
                              </td>
                              <td>
                                {account.createdAt
                                  ? new Date(
                                      account.createdAt,
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                {account.lastSignInAt
                                  ? new Date(
                                      account.lastSignInAt,
                                    ).toLocaleDateString()
                                  : "Never"}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="button-outline"
                                  onClick={() => changeUserRole(account)}
                                  disabled={account.id === user?.id}
                                >
                                  {account.role === "admin"
                                    ? "Make Customer"
                                    : "Make Admin"}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {visibleAdminUsers.length === 0 && (
                            <tr>
                              <td colSpan={6}>No registered users found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="admin-pagination">
                      <span>
                        Page {userPage} of {userTotalPages}
                      </span>

                      <div>
                        <button
                          type="button"
                          className="button-outline"
                          disabled={userPage <= 1}
                          onClick={() => setUserPage((page) => page - 1)}
                        >
                          Previous
                        </button>

                        <button
                          type="button"
                          className="button-outline"
                          disabled={userPage >= userTotalPages}
                          onClick={() => setUserPage((page) => page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : showAnalytics ? (
              <>
                <div className="admin-title-row">
                  <div>
                    <p className="eyebrow">WORKSPACE</p>
                    <h1>Analytics Overview</h1>
                    <p>Understand your store performance at a glance.</p>
                  </div>

                  <button
                    className="button-outline"
                    onClick={() => setShowAnalytics(false)}
                  >
                    Back to Dashboard
                  </button>
                </div>

                <div className="stat-grid">
                  <div className="stat-card">
                    <span className="stat-icon blue">
                      <Icon name="indian-rupee" />
                    </span>
                    <div>
                      <small>Recorded Order Revenue</small>
                      <strong>
                        {formatPrice(
                          adminOrders
                            .filter((order) => order.status !== "Cancelled")
                            .reduce(
                              (sum, order) => sum + Number(order.totalINR || 0),
                              0,
                            ),
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon green">
                      <Icon name="shopping-bag" />
                    </span>
                    <div>
                      <small>Total Orders</small>
                      <strong>{adminOrders.length}</strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon purple">
                      <Icon name="package" />
                    </span>
                    <div>
                      <small>Products</small>
                      <strong>{dashboardStats.totalProducts}</strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon orange">
                      <Icon name="chart-no-axes-combined" />
                    </span>
                    <div>
                      <small>Average Order Value</small>
                      <strong>
                        {formatPrice(
                          (() => {
                            const completedOrders = adminOrders.filter(
                              (order) => order.status !== "Cancelled",
                            );
                            const revenue = completedOrders.reduce(
                              (sum, order) => sum + Number(order.totalINR || 0),
                              0,
                            );
                            return completedOrders.length
                              ? revenue / completedOrders.length
                              : 0;
                          })(),
                        )}
                      </strong>
                    </div>
                  </div>
                </div>

                {analyticsLoading ? (
                  <div className="admin-table-card">
                    <p>Loading analytics...</p>
                  </div>
                ) : analyticsError ? (
                  <div className="admin-table-card">
                    <p className="error-message">{analyticsError}</p>
                  </div>
                ) : (
                  <>
                    <div className="admin-table-card analytics-sales-card">
                      <div className="table-heading">
                        <div>
                          <h2>Sales Overview</h2>
                          <p>Monthly order revenue for the last 6 months</p>
                        </div>
                        <span className="analytics-live-label">
                          <span /> Based on order records
                        </span>
                      </div>

                      {(() => {
                        const now = new Date();
                        const months = Array.from({ length: 6 }, (_, index) => {
                          const date = new Date(
                            now.getFullYear(),
                            now.getMonth() - 5 + index,
                            1,
                          );

                          return {
                            key: `${date.getFullYear()}-${date.getMonth()}`,
                            label: date.toLocaleDateString("en-IN", {
                              month: "short",
                            }),
                            year: date.getFullYear(),
                            month: date.getMonth(),
                            revenue: 0,
                            orders: 0,
                          };
                        });

                        adminOrders.forEach((order) => {
                          if (!order.createdAt || order.status === "Cancelled")
                            return;

                          const date = new Date(order.createdAt);
                          if (Number.isNaN(date.getTime())) return;

                          const month = months.find(
                            (item) =>
                              item.year === date.getFullYear() &&
                              item.month === date.getMonth(),
                          );

                          if (month) {
                            month.revenue += Number(order.totalINR || 0);
                            month.orders += 1;
                          }
                        });

                        const maxRevenue = Math.max(
                          ...months.map((item) => item.revenue),
                          1,
                        );

                        return (
                          <>
                            <div className="analytics-chart-summary">
                              <div>
                                <span>Total for displayed period</span>
                                <strong>
                                  {formatPrice(
                                    months.reduce(
                                      (sum, item) => sum + item.revenue,
                                      0,
                                    ),
                                  )}
                                </strong>
                              </div>
                              <div>
                                <span>Orders in displayed period</span>
                                <strong>
                                  {months.reduce(
                                    (sum, item) => sum + item.orders,
                                    0,
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div
                              className="analytics-monthly-chart"
                              role="img"
                              aria-label="Monthly revenue chart for the last six months"
                            >
                              {months.map((item) => (
                                <div
                                  className="analytics-month-column"
                                  key={item.key}
                                >
                                  <span className="analytics-month-value">
                                    {item.revenue > 0
                                      ? `₹${item.revenue.toLocaleString("en-IN")}`
                                      : "₹0"}
                                  </span>

                                  <div className="analytics-month-bar-area">
                                    <div
                                      className="analytics-month-bar"
                                      style={{
                                        height: `${Math.max(
                                          item.revenue > 0 ? 4 : 0,
                                          (item.revenue / maxRevenue) * 100,
                                        )}%`,
                                      }}
                                      title={`${item.label}: ${formatPrice(item.revenue)} · ${item.orders} orders`}
                                    />
                                  </div>

                                  <strong>{item.label}</strong>
                                  <span className="analytics-month-orders">
                                    {item.orders} orders
                                  </span>
                                </div>
                              ))}
                            </div>

                            {months.every((item) => item.orders === 0) && (
                              <p className="analytics-chart-empty">
                                No non-cancelled orders were recorded in these
                                six months.
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="admin-analytics-grid">
                      <div className="admin-table-card">
                        <div className="table-heading">
                          <div>
                            <h2>Order Status</h2>
                            <p>Distribution of recorded orders.</p>
                          </div>
                        </div>

                        <div className="analytics-bars">
                          {Object.entries(orderAnalytics.orderStatuses).map(
                            ([status, count]) => {
                              const total = Math.max(adminOrders.length, 1);
                              const percentage = Math.min(
                                100,
                                (Number(count) / total) * 100,
                              );

                              return (
                                <div
                                  className="analytics-bar-item"
                                  key={status}
                                >
                                  <div className="analytics-bar-label">
                                    <span>{status}</span>
                                    <strong>{count}</strong>
                                  </div>
                                  <div className="analytics-bar-track">
                                    <div
                                      className={`analytics-bar-fill status-${status.toLowerCase()}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>

                      <div className="admin-table-card">
                        <div className="table-heading">
                          <div>
                            <h2>Catalog Categories</h2>
                            <p>Products in each category.</p>
                          </div>
                        </div>

                        <div className="analytics-bars">
                          {Object.entries(dashboardStats.categoryCounts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([category, count]) => {
                              const percentage = dashboardStats.totalProducts
                                ? (count / dashboardStats.totalProducts) * 100
                                : 0;

                              return (
                                <div
                                  className="analytics-bar-item"
                                  key={category}
                                >
                                  <div className="analytics-bar-label">
                                    <span>{category}</span>
                                    <strong>{count}</strong>
                                  </div>
                                  <div className="analytics-bar-track">
                                    <div
                                      className="analytics-bar-fill category-bar-fill"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <small className="analytics-percentage">
                                    {percentage.toFixed(1)}% of catalog
                                  </small>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    <div className="admin-table-card analytics-recent-orders">
                      <div className="table-heading">
                        <div>
                          <h2>Recent Orders</h2>
                          <p>Latest orders available in the admin panel.</p>
                        </div>
                        <button
                          className="button-outline"
                          onClick={() => {
                            setShowAnalytics(false);
                            setShowOrders(true);
                          }}
                        >
                          View All Orders
                        </button>
                      </div>

                      <div className="table-scroll">
                        <table className="products-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Date</th>
                              <th>Total</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...adminOrders]
                              .sort(
                                (a, b) =>
                                  new Date(b.createdAt || 0) -
                                  new Date(a.createdAt || 0),
                              )
                              .slice(0, 5)
                              .map((order) => (
                                <tr key={order._id}>
                                  <td>
                                    #{String(order._id).slice(-8).toUpperCase()}
                                  </td>
                                  <td>
                                    {order.createdAt
                                      ? new Date(
                                          order.createdAt,
                                        ).toLocaleDateString("en-IN")
                                      : "—"}
                                  </td>
                                  <td>{formatPrice(order.totalINR || 0)}</td>
                                  <td>
                                    <span
                                      className={`order-status-badge ${(order.status || "Pending").toLowerCase()}`}
                                    >
                                      {order.status || "Pending"}
                                    </span>
                                  </td>
                                </tr>
                              ))}

                            {adminOrders.length === 0 && (
                              <tr>
                                <td colSpan={4}>No orders available yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="admin-table-card top-products-card">
                      <div className="table-heading">
                        <div>
                          <h2>Top-Selling Products</h2>
                          <p>
                            Products ranked by units sold and recorded sales
                            value.
                          </p>
                        </div>
                        <Icon name="trending-up" size={22} />
                      </div>

                      {(() => {
                        const productSales = new Map();

                        adminOrders
                          .filter((order) => order.status !== "Cancelled")
                          .forEach((order) => {
                            (order.items || []).forEach((item) => {
                              const productId = String(item.productId || "");
                              const name = item.modelName || "Product";
                              const brand = item.brand || "";
                              const quantity = Math.max(
                                0,
                                Number(item.quantity || 0),
                              );
                              const unitPrice = Number(item.priceINR || 0);
                              const subtotal = Number(
                                item.subtotalINR ?? unitPrice * quantity,
                              );

                              if (!productId || quantity <= 0) return;

                              const existing = productSales.get(productId) || {
                                key: productId,
                                name,
                                brand,
                                unitsSold: 0,
                                salesValue: 0,
                              };

                              existing.unitsSold += quantity;
                              existing.salesValue += subtotal;
                              productSales.set(productId, existing);
                            });
                          });

                        const topProducts = [...productSales.values()]
                          .sort((a, b) => b.unitsSold - a.unitsSold)
                          .slice(0, 5);

                        const maxUnits = Math.max(
                          ...topProducts.map((product) => product.unitsSold),
                          1,
                        );

                        return topProducts.length > 0 ? (
                          <div className="top-products-list">
                            {topProducts.map((product, index) => (
                              <div
                                className="top-product-row"
                                key={product.key}
                              >
                                <span
                                  className={`top-product-rank rank-${index + 1}`}
                                >
                                  {index + 1}
                                </span>

                                <div className="top-product-info">
                                  <div className="top-product-heading">
                                    <div>
                                      <strong>{product.name}</strong>
                                      <span>
                                        {product.brand || "ShopSense product"}
                                      </span>
                                    </div>

                                    <div className="top-product-metrics">
                                      <strong>{product.unitsSold} units</strong>
                                      <span>
                                        {formatPrice(product.salesValue)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="analytics-bar-track">
                                    <div
                                      className="analytics-bar-fill top-product-bar"
                                      style={{
                                        width: `${(product.unitsSold / maxUnits) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="top-products-empty">
                            <Icon name="package" size={28} />
                            <strong>No product sales yet</strong>
                            <p>
                              Top-selling products will appear after orders
                              contain identifiable product names and quantities.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="admin-title-row">
                  <div>
                    <p className="eyebrow">OVERVIEW</p>
                    <h1>Dashboard</h1>
                    <p>Manage your ShopSense product catalog.</p>
                  </div>
                  <button className="button-primary" onClick={startAddProduct}>
                    <Icon name="plus" /> Add Product
                  </button>
                </div>
                <div className="stat-grid">
                  <div className="stat-card">
                    <span className="stat-icon blue">
                      <Icon name="package" />
                    </span>
                    <div>
                      <small>Total Products</small>
                      <strong>{dashboardStats.totalProducts}</strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon green">
                      <Icon name="grid" />
                    </span>
                    <div>
                      <small>Categories</small>
                      <strong>{dashboardStats.totalCategories}</strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon purple">
                      <Icon name="shopping-bag" />
                    </span>
                    <div>
                      <small>Total Orders</small>
                      <strong>
                        {analyticsLoading ? "..." : orderAnalytics.totalOrders}
                      </strong>
                    </div>
                  </div>

                  <div className="stat-card">
                    <span className="stat-icon orange">
                      <Icon name="indian-rupee" />
                    </span>
                    <div>
                      <small>Average Product Price</small>
                      <strong>
                        {formatPrice(dashboardStats.averagePrice)}
                      </strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon purple">
                      <Icon name="user" />
                    </span>
                    <div>
                      <small>Account Role</small>
                      <strong>Admin</strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <span className="stat-icon orange">
                      <Icon name="shield" />
                    </span>
                    <div>
                      <small>API Status</small>
                      <strong>Connected</strong>
                    </div>
                  </div>
                </div>

                <div className="order-analytics">
                  <h3>Order Status Summary</h3>

                  {analyticsError && (
                    <p className="error-message">{analyticsError}</p>
                  )}

                  {analyticsLoading ? (
                    <p>Loading order analytics...</p>
                  ) : (
                    <div className="order-status-grid">
                      {Object.entries(orderAnalytics.orderStatuses).map(
                        ([status, count]) => (
                          <div
                            className={`order-status-card status-${status.toLowerCase()}`}
                            key={status}
                          >
                            <span>{status}</span>
                            <strong>{count}</strong>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="admin-table-card category-overview">
                  <div className="table-heading">
                    <div>
                      <h2>Catalog by Category</h2>
                      <p>Product distribution across your catalog.</p>
                    </div>
                  </div>

                  {(() => {
                    const palette = [
                      "#1673f9",
                      "#22b8a0",
                      "#8b5cf6",
                      "#f59e0b",
                      "#ec4899",
                      "#94a3b8",
                    ];
                    const entries = Object.entries(
                      dashboardStats.categoryCounts,
                    ).sort((x, y) => y[1] - x[1]);
                    const total = dashboardStats.totalProducts || 1;
                    let acc = 0;
                    const stops = entries.map(([, count], i) => {
                      const start = acc;
                      acc += (count / total) * 100;
                      return `${palette[i % palette.length]} ${start}% ${acc}%`;
                    });
                    return (
                      <div className="category-donut-wrap">
                        <div
                          className="category-donut"
                          style={{
                            background: entries.length
                              ? `conic-gradient(${stops.join(", ")})`
                              : "#e5eaf1",
                          }}
                        >
                          <div>
                            <strong>{dashboardStats.totalProducts}</strong>
                            <span>Products</span>
                          </div>
                        </div>
                        <ul className="category-legend">
                          {entries.map(([name, count], i) => (
                            <li key={name}>
                              <i
                                style={{ background: palette[i % palette.length] }}
                              />
                              <span>{name}</span>
                              <b>{count}</b>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>

                <div className="admin-table-card">
                  <div className="table-heading">
                    <div>
                      <h2>Product management</h2>
                      <p>Add, update or remove catalog items.</p>
                    </div>
                    <span>{products.length} products</span>
                  </div>
                  <div className="admin-product-filters">
                    <input
                      type="search"
                      placeholder="Search by product, brand or ID..."
                      value={adminSearch}
                      onChange={(event) => {
                        setAdminSearch(event.target.value);
                        setAdminPage(1);
                      }}
                      aria-label="Search admin products"
                    />

                    <select
                      value={adminCategory}
                      onChange={(event) => {
                        setAdminCategory(event.target.value);
                        setAdminPage(1);
                      }}
                      aria-label="Filter products by category"
                    >
                      <option value="All">All categories</option>
                      {[
                        ...new Set(
                          products
                            .map((product) => product.Category)
                            .filter(Boolean),
                        ),
                      ]
                        .sort()
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>

                    <span className="admin-result-count">
                      {adminFilteredProducts.length} products found
                    </span>
                  </div>
                  <div className="table-scroll">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Brand</th>
                          <th>Price (INR)</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminVisibleProducts.map((p) => (
                          <tr key={p.Gadget_ID}>
                            <td>
                              <div className="table-product">
                                <img
                                  src={safeImage(p.Category)}
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      imageByCategory.default;
                                  }}
                                  alt=""
                                />
                                <span>{p.Model_Name || "Unnamed product"}</span>
                              </div>
                            </td>
                            <td>{p.Category}</td>
                            <td>{p.Brand}</td>
                            <td>{formatPrice(p.Price_INR)}</td>
                            <td>
                              <div className="table-actions">
                                <button
                                  aria-label="Edit product"
                                  onClick={() => startEditProduct(p)}
                                >
                                  <Icon name="edit" size={16} />
                                </button>
                                <button
                                  aria-label="Delete product"
                                  className="delete-action"
                                  onClick={() => deleteProduct(p)}
                                >
                                  <Icon name="trash" size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="admin-pagination">
                    <span>
                      Page {adminPage} of {adminTotalPages}
                    </span>

                    <div>
                      <button
                        type="button"
                        className="button-outline"
                        disabled={adminPage <= 1}
                        onClick={() => setAdminPage((page) => page - 1)}
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        className="button-outline"
                        disabled={adminPage >= adminTotalPages}
                        onClick={() => setAdminPage((page) => page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      ) : showWishlist ? (
        <main className="wishlist-page">
          <div className="wishlist-heading">
            <div>
              <p className="eyebrow">YOUR COLLECTION</p>
              <h1>My Wishlist</h1>
              <p>{favorites.length} saved products</p>
            </div>

            <button
              className="button-outline"
              onClick={() => setShowWishlist(false)}
            >
              Continue Shopping
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="wishlist-empty">
              <Icon name="heart" size={40} />
              <h2>Your wishlist is empty</h2>
              <p>Save products you love and find them here later.</p>
              <button
                className="button-primary"
                onClick={() => setShowWishlist(false)}
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="featured-grid">
              {products
                .filter((product) => favorites.includes(product.Gadget_ID))
                .map((product) => (
                  <ProductCard
                    key={product.Gadget_ID}
                    product={product}
                    favorite={true}
                    onFavorite={toggleFavorite}
                    onOpen={(id) => {
                      setShowWishlist(false);
                      openProduct(id);
                    }}
                    isAdmin={isAdmin}
                    onEdit={startEditProduct}
                    onDelete={deleteProduct}
                  />
                ))}
            </div>
          )}
        </main>
      ) : showOrderHistory ? (
        <main className="cart-page account-page">
          <div className="account-layout">
            <aside className="account-sidebar">
              <button className="selected">
                <Icon name="package" /> My Orders
              </button>
              <button
                onClick={() => {
                  setShowOrderHistory(false);
                  setShowWishlist(true);
                }}
              >
                <Icon name="heart" /> Wishlist
              </button>
              <button onClick={() => signOut({ redirectUrl: "/sign-in" })}>
                <Icon name="close" /> Sign out
              </button>
            </aside>
            <div className="account-content">
          <div className="cart-heading orders-heading">
            <h1>My Orders</h1>
            <button
              className="button-outline"
              onClick={() => setShowOrderHistory(false)}
            >
              Continue Shopping
            </button>
          </div>
          <div className="order-filter-tabs" role="tablist">
            {["All", "Processing", "Delivered", "Cancelled"].map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={orderFilter === f}
                className={orderFilter === f ? "active" : ""}
                onClick={() => setOrderFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {customerOrdersLoading ? (
            <p>Loading your orders...</p>
          ) : customerOrdersError ? (
            <div className="cart-empty">
              <h2>Couldn't load your orders</h2>
              <p>{customerOrdersError}</p>
              <button
                className="button-primary"
                onClick={() => {
                  setShowOrderHistory(false);
                  setShowOrderHistory(true);
                }}
              >
                Try Again
              </button>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="cart-empty">
              <Icon name="package" size={40} />
              <h2>No orders yet</h2>
              <p>Your orders will appear here after you place an order.</p>
              <button
                className="button-primary"
                onClick={() => setShowOrderHistory(false)}
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="order-history-list">
              {customerOrders
                .filter((o) => orderFilter === "All" || (o.status || "Pending") === orderFilter)
                .map((order) => (
                <article className="order-history-card" key={order._id}>
                  <div className="order-history-details">
                    <div className="order-history-card-heading">
                      <h3>
                        Order #{String(order._id).slice(-8).toUpperCase()}
                      </h3>
                      <span className="order-history-date">
                        Placed{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>

                    <div className="order-history-thumbs">
                      {order.items?.map((item, index) => {
                        const match = products.find(
                          (p) => String(p.Gadget_ID) === String(item.productId),
                        );
                        return (
                          <img
                            key={`${item.productId}-${index}`}
                            src={safeImage(match?.Category)}
                            alt={`${item.brand} ${item.modelName}`}
                            title={`${item.brand} ${item.modelName} × ${item.quantity}`}
                            onError={(e) => {
                              e.currentTarget.src = imageByCategory.default;
                            }}
                          />
                        );
                      })}
                    </div>
                    <p className="order-history-names">
                      {order.items
                        ?.map((item) => `${item.brand} ${item.modelName} × ${item.quantity}`)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="order-history-summary">
                    <span className="order-history-total-label">
                      Order total
                    </span>
                    <strong className="order-history-total">
                      ₹{Number(order.totalINR || 0).toLocaleString("en-IN")}
                    </strong>

                    <span
                      className={`order-status-badge ${(order.status || "Pending").toLowerCase()}`}
                    >
                      {order.status || "Pending"}
                    </span>
                    <button
                      className="button-outline"
                      type="button"
                      onClick={() => printDemoInvoice(order)}
                    >
                      Download Invoice
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
            </div>
          </div>
        </main>
      ) : showCart ? (
        <main className="cart-page">
          <button
            className="cart-back-link"
            onClick={() => setShowCart(false)}
          >
            ← Continue Shopping
          </button>
          <div className="cart-heading">
            <h1>
              Your Cart <span>({cartCount} {cartCount === 1 ? "item" : "items"})</span>
            </h1>
            {cartItems.length > 0 && (
              <button className="clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            )}
          </div>

          {cartLoading ? (
            <p>Loading your cart...</p>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <Icon name="shopping-cart" size={40} />
              <h2>Your cart is empty</h2>
              <p>Discover products and add your favourites to your cart.</p>
              <button
                className="button-primary"
                onClick={() => setShowCart(false)}
              >
                Explore Products
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(({ product, quantity }) => (
                  <div className="cart-item" key={product.Gadget_ID}>
                    <img
                      className="cart-item-image"
                      src={safeImage(product.Category)}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = imageByCategory.default;
                      }}
                    />
                    <div className="cart-item-info">
                      <h3>
                        {product.Brand} {product.Model_Name}
                      </h3>
                      <p>
                        {[product.RAM_GB ? `${product.RAM_GB} GB` : null, product.Storage_GB ? `${product.Storage_GB} GB` : null]
                          .filter(Boolean)
                          .join(" · ") || product.Category}
                      </p>
                    </div>
                    <div className="qty-stepper cart-qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                        onClick={() => changeCartQuantity(product, quantity, -1)}
                      >
                        −
                      </button>
                      <span>{quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => changeCartQuantity(product, quantity, 1)}
                      >
                        +
                      </button>
                    </div>
                    <strong className="cart-item-price">
                      ₹{(Number(product.Price_INR || 0) * quantity).toLocaleString("en-IN")}
                    </strong>
                    <button
                      className="cart-remove"
                      aria-label={`Remove ${product.Brand} ${product.Model_Name}`}
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/cart/${encodeURIComponent(product.Gadget_ID)}`,
                            { method: "DELETE", credentials: "include" },
                          );
                          const data = await readApiJson(response);
                          if (!response.ok) {
                            throw new Error(data.error || "Could not remove product.");
                          }
                          await refreshCart();
                        } catch (error) {
                          alert(error.message || "Could not remove product.");
                        }
                      }}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {cartItems
                      .reduce(
                        (total, item) =>
                          total + Number(item.product.Price_INR || 0) * item.quantity,
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span>₹0</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>
                    ₹
                    {cartItems
                      .reduce(
                        (total, item) =>
                          total + Number(item.product.Price_INR || 0) * item.quantity,
                        0,
                      )
                      .toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  className="button-primary"
                  onClick={placeOrder}
                  disabled={checkoutLoading || cartItems.length === 0}
                >
                  {checkoutLoading ? "Placing Order..." : "Proceed to Checkout"}
                </button>

                {orderConfirmation && (
                  <div className="order-confirmation">
                    <h3>Order placed successfully!</h3>
                    <p>
                      Order ID:{" "}
                      {String(orderConfirmation._id).slice(-8).toUpperCase()}
                    </p>
                    <p>
                      Total: ₹
                      {Number(orderConfirmation.totalINR || 0).toLocaleString(
                        "en-IN",
                      )}
                    </p>
                    <p>Status: {orderConfirmation.status}</p>
                    <button
                      className="button-primary"
                      type="button"
                      onClick={() => printDemoInvoice(orderConfirmation)}
                    >
                      Download Demo Invoice (PDF)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      ) : (
        <main id="home">
          {!selectedProduct && (
            <>
              <section className="hero-banner">
                <button
                  type="button"
                  className="hero-arrow hero-arrow-prev"
                  aria-label="Previous slide"
                  onClick={() =>
                    setHeroIndex((i) => (i + heroSlides.length - 1) % heroSlides.length)
                  }
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
                </button>
                <div className="hero-copy">
                  <h1>
                    {heroSlide.title[0]}
                    <br />
                    {heroSlide.title[1]}
                  </h1>
                  <p>{heroSlide.text}</p>
                  <button
                    onClick={() =>
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Shop Now <Icon name="arrow" size={16} />
                  </button>
                  <div className="hero-dots">
                    {heroSlides.map((_, i) => (
                      <i
                        key={i}
                        className={i === heroIndex % heroSlides.length ? "on" : ""}
                        onClick={() => setHeroIndex(i)}
                      />
                    ))}
                  </div>
                </div>
                <img
                  className="hero-image"
                  src={heroSlide.image.replace("w=900", "w=1200")}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <button
                  type="button"
                  className="hero-arrow hero-arrow-next"
                  aria-label="Next slide"
                  onClick={() => setHeroIndex((i) => (i + 1) % heroSlides.length)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                </button>
              </section>
              <section className="category-strip" aria-label="Shop by category">
                {displayedCategories.map((c) => (
                  <button
                    key={c}
                    className="category-tile"
                    onClick={() => {
                      setCategory(c);
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="category-tile-icon" aria-hidden="true">
                      <Icon name={categoryIcon(c)} size={25} />
                    </span>
                    <span>
                      {c === "Mobile"
                        ? "Mobiles"
                        : c === "Laptop"
                          ? "Laptops"
                          : c === "Tablet"
                            ? "Tablets"
                            : c === "Headphones"
                              ? "Audio"
                              : c}
                    </span>
                  </button>
                ))}
                <button
                  className="category-tile"
                  onClick={() => {
                    setCategory("All");
                    document
                      .getElementById("catalog")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="category-tile-icon more-dots" aria-hidden="true">
                    •••
                  </span>
                  <span>More</span>
                </button>
              </section>
              <section className="featured-section">
                <div className="section-title-row">
                  <h2>Popular Products</h2>
                  <div className="featured-tabs" role="tablist">
                    {featuredTabs.map(([value, label]) => (
                      <button
                        key={value}
                        role="tab"
                        aria-selected={featuredTab === value}
                        className={
                          featuredTab === value
                            ? "featured-tab active"
                            : "featured-tab"
                        }
                        onClick={() => setFeaturedTab(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <button
                    className="text-link"
                    onClick={() =>
                      document
                        .getElementById("catalog")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    View all <Icon name="arrow" size={15} />
                  </button>
                </div>
                <div className="featured-grid">
                  {featured.map((p) => (
                    <ProductCard
                      key={p.Gadget_ID}
                      product={p}
                      favorite={favorites.includes(p.Gadget_ID)}
                      onFavorite={toggleFavorite}
                      onOpen={openProduct}
                      isAdmin={isAdmin}
                      onEdit={startEditProduct}
                      onDelete={deleteProduct}
                      onFindAlternatives={findAlternatives}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {detailsLoading && (
            <p className="message">Loading product details...</p>
          )}
          {selectedProduct && (
            <section className="product-detail-page">
              <nav className="breadcrumbs" aria-label="Breadcrumb">
                <button
                  className="breadcrumb-back"
                  onClick={() => setSelectedProduct(null)}
                >
                  Home
                </button>
                <span>›</span>
                <span>{selectedProduct.Category}</span>
                <span>›</span>
                <span>{selectedProduct.Brand}</span>
                <span>›</span>
                <span className="current">{selectedProduct.Model_Name}</span>
              </nav>
              <div className="detail-layout">
                <div className="detail-gallery">
                  <div className="detail-main-image">
                    <img
                      src={safeImage(selectedProduct.Category)}
                      alt={`${selectedProduct.Brand} ${selectedProduct.Model_Name}`}
                      onError={(e) => {
                        e.currentTarget.src = imageByCategory.default;
                      }}
                    />
                  </div>
                  <div className="detail-thumbs">
                    <img
                      src={safeImage(selectedProduct.Category)}
                      alt="Product view"
                    />
                    <img
                      src={imageByCategory.default}
                      alt="Alternate product view"
                    />
                    <img
                      src={safeImage(selectedProduct.Category)}
                      alt="Product detail"
                    />
                  </div>
                </div>
                <div className="detail-summary">
                  <h1>
                    {selectedProduct.Brand} {selectedProduct.Model_Name}
                  </h1>
                  <div className="rating-row">
                    <span className="stars">★★★★★</span>
                    <strong>4.8</strong>
                    <span>(120 reviews)</span>
                    <span className="pill-blue">Popular</span>
                    <span className="pill-new">New</span>
                  </div>
                  <div className="detail-price">
                    {formatPrice(selectedProduct.Price_INR)}
                  </div>
                  <p className="detail-description">
                    {selectedProduct.Description ||
                      "Explore the features and specifications of this product."}
                  </p>
                  <div className="quick-specs">
                    {[
                      ["RAM", `${selectedProduct.RAM_GB ?? "—"} GB`],
                      ["Storage", `${selectedProduct.Storage_GB ?? "—"} GB`],
                      [
                        "Processor",
                        selectedProduct.Processor || "Not specified",
                      ],
                      [
                        "Display",
                        `${selectedProduct.Screen_Size_inch ?? "—"} inch`,
                      ],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <strong>{v}</strong>
                        <span>{k}</span>
                      </div>
                    ))}
                  </div>
                  <p className="stock-status">
                    <span /> Available in catalog
                  </p>
                  <div className="detail-actions">
                    <button
                      className="button-outline"
                      onClick={() => toggleFavorite(selectedProduct.Gadget_ID)}
                    >
                      <Icon name="heart" />{" "}
                      {favorites.includes(selectedProduct.Gadget_ID)
                        ? "Saved"
                        : "Wishlist"}
                    </button>

                    <div className="qty-stepper">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                      >
                        −
                      </button>
                      <span aria-live="polite">{detailQty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setDetailQty((q) => Math.min(10, q + 1))}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="button-primary"
                      onClick={() => addSelectedToCart(false)}
                    >
                      <Icon name="cart" /> Add to Cart
                    </button>
                    <button
                      className="button-dark"
                      onClick={() => addSelectedToCart(true)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
                <aside className="detail-aside">
                  <div className="service-list">
                    <p>
                      <Icon name="truck" />{" "}
                      <span>
                        <strong>Free Delivery</strong>
                        <small>On orders above ₹499</small>
                      </span>
                    </p>
                    <p>
                      <Icon name="package" />{" "}
                      <span>
                        <strong>7 Days Return</strong>
                        <small>Easy returns</small>
                      </span>
                    </p>
                    <p>
                      <Icon name="shield" />{" "}
                      <span>
                        <strong>Secure Shopping</strong>
                        <small>Shop with confidence</small>
                      </span>
                    </p>
                  </div>
                </aside>
              </div>
              <div className="spec-table-card">
                <div className="detail-tabs" role="tablist">
                  {[
                    ["description", "Description"],
                    ["specifications", "Specifications"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      role="tab"
                      aria-selected={detailTab === value}
                      className={detailTab === value ? "active" : ""}
                      onClick={() => setDetailTab(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {detailTab === "description" && (
                  <p className="tab-description">
                    {selectedProduct.Description ||
                      "Explore the features and specifications of this product."}
                  </p>
                )}
                <div
                  className={
                    detailTab === "description"
                      ? "spec-table is-hidden"
                      : "spec-table"
                  }
                >
                  {[
                    ["Model Name", selectedProduct.Model_Name],
                    ["Brand", selectedProduct.Brand],
                    ["Processor", selectedProduct.Processor],
                    ["RAM", `${selectedProduct.RAM_GB ?? "—"} GB`],
                    ["Storage", `${selectedProduct.Storage_GB ?? "—"} GB`],
                    [
                      "Display",
                      `${selectedProduct.Screen_Size_inch ?? "—"} inch`,
                    ],
                    ["Battery", `${selectedProduct.Battery_mAh ?? "—"} mAh`],
                    ["Operating System", selectedProduct.OS],
                    ["Connectivity", selectedProduct.Connectivity],
                    ["Country of Origin", selectedProduct.Country_Origin],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      <strong>{v || "Not specified"}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {!selectedProduct && (
            <section className="catalog-section" id="catalog">
              <div className="search-mode-controls">
                <button
                  type="button"
                  className={
                    searchMode === "keyword"
                      ? "search-mode-button active"
                      : "search-mode-button"
                  }
                  onClick={() => {
                    setSearchMode("keyword");
                    setAiError("");
                  }}
                >
                  Keyword Search
                </button>

                <button
                  type="button"
                  className={
                    searchMode === "ai"
                      ? "search-mode-button active"
                      : "search-mode-button"
                  }
                  onClick={() => {
                    setSearchMode("ai");
                    setAiError("");
                  }}
                >
                  AI Search
                </button>

                {searchMode === "ai" && (
                  <button
                    type="button"
                    className={
                      tradeoffMode
                        ? "search-mode-button active"
                        : "search-mode-button"
                    }
                    onClick={() => {
                      setTradeoffMode((current) => !current);
                    }}
                  >
                    {tradeoffMode
                      ? "Turn Off Trade-off Explorer"
                      : "Explore Product Trade-offs"}
                  </button>
                )}

                {searchMode === "ai" && (
                  <button
                    type="button"
                    className="search-mode-button"
                    onClick={() => {
                      setSearchMode("keyword");
                      setAiResults([]);
                      setAiError("");
                    }}
                  >
                    Return to Keyword Results
                  </button>
                )}
              </div>

              {searchMode === "ai" && tradeoffMode && (
                <p className="tradeoff-summary">
                  Comparing by:{" "}
                  {tradeoffPriorities.length > 0
                    ? tradeoffPriorities.join(", ")
                    : "price (default)"}
                </p>
              )}

              {searchMode === "ai" && tradeoffMode && (
                <div className="tradeoff-panel">
                  <h3>Customize Your Priorities</h3>
                  <p>Choose what matters most when comparing products.</p>

                  {[
                    {
                      key: "price",
                      label: "Price",
                      low: "Less important",
                      high: "Most important",
                    },
                    {
                      key: "durability",
                      label: "Durability",
                      low: "Less important",
                      high: "Most important",
                    },
                    {
                      key: "performance",
                      label: "Performance",
                      low: "Less important",
                      high: "Most important",
                    },
                    {
                      key: "battery",
                      label: "Battery life",
                      low: "Less important",
                      high: "Most important",
                    },
                    {
                      key: "portability",
                      label: "Portability",
                      low: "Less important",
                      high: "Most important",
                    },
                  ].map((priority) => (
                    <div className="tradeoff-slider" key={priority.key}>
                      <div className="tradeoff-slider-heading">
                        <label htmlFor={`tradeoff-${priority.key}`}>
                          {priority.label}
                        </label>
                        <span>{tradeoffWeights[priority.key]}%</span>
                      </div>

                      <input
                        id={`tradeoff-${priority.key}`}
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={tradeoffWeights[priority.key]}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setTradeoffWeights((current) => ({
                            ...current,
                            [priority.key]: value,
                          }));
                        }}
                      />

                      <div className="tradeoff-slider-labels">
                        <span>{priority.low}</span>
                        <span>{priority.high}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="section-title-row catalog-title-row">
                <div>
                  <p className="eyebrow">THE SHOPPINGS DESTINATION</p>
                  <h2>Explore Products</h2>
                  <p className="section-subtitle">
                    Find the right technology for your everyday life.
                  </p>
                </div>
                <span className="result-count">
                  {displayedProducts.length} products
                </span>
              </div>
              <div className="catalog-toolbar">
                <div className="catalog-chips">
                  {categories.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip ${category === item ? "active" : ""}`}
                      onClick={() => setCategory(item)}
                    >
                      {item === "All" ? "All" : item}
                    </button>
                  ))}
                </div>
                <div className="filter-controls">
                  <input
                    aria-label="Minimum price"
                    type="number"
                    min="0"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    aria-label="Maximum price"
                    type="number"
                    min="0"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  <select
                    aria-label="Sort products"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="default">Sort by</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                  </select>
                </div>
              </div>
              {error && (
                <p className="message error">
                  {error} Check that the backend is running.
                </p>
              )}
              {loading && <p className="message">Loading products...</p>}
              {!loading && !error && filteredProducts.length === 0 && (
                <p className="message">
                  No products found. Try a different search.
                </p>
              )}
              {isAdmin && (
                <div className="admin-inline">
                  <div>
                    <span className="admin-inline-icon">
                      <Icon name="shield" />
                    </span>
                    <div>
                      <strong>Admin product management</strong>
                      <small>Add, edit and remove catalog products.</small>
                    </div>
                  </div>
                  <button className="button-primary" onClick={startAddProduct}>
                    <Icon name="plus" /> Add Product
                  </button>
                  <button
                    className="button-outline"
                    onClick={() => setShowAdmin(true)}
                  >
                    Open Dashboard <Icon name="arrow" />
                  </button>
                </div>
              )}

              {searchMode === "ai" &&
                tradeoffMode &&
                displayedProducts.length >= 2 && (
                  <div className="tradeoff-comparison">
                    <div className="tradeoff-comparison-heading">
                      <h3>
                        <span className="tradeoff-heading-icon">✦</span>
                        Why These Products?
                      </h3>
                      <p>
                        Compare the best matches, their strengths and their
                        trade-offs.
                      </p>
                    </div>

                    <div className="tradeoff-comparison-grid">
                      {displayedProducts.slice(0, 3).map((product, index) => {
                        const alternative = displayedProducts.find(
                          (item) => item.Gadget_ID !== product.Gadget_ID,
                        );

                        if (!alternative) return null;

                        const explanation = explainProductTradeoff(
                          product,
                          alternative,
                        );

                        // Use the image field available in the product data.
                        const productImage =
                          product.Image_URL ||
                          product.Image_Url ||
                          product.imageUrl ||
                          product.image ||
                          product.image_url ||
                          "";

                        return (
                          <div
                            className="tradeoff-comparison-card"
                            key={product.Gadget_ID}
                          >
                            <div className="tradeoff-product-info">
                              <div className="tradeoff-product-visual">
                                <span className="tradeoff-rank">
                                  {index + 1}
                                </span>

                                {productImage ? (
                                  <img
                                    className="tradeoff-product-image"
                                    src={productImage}
                                    alt={`${product.Brand} ${product.Model_Name}`}
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  <div className="tradeoff-image-placeholder">
                                    <span>▱</span>
                                    <small>No image</small>
                                  </div>
                                )}

                                <div className="tradeoff-match">
                                  <div className="tradeoff-match-label">
                                    Match score
                                    <strong>{product.tradeoffScore}/100</strong>
                                  </div>
                                  <div className="tradeoff-score-track">
                                    <div
                                      className="tradeoff-score-fill"
                                      style={{
                                        width: `${Math.max(
                                          0,
                                          Math.min(
                                            100,
                                            product.tradeoffScore || 0,
                                          ),
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="tradeoff-product-details">
                                <h4>
                                  {product.Brand} {product.Model_Name}
                                </h4>
                                <p className="tradeoff-comparison-price">
                                  ₹
                                  {Number(product.Price_INR).toLocaleString(
                                    "en-IN",
                                  )}
                                </p>
                                <p className="tradeoff-compared-with">
                                  Compared with {alternative.Brand}{" "}
                                  {alternative.Model_Name}
                                </p>
                              </div>
                            </div>

                            <div className="tradeoff-detail-panel tradeoff-advantages">
                              <h5>
                                <span className="tradeoff-panel-icon">✓</span>
                                Advantages
                              </h5>

                              {explanation.gains.length > 0 ? (
                                <ul>
                                  {explanation.gains.map((gain, i) => (
                                    <li key={i}>{gain}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="tradeoff-empty">
                                  No clear advantage identified.
                                </p>
                              )}
                            </div>

                            <div className="tradeoff-detail-panel tradeoff-disadvantages">
                              <h5>
                                <span className="tradeoff-panel-icon">×</span>
                                Trade-offs
                              </h5>

                              {explanation.losses.length > 0 ? (
                                <ul>
                                  {explanation.losses.map((loss, i) => (
                                    <li key={i}>{loss}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="tradeoff-empty">
                                  No clear disadvantage identified.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {alternativeProduct && (
                <section className="alternatives-panel">
                  <div className="alternatives-panel-heading">
                    <div>
                      <h3>
                        Alternatives to {alternativeProduct.Brand}{" "}
                        {alternativeProduct.Model_Name}
                      </h3>
                      <p>Similar products from your ShopSense catalog</p>
                    </div>

                    <button
                      type="button"
                      className="alternatives-close"
                      onClick={() => {
                        setAlternativeProduct(null);
                        setAlternativeResults([]);
                        setAlternativeError("");
                      }}
                      aria-label="Close alternatives"
                    >
                      ×
                    </button>
                  </div>

                  {alternativeLoading && (
                    <p className="alternatives-status">
                      Finding similar products…
                    </p>
                  )}

                  {!alternativeLoading && alternativeError && (
                    <p className="alternatives-error">{alternativeError}</p>
                  )}

                  {!alternativeLoading && !alternativeError && (
                    <div className="alternatives-grid">
                      {alternativeResults.map((product) => (
                        <article
                          className="alternative-card"
                          key={product.Gadget_ID}
                        >
                          <img
                            src={safeImage(product.Category)}
                            alt={`${product.Brand} ${product.Model_Name}`}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = imageByCategory.default;
                            }}
                          />

                          <div className="alternative-card-details">
                            <span>{product.Brand}</span>
                            <strong>{product.Model_Name}</strong>
                            <p>
                              {product.RAM_GB ?? "—"} GB RAM ·{" "}
                              {product.Storage_GB ?? "—"} GB storage
                            </p>
                            <b>{formatPrice(product.Price_INR)}</b>

                            {Number(product.Price_INR) <
                              Number(alternativeProduct.Price_INR) && (
                              <span className="alternative-saving">
                                Lower price
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => openProduct(product.Gadget_ID)}
                            >
                              View product
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <div className="product-grid">
                {searchMode === "ai" && aiLoading ? (
                  <p className="search-message">
                    Searching products with AI...
                  </p>
                ) : aiError ? (
                  <p className="search-message search-error">{aiError}</p>
                ) : displayedProducts.length === 0 ? (
                  <p className="search-message">
                    No products found. Try a different search or adjust your
                    filters.
                  </p>
                ) : (
                  displayedProducts.map((p) => (
                    <ProductCard
                      key={p.Gadget_ID}
                      product={p}
                      favorite={favorites.includes(p.Gadget_ID)}
                      onFavorite={toggleFavorite}
                      onOpen={openProduct}
                      isAdmin={isAdmin}
                      onEdit={startEditProduct}
                      onDelete={deleteProduct}
                      onFindAlternatives={findAlternatives}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      )}

      {showProductForm && isAdmin && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowProductForm(false);
          }}
        >
          <form className="product-modal" onSubmit={saveProduct}>
            <div className="modal-heading">
              <div>
                <p className="eyebrow">INVENTORY</p>
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close"
                onClick={() => setShowProductForm(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="form-grid">
              <label>
                Product name
                <input
                  required
                  value={draftProduct.Model_Name}
                  onChange={(e) => updateDraft("Model_Name", e.target.value)}
                  placeholder="e.g. Galaxy S24"
                />
              </label>
              <label>
                Category
                <select
                  value={draftProduct.Category}
                  onChange={(e) => updateDraft("Category", e.target.value)}
                >
                  {categories
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                </select>
              </label>
              <label>
                Brand
                <input
                  required
                  value={draftProduct.Brand}
                  onChange={(e) => updateDraft("Brand", e.target.value)}
                  placeholder="Brand name"
                />
              </label>
              <label>
                Price (INR)
                <input
                  required
                  type="number"
                  min="0"
                  value={draftProduct.Price_INR}
                  onChange={(e) => updateDraft("Price_INR", e.target.value)}
                  placeholder="₹ 79900"
                />
              </label>
              <label>
                RAM (GB)
                <input
                  type="number"
                  min="0"
                  value={draftProduct.RAM_GB}
                  onChange={(e) => updateDraft("RAM_GB", e.target.value)}
                />
              </label>
              <label>
                Storage (GB)
                <input
                  type="number"
                  min="0"
                  value={draftProduct.Storage_GB}
                  onChange={(e) => updateDraft("Storage_GB", e.target.value)}
                />
              </label>
              <label className="form-full">
                Processor
                <input
                  value={draftProduct.Processor}
                  onChange={(e) => updateDraft("Processor", e.target.value)}
                  placeholder="Processor model"
                />
              </label>
              <label className="form-full">
                Description
                <textarea
                  rows="3"
                  value={draftProduct.Description}
                  onChange={(e) => updateDraft("Description", e.target.value)}
                  placeholder="Product description"
                />
              </label>
              <label className="availability-check">
                <input
                  type="checkbox"
                  checked={draftProduct.Available}
                  onChange={(e) => updateDraft("Available", e.target.checked)}
                />{" "}
                Available in catalog
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="button-outline"
                onClick={() => setShowProductForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button-primary"
                disabled={savingProduct}
              >
                {savingProduct
                  ? "Saving..."
                  : editingProduct
                    ? "Save Changes"
                    : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="site-footer">
        <a className="brand-logo" href="#home">
          <span className="brand-mark">S</span>
          <span>
            Shop<span>Sense</span>
          </span>
        </a>
        <span>Discover technology that fits your life.</span>
        <span>© {new Date().getFullYear()} ShopSense</span>
      </footer>
    </div>
  );
}

function ProductCard({
  product,
  favorite,
  onFavorite,
  onOpen,
  isAdmin,
  onEdit,
  onDelete,
  onFindAlternatives,
}) {
  return (
    <article className="product-card">
      <button
        className="product-image-button"
        onClick={() => onOpen(product.Gadget_ID)}
        aria-label={`View ${product.Brand} ${product.Model_Name}`}
      >
        <img
          className="product-image"
          src={safeImage(product.Category)}
          alt={`${product.Brand} ${product.Model_Name}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = imageByCategory.default;
          }}
        />
        <span className="product-category-tag">{product.Category}</span>
      </button>
      <button
        className={`favorite-button ${favorite ? "is-favorite" : ""}`}
        aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => onFavorite(product.Gadget_ID)}
      >
        <Icon name="heart" size={17} />
      </button>
      <button
        className="product-card-content"
        onClick={() => onOpen(product.Gadget_ID)}
      >
        <strong className="product-name">
          {product.Brand} {product.Model_Name || "Product"}
        </strong>
        <span className="product-spec-line">
          {product.RAM_GB ?? "—"} GB · {product.Storage_GB ?? "—"} GB
        </span>
        <span className="card-price-row">
          <strong>{formatPrice(product.Price_INR)}</strong>
          <span className="fake-rating">
            <Icon name="star" size={12} /> 4.8
          </span>
        </span>
      </button>

      <button
        className="find-alternatives-button"
        onClick={(event) => {
          event.stopPropagation();
          onFindAlternatives(product);
        }}
      >
        <Icon name="search" size={14} />
        Find Alternatives
      </button>

      {isAdmin && (
        <div className="product-admin-actions">
          <button onClick={() => onEdit(product)}>
            <Icon name="edit" size={14} /> Edit
          </button>
          <button onClick={() => onDelete(product)}>
            <Icon name="trash" size={14} /> Delete
          </button>
        </div>
      )}
    </article>
  );
}

function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <a className="brand-logo" href="/">
          <span className="brand-mark">S</span>
          <span>
            Shop<span>Sense</span>
          </span>
        </a>
        <p>Your next favorite piece of tech is waiting.</p>
      </div>
      <SignIn routing="hash" signUpUrl="/sign-up" forceRedirectUrl="/" fallbackRedirectUrl="/" />
    </main>
  );
}
function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <a className="brand-logo" href="/">
          <span className="brand-mark">S</span>
          <span>
            Shop<span>Sense</span>
          </span>
        </a>
        <p>Create your account and discover smarter shopping.</p>
      </div>
      <SignUp routing="hash" signInUrl="/sign-in" forceRedirectUrl="/" fallbackRedirectUrl="/" />
    </main>
  );
}
function AuthenticatedCatalog() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <p className="loading-screen">Loading ShopSense...</p>;
  if (!isSignedIn) return <SignInPage />;
  return <App />;
}
function RootApp() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignInPage} />
      <Route path="/sign-up" component={SignUpPage} />
      <Route component={AuthenticatedCatalog} />
    </Switch>
  );
}
export default RootApp;
