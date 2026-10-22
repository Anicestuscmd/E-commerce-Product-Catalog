
const fs = require("fs");
const csv = require("csv-parser");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

const products = [];
const numericFields = [
  "RAM_GB",
  "Storage_GB",
  "Screen_Size_inch",
  "Battery_mAh",
  "Price_INR",
  "Launch_Year"
];

async function importProducts() {
  try {
    // Read and parse the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream("./products.csv")
        .pipe(csv())
        .on("data", (row) => {
          for (const field of numericFields) {
            const value = row[field];
            row[field] =
              value === undefined || value.trim() === ""
                ? null
                : Number(value);
          }

          row.Popular_in_India =
            row.Popular_in_India?.trim().toLowerCase() === "yes";

          products.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });

    if (products.length === 0) {
      throw new Error("No products found in products.csv");
    }

    await client.connect();

    const db = client.db(process.env.MONGODB_DB || "shopsense");
    const collection = db.collection("products");

    // Use Gadget_ID to identify each product
    await collection.createIndex(
      { Gadget_ID: 1 },
      { unique: true }
    );

    // Insert new products or update existing ones
    const operations = products.map((product) => ({
      replaceOne: {
        filter: { Gadget_ID: product.Gadget_ID },
        replacement: product,
        upsert: true
      }
    }));

    const result = await collection.bulkWrite(operations);

    console.log("Product import completed!");
    console.log("CSV records:", products.length);
    console.log("Inserted:", result.upsertedCount);
    console.log("Updated:", result.modifiedCount);
    console.log(
      "Total products in database:",
      await collection.countDocuments()
    );
  } catch (error) {
    console.error("Import failed:", error.message);
  } finally {
    await client.close();
  }
}

importProducts();
