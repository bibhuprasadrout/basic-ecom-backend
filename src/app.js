const express = require("express")
const app = express()
const port = 3000
const connectDB = require("./config/database.js")
const cors = require("cors");
// const landingPage = require("./modules/landingPage.js")
const crypto = require("crypto");

const Category = require("./models/category.js");
const { Model } = require("mongoose");
const { skip } = require("node:test");
const User = require("./models/user.js");
app.use(express.json());
app.use(cors());

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
    console.log("Something went wrong:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/login/", async (req, res) => {
  try {
    const { email, password } = req.query;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    res.json({
      success: true,
      message: "Login successful",
      user: { email: user.email },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error!",
      error: err.message,
    });
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
