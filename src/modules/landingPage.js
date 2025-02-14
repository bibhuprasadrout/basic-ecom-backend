const express = require("express")
const landingPage = express()

const allProductCategories = require("../models/allProductCategories.json")

// app.get('/', (req, res) => {
//   res.send(allProductCategories[0]?.name)
// })

landingPage.get("/", (req, res) => {
    res.send(allProductCategories[0]?.name)
})
