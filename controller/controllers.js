const bcrypt = require('bcrypt')
const userModel = require('../model/user')
const { message } = require('statuses')

const adminHome = async(req,res)=>{
    try{
        const page = Number(req.query.page) ||1
        const limit = 5
        const skip = (page-1)*limit
        const totalUsers = await userModel.countDocuments()
        const users = await userModel.find().skip(skip).limit(limit)
        const totalPages = Math.ceil(totalUsers/limit)
        return res.render('admin',{users,currentPage:page,totalPages,totalUsers})
    }catch(err){
        console.log(err)
        res.status(500).send("Error loading data..")
    }
} 
// const adminHome = async(req,res)=>{
//     try{
//         const users = await userModel.find()
//         return res.render('admin',{users})
//     }catch(err){
//         console.log(err)
//         res.status(500).send("Error loading data..")
//     }
// } 

const addUser = async(req,res)=>{
    console.log(req.body)
    try{
        const {name,email,password,score} =req.body
        existingEmail =await userModel.findOne({email})
        if(existingEmail){
            console.log("error email")
            return res.send(`<script> alert('Email already exists!')
  window.location.href = '/admin/home'
</script>`)
        }

        const hashedpassword = await bcrypt.hash(password,10)
        const newUser = new userModel({
            name,
            email,
            password:hashedpassword,
            score
        })

        await newUser.save()
        // return res.redirect('/admin/home')
        return res.send(`<script> alert('USER ADDED!')
                            window.location.href = '/admin/home'
                            </script>`)
        
    }

    catch(err){
        console.log(err)
        return res.send(`<script> alert('Error adding user!')
  window.location.href = '/admin/home'
</script>`)
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
            const hashedpassword = await bcrypt.hash(password,10)
            updatedData.password = hashedpassword
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
        // return res.redirect('/admin/home') 
    return res.json({ success: true ,redirect:'/admin/home' } );
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