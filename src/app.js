const express = require("express")
const app = express()
const port = 3000
const connectDB = require("./config/database.js")
const cors = require("cors");
// const landingPage = require("./modules/landingPage.js")

const Category = require("./models/category.js")
const { Model } = require("mongoose");
const { skip } = require("node:test");
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













connectDB()
    .then(() => {
        console.log("Connection established");
        app.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })

    })
    .catch((err) => { console.log("Some error occured"); })
