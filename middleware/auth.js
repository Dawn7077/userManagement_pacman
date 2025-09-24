const checkSession = (req,res,next)=>{ //to check if a session has been created becuase they have been logged in
    if(req.session.user||req.session.isAdmin){
        next()
    }else{ 
        return res.redirect('/user/login')
    }
}
const adminCheckSession = (req,res,next)=>{ //to check if a session has been created becuase they have been logged in
    if(!req.session){
        return res.redirect('/user/login')
    }
    
    if(req.session.isAdmin||(req.session.user&&req.session.user.username==='admin')){
        next()
    }else{ 
        if(req.session){
            req.session.destroy(()=>{
            res.clearCookie('app.io')
            return res.redirect('/user/login')
        })
        }else{
            return res.redirect('/user/login')
        }
    }
}

const byPassLogIn =(req,res,next)=>{ // to prevent logged in user from seeing login page again    login page 
    if( req.session && req.session.user && !req.session.isAdmin){
        return res.redirect(`/user/home/${req.session.user._id}`)
    }else if(req.session && req.session.isAdmin ){
        return res.redirect('/admin/home')
    }
    else{
        next()        
    }
}

const isLoggedin = (req,res,next)=>{                    // home page reload 
    if(req.session.user && !req.session.isAdmin){
        return res.redirect(`/user/home/${req.session.user._id}`)
    }else if(req.session.isAdmin){
        return res.redirect('/admin/home')
    }
    else{
       return next()
    }
}
const Cache= (req,res,next)=>{
    res.set('Cache-Control','no-store','must-revalidate')
    res.set('Pragma','no-cache')
    res.set('Expires','0')
    next()
}
const NoCache= (req,res,next)=>{
    res.set('Cache-Control','no-store','must-revalidate')
    res.set('Pragma','no-cache')
    res.set('Expires','0')
    res.set('Surrogate-Control','no-store')
    res.set('X-Accel-Expires','0')
    next()
}



module.exports ={adminCheckSession,checkSession, isLoggedin, Cache, NoCache,byPassLogIn}