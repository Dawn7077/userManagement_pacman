const express = require('express')
const router = express.Router()
const userModel = require('../model/user')
const bcrypt = require('bcrypt')
const { retry, message } = require('statuses')
const {checkSession,isLoggedin,Cache,byPassLogIn, NoCache} = require('../middleware/auth')
const {
    signupPage,
    postSignup,
    loginPage,
    checkLogin,
    loadHome,
    logout,
} = require('../controller/userController')


router.get('/signup',isLoggedin,Cache,signupPage)

router.post('/signup',Cache,postSignup)

router.get('/login',byPassLogIn,Cache,loginPage)

router.post('/login',byPassLogIn,Cache,checkLogin)

// router.get('/home/:id',async(req,res)=>{
//     try{
//         const
//     }
//     res.render('userHome')
// })

router.get('/home/:id',checkSession,NoCache,loadHome)

router.get('/pacman/:id',checkSession,async(req,res)=>{
    try {
        const userId = req.params.id

        let hasAccess =false
        if(req.session.isAdmin){
            hasAccess =true
        }else if(req.session.user && req.session.user._id){
            hasAccess =req.session.user._id.toString() === userId
        }


        // if(req.session.user._id.toString()!==userId && !req.session.isAdmin){
        //     return res.status(403).render('error',{message:'access denied'})
        // }
        
        if(!hasAccess){
            return res.status(403).render('error',{message:'access denied'})
        }

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).render('error',{message:'user not found'})
        }
        res.render('pacman',{name:user.name,score:user.score,userId:user._id})
        // res.render('pacman' )

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
})

router.post('/updateScore',checkSession,async(req,res)=>{
    try {
        const {userId,score} = req.body

        let hasAccess =false
        
        if(req.session.isAdmin){
            hasAccess =true
        }else if(req.session.user && req.session.user._id){
            hasAccess = req.session.user._id.toString() === userId
        }

        if(!hasAccess){
            return res.status(403).json({error:'Access denied'})
        }

        // if(req.session.user._id.toString()!==userId && !req.session.isAdmin){
        //     return res.status(403).json({error:'Access denied'})
        // }
 
        // const updateduser = {userId,score}
        const user = await userModel.findById(userId) 
        if(!user){
            return res.status(404).json({error:'user not found'})
        }

        if(user.score<score){
            user.score =score
            await user.save()
        }
        res.json({success:true, score:user.score})
        } catch (error) {
            console.log(error)
            res.json({error:'Error updating user score....'})
        }
    })

router.get('/logout',NoCache,logout)

module.exports = router