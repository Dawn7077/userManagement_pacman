const bcrypt = require('bcrypt')
const userModel = require('../model/user') 
const { name } = require('ejs')

const signupPage = (req,res)=>{
    res.render('signup',{error:null})
}

const postSignup = async(req,res)=>{
    try{
        const {username, email,password} = req.body
        const existingUser = await userModel.findOne({name:username})
        if(!username||!password||!email)return res.render('signup',{error:'All fields are required!!'})
        if(password.length<6)return res.render('signup',{error:'Password length must be more than 6 '})
        if(!email.includes('@'))return res.render('signup',{error:'email must contain "@" '})

        if(existingUser){
            return res.render('signup',{error:'User name already exist ... use another one'})
             
        }
        else{
            
        const hashedpassword = await bcrypt.hash(password,10)
        console.log(hashedpassword)
        const newUser = new userModel({
            name:username,
            email,
            password : hashedpassword,
            score:0
        })

        await newUser.save()
        console.log(newUser)
        return res.render('login',{error:null})
        }
    }
    catch(err){
        console.log(err)
        return res.status(404).render('signup',{error:'Not able to create user account !!!'})
        
    }

}

const loginPage = (req,res)=>{
    res.render('login',{error:null})
}

const checkLogin = async(req,res)=>{
    try{
        const {username,password}=req.body

          if(!username||!password){
            return res.render('login',{error:'All fields must be filled'})
        }
 
        if(username ==='admin' && password==='123'){
            req.session.user = {username:'admin'}
            req.session.isAdmin = true
            return res.redirect('/admin/home')
            // res.render('admin',{users})
        } 

        const checkuser = await userModel.findOne({name:username})
        if(!checkuser){
            return res.status(404).render('login',{error:'user NOT FOUND  !!!'})
        }
        const checkPassword = await bcrypt.compare(password,checkuser.password)
        console.log('Plain password:', password)
        console.log('Stored hash:', checkuser.password)
        console.log('Comparison result:', checkPassword)
        if(checkPassword){
             req.session.user = checkuser
            req.session.isAdmin = false
            return res.redirect(`/user/home/${checkuser._id}`)
        }else{
            return res.render('login',{error:'Credential wrong',success:null})
        }
    }
    catch(er){
         return res.status(404).render('login',{error:'user information not correct  !!!'})
    }
}

const loadHome = async(req,res)=>{
    try {
        if(req.session.isAdmin){
            return res.redirect('/admin/home')
        }

        const cUser = req.session.user
        if(!cUser ||!cUser._id){
            return res.redirect('/user/login')
        }
        const user = await userModel.findById(req.session.user._id)
        if(!user){
            return res.redirect('/user/login')
        }
        
    return res.render('userHome',{user})
    } catch (err) {
        console.log(err)
        res.redirect('/user/login')
    }
}

const logout = (req,res)=>{
        res.set('Cache-Control','no-store','must-revalidate')
        res.set('Pragma','no-cache')
        res.set('Expires','0')
        res.set('Surrogate-Control','no-store') 

        res.clearCookie('app.io')
        
    if(req.session.isAdmin){
        req.session.isAdmin=false
    }
    req.session.destroy((err)=>{
        if(err){
            console.log(err)
        }
        
        
        
        return res.redirect('/user/login')
    })
    
}




module.exports = {
    signupPage,
    postSignup,
    loginPage,
    checkLogin,
    loadHome,logout
}