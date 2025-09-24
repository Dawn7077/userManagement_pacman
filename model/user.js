const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    score:{
        type:Number
    }
})

const user = new mongoose.model('users_acc',userSchema)

module.exports = user