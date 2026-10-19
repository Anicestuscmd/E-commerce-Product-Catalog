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

function Icon({ name, size = 18 }) {
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
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
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
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
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
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
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
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l4-.8L20 7a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6M10 10v6M14 10v6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
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

async function fetchAllProducts() {
  const firstResponse = await fetch("/api/products?page=1&pageSize=100");
  if (!firstResponse.ok) throw new Error("Could not retrieve products.");
  const firstData = await firstResponse.json();
  if (Array.isArray(firstData)) return firstData;
  const allProducts = [...(firstData.items || [])];
  const pageSize = firstData.pageSize || 100;
  const totalPages = Math.ceil(
    (firstData.total || allProducts.length) / pageSize,
  );
  for (let page = 2; page <= totalPages; page++) {
    const response = await fetch(
      `/api/products?page=${page}&pageSize=${pageSize}`,
    );
    if (!response.ok) throw new Error(`Could not load product page ${page}.`);
    const data = await response.json();
    allProducts.push(...(data.items || []));
  }
  return allProducts;
}

const categoryIcon = (category) =>
  ({
    Mobile: "▯",
    Laptop: "▱",
    Notebook: "▱",
    Tablet: "▯",
    Headphones: "◖))",
    Keyboard: "⌨",
    Mouse: "◉",
    Accessories: "✦",
  })[category] || "◇";

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
  const [showAdmin, setShowAdmin] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userPage, setUserPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
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
      adminCategory === "All" ||
      product.Category === adminCategory;

    return matchesSearch && matchesCategory;
  });
}, [products, adminSearch, adminCategory]);

const adminPageSize = 10;
const adminTotalPages = Math.max(
  1,
  Math.ceil(adminFilteredProducts.length / adminPageSize)
);

const adminVisibleProducts = adminFilteredProducts.slice(
  (adminPage - 1) * adminPageSize,
  adminPage * adminPageSize
);

