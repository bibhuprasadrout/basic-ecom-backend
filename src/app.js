const express = require("express")
const app = express()
const port = 3000
const connectDB = require("./config/database.js")
// const landingPage = require("./modules/landingPage.js")

const Category = require("./models/category.js")
const { Model } = require("mongoose")
app.use(express.json())

app.get("/api/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.send(categories);
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
