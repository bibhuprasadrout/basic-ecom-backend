const mongoose = require("mongoose");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
/* Explanation: This block sets up dependencies and configuration for your database layer. `mongoose` is the library that manages the MongoDB connection and provides the schema/model system used throughout the app. This file uses CommonJS (`require` / `module.exports`), matching your backend’s module style. The `dotenv` call loads environment variables from a specific file, based on `NODE_ENV`. For example, if `NODE_ENV=development`, it will try to load `.env.development`. This is an environment-based configuration pattern: it lets you keep different credentials/URLs for different environments without changing code.Important underlying concept: environment variables (like `DB_CONNECTION_STRING`) are not “magic”; they are simply strings provided to the Node process. `dotenv` is just a local helper that reads a file and puts those strings into `process.env`. In production, you usually don’t rely on `.env.*` files at all; instead, your hosting platform injects those variables securely. */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    if (process.env.NODE_ENV === "production") console.log("MongoDB connected in production");
    else if (process.env.NODE_ENV === "development") console.log("MongoDB connected locally");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
/* Explanation: This block defines the database connection function used during server startup.`connectDB` is `async` because connecting to a database is an I/O operation: it involves network communication, DNS resolution, authentication, and handshake protocols. `await mongoose.connect(...)` pauses this function until the connection either succeeds or fails. If it succeeds, your app can safely start accepting requests that depend on the database. If it fails, you log the error and exit the process with code 1.The “fail fast” exit is an important backend reliability principle: a server that cannot reach its database usually cannot serve most endpoints correctly. Exiting forces your process manager (or you) to notice the failure and restart or fix configuration, rather than running a “half-broken” server that returns inconsistent errors. The environment-specific console logs are just a visibility tool so you know which mode you’re running in. In larger systems, you’d often log the DB host and use structured logging, but you should never log secrets like passwords. */
module.exports = { connectDB };
/* Explanation: This exports the connect function so the main app (`app.js`) can call it during startup. Exporting a single function keeps the database configuration centralized: if you later need to add connection options, retry logic, or event listeners, you do it here and the rest of the app stays unchanged. */
