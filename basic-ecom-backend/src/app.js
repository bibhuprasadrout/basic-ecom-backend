// core module and dependency module imports
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { skip } = require("node:test");
const app = express();
const port = process.env.PORT;

// app module imports → these are module created by developers
const { connectDB } = require("./config/database.js");

// core and dependency middlewares
app.use(express.json());
app.use(cors());
// this is usually how cors is configured
// cors({
//     origin: "http://localhost:3000", // only allow this frontend
//     methods: ["GET", "POST", "PATCH", "DELETE"], // allowed HTTP methods
//     credentials: true, // allow cookies/authorization headers
//   })
// );

// this is the only recomended way to provide secret to the cookie parser...i.e.to do it within the root file of the app
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: `../.env.${process.env.NODE_ENV}` });
app.use(cookieParser(process.env.JWT_SECRET_KEY));

const { authMiddleware } = require("./middlewares");

const {
  authRouter,
  userRouter,
  categoryRouter,
  productRouter,
  cartRouter,
  wishlistRouter,
  checkoutRouter,
} = require("./routes");

// importing the error handler function
const { errorHandler } = require("./utils");

//test if the server is responding
app.use("/test", (req, res) => {
  res.status(200).send("Hello from server!");
});

// connecting to DB using an IIFE...noice!
(async () => {
  try {
    await connectDB();
    console.log("Connection established");
    const server = app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
    // handle error in case the port is already occupied with a proccess or someother error occurs
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Try a different port.`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
      }
    });
  } catch (err) {
    console.log("Some error occured");
  }
})();

// using auth middleware
app.use("/api/v1/auth", authMiddleware);

// connecting routes in order
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", wishlistRouter);
app.use("/", checkoutRouter);

app.use(errorHandler);