const filteredAdminUsers = useMemo(() => {
  const search = userSearch.trim().toLowerCase();

  return adminUsers.filter((account) => {
    const fullName =
      `${account.firstName || ""} ${account.lastName || ""}`.trim();

    const matchesSearch = [
      fullName,
      account.email,
      account.id,
    ]
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
  Math.ceil(filteredAdminUsers.length / userPageSize)
);

const visibleAdminUsers = filteredAdminUsers.slice(
  (userPage - 1) * userPageSize,
  userPage * userPageSize
);

  async function openProduct(productId) {
    setDetailsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(productId)}`,
      );
      if (!response.ok) throw new Error("Could not load product details.");
      setSelectedProduct(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
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
      const result = await response.json().catch(() => ({}));
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
      const result = await response.json().catch(() => ({}));
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load wishlist.");
      }

      if (!cancelled) {
        setFavorites(
          (data.items || []).map((product) => product.Gadget_ID)
        );
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load cart.");
      }

      if (!cancelled) {
        const items = data.items || [];
        setCartItems(items);
        setCartCount(
          items.reduce((total, item) => total + item.quantity, 0)
        );
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

      const data = await response.json();

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

  const featured = products.slice(0, 6);
  const displayedCategories = [
    "Mobile",
    "Laptop",
    "Tablet",
    "Headphones",
    "Keyboard",
    "Mouse",
    "Notebook",
    "Accessories",
  ];
  const updateDraft = (key, value) =>
    setDraftProduct((d) => ({ ...d, [key]: value }));

async function toggleFavorite(id) {
  const alreadySaved = favorites.includes(id);

  try {
    const response = await fetch(
      `/api/wishlist/${encodeURIComponent(id)}`,
      {
        method: alreadySaved ? "DELETE" : "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not update wishlist.");
    }

    setFavorites((previous) =>
      alreadySaved
        ? previous.filter((item) => item !== id)
        : previous.includes(id)
          ? previous
          : [...previous, id]
    );
  } catch (error) {
    setError(error.message);
  }
}
  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand-logo"
          href="#home"
          onClick={() => {
            setSelectedProduct(null);
            setShowAdmin(false);
          }}
        >
          <span className="brand-mark">S</span>
          <span>
            Shop<span>Sense</span>
          </span>
        </a>
        <form
          className="header-search"
          onSubmit={(e) => {
            e.preventDefault();
            setSelectedProduct(null);
            document
              .getElementById("catalog")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <Icon name="search" size={16} />
          <input
            aria-label="Search products"
            placeholder="Search for products, brands, or specifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button aria-label="Submit search">
            <Icon name="search" size={17} />
          </button>
        </form>

        <nav className="main-nav">
          <button
            onClick={() => {
              setShowWishlist(false);
              setSelectedProduct(null);
              setShowCart(false);
              setShowAdmin(false);
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
              setShowWishlist(true);
              setSelectedProduct(null);
              setShowAdmin(false);
              setShowProfile(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Icon name="heart" size={16} />
            Wishlist
            {favorites.length > 0 && (
              <b className="nav-count">{favorites.length}</b>
            )}
          </button>

          <button
            onClick={() => {
              setShowAdmin(false);
              setSelectedProduct(null);
              setShowWishlist(false);
              setShowCart(true);
            }}
          >
            <Icon name="cart" />
            Cart
            {cartCount > 0 && (
              <b className="nav-count">{cartCount}</b>
            )}
          </button>
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
            <button className="selected">
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
              onClick={() =>
                alert("Order management is planned for a later feature update.")
              }
            >
              <Icon name="cart" />
              Orders
            </button>
            <button
              className={showUsers ? "selected" : ""}
              onClick={() => setShowUsers(true)}
            >
              <Icon name="user" />
              Users
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
            {showUsers ? (
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
                        {adminUsers.filter((account) => account.role === "admin").length}
                      </strong>
                    </div>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="admin-table-card">
                    <p className="admin-users-message">Loading registered users...</p>
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
                                    account.role === "admin" ? "admin" : "customer"
                                  }`}
                                >
                                  {account.role === "admin" ? "Admin" : "Customer"}
                                </span>
                              </td>
                              <td>
                                {account.createdAt
                                  ? new Date(account.createdAt).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td>
                                {account.lastSignInAt
                                  ? new Date(account.lastSignInAt).toLocaleDateString()
                                  : "Never"}
                              </td>
                            </tr>
                          ))}
                          {visibleAdminUsers.length === 0 && (
                            <tr>
                              <td colSpan={5}>No registered users found.</td>
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
                  {[...new Set(products.map((product) => product.Category).filter(Boolean))]
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
                                e.currentTarget.src = imageByCategory.default;
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
            <div className="admin-table-card category-overview">
              <div className="table-heading">
                <div>
                  <h2>Catalog by Category</h2>
                  <p>Product distribution across your catalog.</p>
                </div>
              </div>

              <div className="category-stats-list">
                {Object.entries(dashboardStats.categoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => {
                    const percentage =
                      dashboardStats.totalProducts > 0
                        ? (count / dashboardStats.totalProducts) * 100
                        : 0;

                    return (
                      <div className="category-stat" key={category}>
                        <div className="category-stat-heading">
                          <span>{category}</span>
                          <span>
                            {count} products · {percentage.toFixed(1)}%
                          </span>
                        </div>

                        <div className="category-stat-track">
                          <div
                            className="category-stat-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
      ) : showCart ? (
        <main className="cart-page">
          <div className="cart-heading">
            <div>
              <p className="eyebrow">YOUR SHOPPING BAG</p>
              <h1>Shopping Cart</h1>
              <p>{cartCount} item(s) in your cart</p>
            </div>

            <button
              className="button-outline"
              onClick={() => setShowCart(false)}
            >
              Continue Shopping
            </button>
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
                    <div className="cart-item-info">
                      <h3>
                        {product.Brand} {product.Model_Name}
                      </h3>
                      <p>{product.Category}</p>
                      <p>Quantity: {quantity}</p>
                      <strong>
                        ₹{(
                          Number(product.Price_INR || 0) * quantity
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <button
                      className="button-outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            `/api/cart/${encodeURIComponent(product.Gadget_ID)}`,
                            {
                              method: "DELETE",
                              credentials: "include",
                            }
                          );

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(
                              data.error || "Could not remove product."
                            );
                          }

                          const cartResponse = await fetch("/api/cart", {
                            credentials: "include",
                          });
                          const cartData = await cartResponse.json();

                          if (!cartResponse.ok) {
                            throw new Error(
                              cartData.error || "Could not refresh cart."
                            );
                          }

                          const items = cartData.items || [];
                          setCartItems(items);
                          setCartCount(
                            items.reduce(
                              (total, item) => total + item.quantity,
                              0
                            )
                          );
                        } catch (error) {
                          alert(error.message || "Could not remove product.");
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h2>Order Summary</h2>
                <p>
                  Subtotal:{" "}
                  <strong>
                    ₹{cartItems
                      .reduce(
                        (total, item) =>
                          total +
                          Number(item.product.Price_INR || 0) *
                            item.quantity,
                        0
                      )
                      .toLocaleString("en-IN")}
                  </strong>
                </p>
                <p className="cart-note">
                  Taxes, shipping and checkout can be added later.
                </p>
              </div>
            </>
          )}
        </main>
      ) : (
        <main id="home">
          {!selectedProduct && (
            <>
              <section className="hero-banner">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    THE NEXT GENERATION OF TECH
                  </span>
                  <h1>
                    Latest Tech.
                    <br />
                    Smarter Choices.
                  </h1>
                  <p>
                    Explore smartphones, laptops, tablets, accessories and more
                    at the best prices.
                  </p>
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
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <img
                  className="hero-image"
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=90"
                  alt="Laptop and technology"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
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
                    <span className="category-tile-icon">
                      {categoryIcon(c)}
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
              </section>
              <section className="featured-section">
                <div className="section-title-row">
                  <div>
                    <p className="eyebrow">HANDPICKED FOR YOU</p>
                    <h2>Popular Products</h2>
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
              <button
                className="breadcrumb-back"
                onClick={() => setSelectedProduct(null)}
              >
                ← Back to products
              </button>
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
                  <div className="breadcrumbs">
                    Home <span>›</span> {selectedProduct.Category}{" "}
                    <span>›</span> {selectedProduct.Brand}
                  </div>
                  <span className="detail-category">
                    {selectedProduct.Category}
                  </span>
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
                    
                    <button
                      className="button-primary"
                      onClick={async () => {
                        if (!isSignedIn) {
                          openSignIn();
                          return;
                        }

                        try {
                          const response = await fetch(
                            `/api/cart/${encodeURIComponent(selectedProduct.Gadget_ID)}`,
                            {
                              method: "POST",
                              credentials: "include",
                            }
                          );

                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(data.error || "Could not add product to cart.");
                          }

                          const cartResponse = await fetch("/api/cart", {
                            credentials: "include",
                          });
                          const cartData = await cartResponse.json();

                          if (!cartResponse.ok) {
                            throw new Error(cartData.error || "Could not refresh cart.");
                          }

                          const items = cartData.items || [];
                          setCartItems(items);
                          setCartCount(
                            items.reduce((total, item) => total + item.quantity, 0)
                          );

                          alert("Product added to your cart!");
                        } catch (error) {
                          alert(error.message || "Could not add product to cart.");
                        }
                      }}
                    >
                      <Icon name="cart" /> Add to Cart
                    </button>

                  </div>
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
                </div>
              </div>
              <div className="spec-table-card">
                <h2>Specifications</h2>
                <div className="spec-table">
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
              <div className="section-title-row catalog-title-row">
                <div>
                  <p className="eyebrow">THE SHOPPINGS DESTINATION</p>
                  <h2>Explore Products</h2>
                  <p className="section-subtitle">
                    Find the right technology for your everyday life.
                  </p>
                </div>
                <span className="result-count">
                  {filteredProducts.length} products
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
                  <button className="button-primary" 
                    onClick={startAddProduct}
                  >
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
              <div className="product-grid">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.Gadget_ID}
                    product={p}
                    favorite={favorites.includes(p.Gadget_ID)}
                    onFavorite={toggleFavorite}
                    onOpen={openProduct}
                    isAdmin={isAdmin}
                    onEdit={startEditProduct}
                    onDelete={deleteProduct}
                  />
                ))}
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
                    <h2>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </h2>
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
                      onChange={(e) =>
                        updateDraft("Model_Name", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateDraft("Storage_GB", e.target.value)
                      }
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
                      onChange={(e) =>
                        updateDraft("Description", e.target.value)
                      }
                      placeholder="Product description"
                    />
                  </label>
                  <label className="availability-check">
                    <input
                      type="checkbox"
                      checked={draftProduct.Available}
                      onChange={(e) =>
                        updateDraft("Available", e.target.checked)
                      }
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
        <span className="product-brand">{product.Brand}</span>
        <strong className="product-name">
          {product.Model_Name || "Product"}
        </strong>
        <span className="product-spec-line">
          {product.RAM_GB ?? "—"} GB RAM · {product.Storage_GB ?? "—"} GB
        </span>
        <span className="card-price-row">
          <strong>{formatPrice(product.Price_INR)}</strong>
          <span className="fake-rating">
            <Icon name="star" size={12} /> 4.8
          </span>
        </span>
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
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
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
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}
function AuthenticatedCatalog() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <p className="loading-screen">Loading ShopSense...</p>;
  if (!isSignedIn) return <SignIn routing="hash" />;
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
