const express = require('express')
const app = express()
const session = require('express-session')
const nocache =require('nocache')
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config({path:'.env'})

const port = process.env.PORT||4000
const morgan  = require('morgan')
const crypt = require('bcrypt')
const path = require('path')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const connectDB = require('./db/connectDB')
const {Cache,NoCache} = require('./middleware/auth')
const { message } = require('statuses')
const { nextTick } = require('process')
const { error } = require('console')

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(express.static(path.join(__dirname ,'public')))
app.use(expressLayouts)
app.set('layout','layouts/main')
app.set('views',path.join(__dirname,'views'))
app.set('view engine', 'ejs')

 
app.use(session({
    secret:process.env.SESSION_KEY||'secretkey',
    resave:false,
    saveUninitialized:false,
    name:'app.io',
    cookie:{
        maxAge:1000*60*60,
        httpOnly:true,
        secure:false
    }

}))
app.use((req,res,next)=>{
    res.set('Cache-Control','no-store')
    res.set('Pragma','no-cache')
    res.set('Expires','0')
    next()
})
 

connectDB()
app.use(morgan('tiny'))

 

app.get('/',(req,res)=>{
    res.redirect('/user/login')
})
app.use('/user',userRouter)
app.use('/admin',adminRouter)



 app.get('/1',(req,res)=>{
    res.render('pacman',{name:'dawn',score:0})
 })

app.all('/*splat',(req,res,next)=>{
    const err = new Error('The page requested not available')
    err.status = 'error has happened'
    err.statusCode = 404
    next(err)

})
app.use((err,req,res,next)=>{
    err.status = err.status||'defualt error'
    err.statusCode = err.statusCode||400
    res.status(err.statusCode).json({message:err.message})
})







app.listen(port,()=>{
    console.log(`Listening on port:${port}  link: http://localhost:${port}`)
})