const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const userModel = require('../model/user')
const {adminHome,addUser,getUser,
    editpage,editUser, deleteUser

} = require('../controller/controllers')
const {Cache,checkSession,isLoggedin,NoCache,adminCheckSession}= require('../middleware/auth')
const { loadHome ,logout} = require('../controller/userController')



router.get('/home',NoCache,adminCheckSession,adminHome)
// router.get('/hompage',Cache,adminCheckSession,loadHome)

router.post('/add',adminCheckSession,addUser)

router.get('/get/:id',adminCheckSession,getUser)

router.get('/edit/:id',adminCheckSession,NoCache,editpage)


router.post('/edit/:id',adminCheckSession,NoCache,editUser)

router.get('/delete/:id',adminCheckSession,NoCache,deleteUser)

router.get('/logout',NoCache,logout)

module.exports = router