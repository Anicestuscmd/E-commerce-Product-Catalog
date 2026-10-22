# ShopSense setup on a new laptop

This guide is for running the ShopSense React frontend and Express API locally, without the original developer's PC running.

## Required services

- Node.js (use a current LTS release)
- MongoDB reachable from the laptop (local MongoDB or MongoDB Atlas)
- Clerk application keys for sign-in
- Qdrant Cloud cluster and API key for vector search
- Internet access on first AI search so Transformers.js can download the embedding model

## 1. Download the repository

Clone the repository or download the ZIP from:
https://github.com/Anicestuscmd/E-commerce-Product-Catalog

Extract it, then open a terminal in the project root.

## 2. Configure the backend

Copy `.env.example` to `.env` and set:

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: database name (default: `shopsense`)
- `CLERK_SECRET_KEY`: secret key from the Clerk dashboard
- `QDRANT_URL`: Qdrant cluster URL
- `QDRANT_API_KEY`: Qdrant API key
- `PORT`: backend port (default: 5000)

Do not commit `.env` or share the Clerk secret/Qdrant key in public messages.

## 3. Configure the frontend

Create `frontend/.env.local` using `frontend/.env.example`. Set `VITE_CLERK_PUBLISHABLE_KEY` to the publishable key from the same Clerk application.

The Clerk publishable and secret keys must belong to the same Clerk application.

## 4. Install packages

From the project root:

```bash
npm install
cd frontend
npm install
cd ..
```

## 5. Import the product catalogue

Make sure MongoDB is running or that `MONGODB_URI` points to a reachable database. From the project root:

```bash
node import-data.js
```

This imports `products.csv` into the `shopsense.products` collection. It is safe to rerun to update matching Gadget_ID records.

## 6. Start the API

In terminal window 1, from the project root:

```bash
node server.js
```

The API should listen on port 5000 (or the configured `PORT`). Check `http://localhost:5000/api/status`.

## 7. Start the frontend

In terminal window 2:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## 8. Set up Qdrant for semantic search

1. Create a Qdrant Cloud cluster and copy its HTTPS URL and API key into the root `.env`.
2. Restart the API after changing environment variables.
3. Check `http://localhost:5000/api/status`; the response should show `"qdrant": true`.
4. The AI search model (`Xenova/all-MiniLM-L6-v2`) is downloaded by Transformers.js on first use, so the first AI search may take longer.
5. The product vectors must be indexed in the `shopsense_products` Qdrant collection. Sign in with an administrator account and use the project's admin reindex action if the collection is empty.

If Qdrant is not configured/reachable, keyword search can still work, but AI semantic search and vector recommendations will not work.

## Common issues

- **Missing `CLERK_SECRET_KEY`**: set the backend key in root `.env`.
- **Missing `VITE_CLERK_PUBLISHABLE_KEY`**: set it in `frontend/.env.local` and restart Vite.
- **MongoDB connection failure**: confirm the URI, database network access and credentials.
- **Qdrant 401/403**: check the Qdrant URL and API key.
- **AI search returns no results**: verify Qdrant is ready and products have been indexed.
- **Friend's laptop does not need your laptop**: all services must be either running locally on the friend's laptop or hosted independently and reachable from it.
