const express = require("express")
const app = express()
const port = 3000
const connectDB = require("./config/database.js")
const cors = require("cors");
// const landingPage = require("./modules/landingPage.js")
const crypto = require("crypto");

const Category = require("./models/category.js");
const Products = require("./models/products.js");
const { skip } = require("node:test");
const User = require("./models/user.js");
app.use(express.json());
app.use(cors());

const catchError = (err, res) => {
  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Validation error",
      error: err.message,
    });
  }

  // Handle MongoDB network errors
  if (err.name === "MongoNetworkError") {
    return res.status(503).json({
      success: false,
      status: 503,
      message: "Database connection error. Please try again later.",
    });
  }

  // ✅ Generic error fallback (for any unhandled errors)
  return res.status(500).json({
    success: false,
    status: 500,
    message: "Something went wrong. Please try again later.",
    error: err.message || "Unknown error",
  });

  // Handle any other known errors
  return res.status(err.status).json({
    success: false,
    status: err.status,
    message: err.message || "An error occurred.",
  });
};

app.get("/api/", async (req, res) => {
  fetchItems = req.query.fetchItems || 0;
  skipItems = req.query.skipItems || 0;
  let categories;
  try {
    fetchItems === "0" || fetchItems === 0
      ? (categories = await Category.find({ _id: null }))
      : (categories = await Category.find().skip(skipItems).limit(fetchItems));
    const categoriesLength = await Category.estimatedDocumentCount();
    const response = { categories, categoriesLength };
    res.send(response);
  } catch (err) {
    catchError(err, res);
  }
});

app.get("/api/products/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const products = await Products.find({ category: slug });
    res.send(products);
  } catch {
    catchError(err, res);
  }
});

app.post("/api/signin/", async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        status: 422,
        message: "Both email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        status: 404,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Login successful",
      user: user.username,
      email: user.email,
    });
  } catch (err) {
    catchError(err, res);
  }
});


// app.get("/api/updateUser", async (req, res) => {
//   try {
//     res.status(202).json({ message: "User password update process started." });
//     setImmediate(async () => {
//       const users = await User.find();
//       for (const user of users) {
//         if (!user.salt && user.password) {
//           console.log(`Updating password for user: ${user.email}`);
//           console.log("user password:", user?.password);

//           user.salt = crypto.randomBytes(16).toString("hex");
//           user.password = crypto
//             .pbkdf2Sync(user.password, user.salt, 10000, 64, "sha512")
//             .toString("hex");

//           console.log("user salt:", user?.salt);
//           console.log("user password:", user?.password);

//           await user.save();
//         } else {
//           console.warn(`Skipping user ${user?.email}: No password found`);
//         }
//       }
//       console.log("All users updated successfully!");
//       res.status(200).json({ message: "User password update completed" });
//     });
//   } catch (error) {
//     console.error("Error updating users:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// });








connectDB()
    .then(() => {
        console.log("Connection established");
        app.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })

    })
    .catch((err) => { console.log("Some error occured"); })
