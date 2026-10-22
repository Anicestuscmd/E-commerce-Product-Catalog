import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App.jsx";
import "./index.css";
import "./redesign.css";
import "./auth-fix.css";
import "./mobile-fix.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY in frontend/.env.local"
  );
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={publishableKey}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
    afterSignOutUrl="/"
  >
    <App />
  </ClerkProvider>
);