const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async() =>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log('database connected...Successful')
    }catch(e){
        console.log(e)
    }
}

 
module.exports =  connectDB
