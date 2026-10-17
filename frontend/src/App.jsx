import { useEffect, useState } from "react";
import "./App.css";

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function categoryIcon(category) {
  const icons = {
    Laptop: "💻",
    Mobile: "📱",
    Tablet: "📟",
    Headphones: "🎧",
    Accessories: "🎒",
  };

  return icons[category] || "📦";
}

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  async function openProduct(productId) {
    setDetailsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}`
      );

      if (!response.ok) {
        throw new Error("Could not load product details.");
      }

      const data = await response.json();
      setSelectedProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products?limit=500");

        if (!response.ok) {
          throw new Error("Could not retrieve products.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = [
    "All",
    ...new Set(products.map((p) => p.Category).filter(Boolean)),
  ];

  const searchText = search.trim().toLowerCase();
  const isExactBrandSearch =
    searchText !== "" &&
    products.some(
      (product) => (product.Brand || "").trim().toLowerCase() === searchText
    );

  const filteredProducts = products
    .filter((product) => {
      const brand = (product.Brand || "").trim().toLowerCase();
      const model = (product.Model_Name || "").toLowerCase();
      const processor = (product.Processor || "").toLowerCase();

      const matchesSearch =
        searchText === "" ||
        (isExactBrandSearch
          ? brand === searchText
          : brand.includes(searchText) ||
            model.includes(searchText) ||
            processor.includes(searchText));

      const matchesCategory =
        category === "All" || product.Category === category;

      const matchesMinPrice =
        minPrice === "" || product.Price_INR >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || product.Price_INR <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      if (sort === "low") return a.Price_INR - b.Price_INR;
      if (sort === "high") return b.Price_INR - a.Price_INR;
      return 0;
    });

    console.log(
  "Search:",
  search,
  "| Category:",
  category,
  "| Final count:",
  filteredProducts.length
);

console.log(
  "Non-Apple results:",
  filteredProducts.filter(
    (p) => !`${p.Brand} ${p.Model_Name} ${p.Category} ${p.Description} ${p.Processor}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )
);

console.log("Current search:", JSON.stringify(search));

console.log(
  "Final results:",
  filteredProducts.map((p) => `${p.Brand} ${p.Category}`)
);

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="/">
          <span className="logo-icon">S</span>
          ShopSense
        </a>
        <span className="nav-label">SMART PRODUCT DISCOVERY</span>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR SMARTER SHOPPING SPACE</p>
          <h1>Find the right tech for you.</h1>
          <p className="hero-text">
            Explore gadgets, compare prices, and discover products
            that match your needs.
          </p>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search laptops, Apple, Snapdragon..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </section>
    
      {detailsLoading && (
        <p className="message">Loading product details...</p>
      )}

      {selectedProduct && (
        <section className="product-detail">
          <button
            className="back-button"
            onClick={() => setSelectedProduct(null)}
          >
            ← Back to products
          </button>

          <div className="detail-card">
            <div className="detail-header">
              <span>{selectedProduct.Category}</span>
              <h2>{selectedProduct.Brand} {selectedProduct.Model_Name}</h2>
              <p>{selectedProduct.Description || "No description available."}</p>
              <h3>{formatPrice(selectedProduct.Price_INR)}</h3>
            </div>

            <h3>Specifications</h3>

            <div className="detail-specs">
              <p><strong>Processor:</strong> {selectedProduct.Processor || "Not specified"}</p>
              <p><strong>RAM:</strong> {selectedProduct.RAM_GB ?? "Not specified"} GB</p>
              <p><strong>Storage:</strong> {selectedProduct.Storage_GB ?? "Not specified"} GB</p>
              <p><strong>Screen size:</strong> {selectedProduct.Screen_Size_inch ?? "Not specified"} inches</p>
              <p><strong>Battery:</strong> {selectedProduct.Battery_mAh ?? "Not specified"} mAh</p>
              <p><strong>Operating system:</strong> {selectedProduct.OS || "Not specified"}</p>
              <p><strong>Connectivity:</strong> {selectedProduct.Connectivity || "Not specified"}</p>
              <p><strong>Launch year:</strong> {selectedProduct.Launch_Year ?? "Not specified"}</p>
              <p><strong>Country of origin:</strong> {selectedProduct.Country_Origin || "Not specified"}</p>
            </div>
          </div>
        </section>
      )}

        {!selectedProduct && !detailsLoading && (
          <section className="catalog">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">THE CATALOG</p>
              <h2>Explore products</h2>
            </div>
            <span className="result-count">
              {filteredProducts.length} products
            </span>
          </div>

          <div className="toolbar">
            <div className="categories">
              {categories.map((item) => (
                <button
                  key={item}
                  className={`category-button ${
                    category === item ? "active" : ""
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            
          <div className="price-filters">
            <input
              type="number"
              min="0"
              placeholder="Min price (₹)"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Max price (₹)"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </div>

            <select
              aria-label="Sort products by price"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="default">Default order</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          {loading && <p className="message">Loading products...</p>}

          {error && (
            <p className="message error">
              {error} Check that the backend is running.
            </p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="message">
              No products found. Try a different search.
            </p>
          )}

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article
                className="product-card"
                key={product.Gadget_ID}
                onClick={() => openProduct(product.Gadget_ID)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProduct(product.Gadget_ID);
                  }
                }}
              >

                <div className="product-visual">
                  <span className="product-category">
                    {product.Category}
                  </span>
                  <span className="product-emoji">
                    {categoryIcon(product.Category)}
                  </span>
                  <span className="product-id">{product.Gadget_ID}</span>
                </div>

                <div className="product-info">
                  <p className="brand">{product.Brand}</p>
                  <h3>{product.Model_Name}</h3>
                  <p className="description">
                    {product.Description || "No description available."}
                  </p>

                  <div className="specs">
                    <span>{product.RAM_GB ?? "—"} GB RAM</span>
                    <span>{product.Storage_GB ?? "—"} GB storage</span>
                  </div>

                  <div className="product-bottom">
                    <span className="price">
                      {formatPrice(product.Price_INR)}
                    </span>
                    <span className="view-label">IN CATALOG ↗</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        )}
      </main>

      <footer>
        ShopSense · Built with React, Express and MongoDB
      </footer>
    </div>
  );
}

export default App;