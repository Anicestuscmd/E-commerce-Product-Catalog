require("dotenv").config();

console.log("MongoDB URI configured:", !!process.env.MONGODB_URI);
console.log("Clerk secret configured:", !!process.env.CLERK_SECRET_KEY);