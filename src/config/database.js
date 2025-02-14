const mongoose = require('mongoose')
const connectDB = async () => {
    await mongoose.connect("mongodb+srv://bibhurs:1234@toycluster.ddrg3.mongodb.net/basic-ecom-database?retryWrites=true&w=majority&appName=ToyCluster")
}

module.exports = connectDB;