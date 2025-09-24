const bcrypt = require('bcrypt')
const userModel = require('../model/user')

const adminHome = async(req,res)=>{
    try{
        const users = await userModel.find()
        return res.render('admin',{users})
    }catch(err){
        console.log(err)
        res.status(500).send("Error loading data..")
    }
} 

const addUser = async(req,res)=>{
    console.log(req.body)
    try{
        const {name,email,password,score} =req.body
        const hashedpassword = await bcrypt.hash(password,10)
        const newUser = new userModel({
            name,
            email,
            password:hashedpassword,
            score
        })

        await newUser.save()
        return res.redirect('/admin/home')
    }

    catch(err){
        console.log(err)
        res.status(500).send('error adding user')
    }
}

const getUser = async(req,res)=>{
    try{
        const user_id = req.params.id
        const user = await userModel.findById(user_id)
       if(!user){
        res.status(404).send({message:'user not found'})
       }
        const {name,email,score} = user
        res.send({name,email,score})
    }
    catch(err){
        console.log(err)
        res.status(500).send('Error fetching user')
    }
}

const editpage = async (req,res)=>{
    try{
        const user_id = req.params.id
        const user = await userModel.findById(user_id)
        const {name,email,password,score}= user 
        return res.render('edit',{user})
    }catch(err){
        console.log(err)
        res.status(500).send(err.message)
    }

}

const editUser = async (req,res)=>{
    try{ 
        const userId = req.params.id
        const user = await userModel.findById(userId)
        const{name,email,password,score} =req.body 
        const updatedData = {name,email,score} 
        if(password&&password.trim()!==""){
            updatedData.password = password
        } 
        if(name===''){
            updatedData.name= user.name
        } 
            
        if(email===''){
            updatedData.email= user.email
        }
        if(score===''){
            updatedData.score= user.score
        }
        // await userModel.updateOne({name:namei},{$set:{name,email,score}})
        await userModel.findByIdAndUpdate(userId,updatedData)
        return res.redirect('/admin/home')


    }catch(err){
        console.log(err)
        res.send('Error updating user info....')
    }
}

const deleteUser = async(req,res)=>{
    try{
        const user_id = req.params.id
        await userModel.findByIdAndDelete(user_id)
        return res.redirect('/admin/home')
    }
    catch(err){
        console.log(err)
        res.status(500).send('Error deleting user')
    }
}

// const logout = (req,res)=>{
//     req.session.destroy((err)=>{
//         console.log(err)
//     })
//     res.clearCookie('app.io')
     

//     res.redirect('/user/login')
// }

module.exports = {
    adminHome,
    addUser,
    getUser,
    editpage,
    editUser,
    deleteUser,
    
}