const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async() =>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log('databse connected...Successful')
    }catch(e){
        console.log(e)
    }
}

 
module.exports =  connectDB
