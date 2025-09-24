
//board dimensions 32pxby32px 21 tiles row 19 tiles column
let board 
const rowCount = 21
const coloumnCount = 19
const tileSize =32;
const boardWidth = coloumnCount * tileSize
const boardHeigth = rowCount * tileSize
let context;
//images
let blueGhostImg;
let redGhostImg;
let pinkGhostImg;
let orangeGhostImg;
let pacmanUpImg;
let pacmanDownImg;
let pacmanleftImg;
let pacmanRightImg;
let wallImg;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX X XX",
    "OOOX X       X X XO",
    "XXXX X XXrXX X X XX",
    "        bpo        ",
    "XXXX X XXXXX X X XX",
    "OOOX X       X X XO",
    "XXXX X XXXXX X X XX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const walls =new Set();
const foods =new Set();
const ghosts =new Set();
let pacman;

const directions = ['U','D','L','R']
let score = 0
let lives = 3
let gameOver = false

window.onload = function(){
    board = document.getElementById("board")
    board.height = boardHeigth
    board.width = boardWidth
    context = board.getContext("2d")//used for drawing that is a paintbrush

    loadImages(()=>{
        loadMap()
    // console.log(walls.size)
    // console.log(foods.size)
    // console.log(ghosts.size)
    for(let ghost of ghosts.values()){
        const newDirection = directions[Math.floor(Math.random()*4)] // random no. b/w 0-3 for the array indicies fo [U,D,L,R]
        ghost.updateDirection(newDirection)
    }
     
    update()
    document.addEventListener("keyup",movePacman)
    })
    }

function loadMap(){
    walls.clear()
    foods.clear()
    ghosts.clear()

    for(let r = 0; r<rowCount;r++){
        for(let c=0;c<coloumnCount;c++){
            const row = tileMap[r]
            const tileMapChar = row[c]

            const x = c*tileSize
            const y = r*tileSize

            if(tileMapChar=="X"){ //block wall
                const wall = new Block(wallImg,x,y,tileSize,tileSize)
                walls.add(wall)
            }else if(tileMapChar=="b"){ //block wall
                const ghost = new Block(blueGhostImg,x,y,tileSize,tileSize)
                ghosts.add(ghost)
            }else if(tileMapChar=="o"){ //block wall
                const ghost = new Block(orangeGhostImg,x,y,tileSize,tileSize)
                ghosts.add(ghost)
            }else if(tileMapChar=="p"){ //block wall
                const ghost = new Block(pinkGhostImg,x,y,tileSize,tileSize)
                ghosts.add(ghost)
            }else if(tileMapChar=="r"){ //block wall
                const ghost = new Block(redGhostImg,x,y,tileSize,tileSize)
                ghosts.add(ghost)
            }
            else if(tileMapChar=="P"){ //block wall
               pacman = new Block(pacmanRightImg,x,y,tileSize,tileSize)
                 
            }else if(tileMapChar==" "){ //block wall
                const food =new Block(null,x+14,y+14,4,4)
                foods.add(food)
            }
        }
    }
}

function update(){
    if(gameOver){
        return
    }
    move()
    draw()
    setTimeout(update,50)
}

function draw(){
    context.clearRect(0,0,board.width,board.height)
    context.drawImage(pacman.image,pacman.x,pacman.y,pacman.width,pacman.height)
    for(let ghost of ghosts.values()){
       context.drawImage(ghost.image,ghost.x,ghost.y,ghost.width,ghost.height)
    }
    
    for(let wall of walls.values()){
       context.drawImage(wall.image,wall.x,wall.y,wall.width,wall.height)
    }
    context.fillStyle ="white"
    for(let food of foods.values()){
       context.fillRect(food.x,food.y,food.width,food.height)
   }
   //score
   context.fillStyle ='white'
   context.font = '14px sans-serif'
   if(gameOver){
    context.fillText("Game Over: "+ String(score) , tileSize/2, tileSize/2)
   }
   else{
    context.fillText("x"+ String(lives) +" "+String(score), tileSize/2, tileSize/2)
   }

}

function move(){
    pacman.x += pacman.velocityX
    pacman.y += pacman.velocityY
    //check wall collision
    for(let wall of walls.values()){
        if(collision(pacman,wall)){
            pacman.x -= pacman.velocityX
            pacman.y -= pacman.velocityY
            break;
        }
        
        
    }
    //portal movement pacman
    if(pacman.x <= 0 ){
            pacman.x = boardWidth  - pacman.width
        }
    else if(pacman.x + pacman.width >= boardWidth){
            pacman.x = 0
        }


    for(let ghost of ghosts){
        if(collision(ghost,pacman)){
            lives-= 1
            document.getElementById('pScore').innerText=`Score:${score}`
            playerscore = score
            console.log(playerscore)
            if(lives == 0 ){
                gameOver = true
                fetch('/user/updateScore',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({userId:userId,score:playerscore})
                })
                .then(res=>res.json())
                .then(data=>console.log('SCORE UPDATED:',data))
                .catch(err=>console.error('error updating:',err))
                
                return
            }
            resetPositions()
        }

        ghost.x += ghost.velocityX
        ghost.y += ghost.velocityY
        for(let wall of walls.values()){

            if (collision(ghost,wall)){
                ghost.x -= ghost.velocityX
                ghost.y -= ghost.velocityY
                const newDirection = directions[Math.floor(Math.random()*4)]
                ghost.updateDirection(newDirection)
            }
        }
        if(ghost.y == tileSize*9 && ghost.direction!= 'U' &&ghost.direction!= 'D'){
                const ud_Direction = ['U','D']
                const newDirection = ud_Direction[Math.floor(Math.random()*2)]
                ghost.updateDirection(newDirection)
                // ghost.updateDirection('U')
            }
        //  if( ghost.x <= 0 ){
        //         ghost.x = boardWidth - ghost.width
        //         // const newDirection = directions[Math.floor(Math.random()*4)]
        //         // ghost.updateDirection(newDirection)
        //     }
        //     else if (ghost.x + ghost.width >= boardWidth){
        //         ghost.x = 0 
        //     }
            
            
    }
    //checl food collision
    let foodEaten = null
    for(let food of foods){
        if (collision(pacman,food)){
            foodEaten = food    
            score+=10
            break
        }
    }
    foods.delete(foodEaten)
    //next level
    if(foods.size == 0 ){
        loadMap()
        resetPositions()
    }

}

function movePacman(e){
    if(gameOver){
        playerscore=score
        loadMap()
        resetPositions()
        lives =3
        score =0 
        gameOver =false
        update() // restarting the game loop
        return
    }
    if(e.code == "ArrowUp" || e.code == "KeyW"){
        pacman.updateDirection('U')
    }
    else if(e.code == "ArrowDown" || e.code == "KeyS"){
        pacman.updateDirection('D')
    }
    else if(e.code == "ArrowLeft" || e.code == "KeyA"){
        pacman.updateDirection('L')
    }
    else if(e.code == "ArrowRight" || e.code == "KeyD"){
        pacman.updateDirection('R')
    }
    //update pacman images
    if(pacman.direction =='U'){
        pacman.image = pacmanUpImg
    }
    else if(pacman.direction =='D'){
        pacman.image = pacmanDownImg
    }
    else if(pacman.direction =='L'){
        pacman.image = pacmanleftImg
    }
    else if(pacman.direction =='R'){
        pacman.image = pacmanRightImg
    }
}

function collision(a,b){
    return  a.x < b.x + b.width && 
            a.x + a.width > b.x && 
            a.y < b.y + b.height && 
            a.y + a.height > b.y


}

function loadImages(cb){

    let imagesToLoad =9
    let imagesLoaded =0
    function onImageLoad(){
        imagesLoaded++
        console.log(`Loaded ${imagesLoaded}/${imagesToLoad}`)
        if(imagesLoaded>=imagesToLoad){
            console.log("all images done")
            cb()
        }

    }

    function onImageError(){
        console.warn('failed to load',src)
        imagesLoaded++
        if(imagesLoaded>=imagesToLoad){
            console.log('completed imageloading')
            cb()
        }
    }
    wallImg = new Image();
    wallImg.onload = onImageLoad
    wallImg.onerror = ()=> onImageError("/images/wall.png")
    wallImg.src="/images/wall.png"

    blueGhostImg= new Image()
    blueGhostImg.onload = onImageLoad
    blueGhostImg.onerror = ()=> onImageError("/images/blueGhost.png")
    blueGhostImg.src="/images/blueGhost.png"

    orangeGhostImg= new Image()
    orangeGhostImg.onload = onImageLoad
    orangeGhostImg.onerror = ()=> onImageError("/images/orangeGhost.png")
    orangeGhostImg.src="/images/orangeGhost.png"
    
    pinkGhostImg= new Image()
    pinkGhostImg.onload = onImageLoad
    pinkGhostImg.onerror = ()=> onImageError("/images/pinkGhost.png")
    pinkGhostImg.src="/images/pinkGhost.png"
    
    redGhostImg= new Image()
    redGhostImg.onload = onImageLoad
    redGhostImg.onerror = ()=> onImageError("/images/redGhost.png")
    redGhostImg.src="/images/redGhost.png"

    pacmanDownImg= new Image()
    pacmanDownImg.onload = onImageLoad
    pacmanDownImg.onerror = ()=> onImageError("/images/pacmanDown.png")
    pacmanDownImg.src="/images/pacmanDown.png"
    
    pacmanUpImg= new Image()
    pacmanUpImg.onload = onImageLoad
    pacmanUpImg.onerror = ()=> onImageError("/images/pacmanUp.png")
    pacmanUpImg.src="/images/pacmanUp.png"

    pacmanRightImg= new Image()
    pacmanRightImg.onload = onImageLoad
    pacmanRightImg.onerror = ()=> onImageError("/images/pacmanRight.png")
    pacmanRightImg.src="/images/pacmanRight.png"
    
    pacmanleftImg= new Image()
    pacmanleftImg.onload = onImageLoad
    pacmanleftImg.onerror = ()=> onImageError("/images/pacmanLeft.png")
    pacmanleftImg.src="/images/pacmanLeft.png"
}

// function loadImages(callback){
//     let imagesToLoad = 9
//     let imagesLoaded = 0
    
//     function onImageLoad() {
//         imagesLoaded++
//         console.log(`Loaded ${imagesLoaded}/${imagesToLoad} images`)
//         if (imagesLoaded >= imagesToLoad) {
//             callback()
//         }
//     }
    
//     function onImageError(src) {
//         console.warn("Failed to load:", src)
//         imagesLoaded++
//         if (imagesLoaded >= imagesToLoad) {
//             callback()
//         }
//     }

//     wallImg = new Image();
//     wallImg.onload = onImageLoad
//     wallImg.onerror = () => onImageError("./images/wall.png")
//     wallImg.src = "./images/wall.png"

//     blueGhostImg = new Image()
//     blueGhostImg.onload = onImageLoad
//     blueGhostImg.onerror = () => onImageError("./images/blueGhost.png")
//     blueGhostImg.src = "./images/blueGhost.png"

//     orangeGhostImg = new Image()
//     orangeGhostImg.onload = onImageLoad
//     orangeGhostImg.onerror = () => onImageError("./images/orangeGhost.png")
//     orangeGhostImg.src = "./images/orangeGhost.png"
    
//     pinkGhostImg = new Image()
//     pinkGhostImg.onload = onImageLoad
//     pinkGhostImg.onerror = () => onImageError("./images/pinkGhost.png")
//     pinkGhostImg.src = "./images/pinkGhost.png"
    
//     redGhostImg = new Image()
//     redGhostImg.onload = onImageLoad
//     redGhostImg.onerror = () => onImageError("./images/redGhost.png")
//     redGhostImg.src = "./images/redGhost.png"

//     pacmanDownImg = new Image()
//     pacmanDownImg.onload = onImageLoad
//     pacmanDownImg.onerror = () => onImageError("./images/pacmanDown.png")
//     pacmanDownImg.src = "./images/pacmanDown.png"
    
//     pacmanUpImg = new Image()
//     pacmanUpImg.onload = onImageLoad
//     pacmanUpImg.onerror = () => onImageError("./images/pacmanUp.png")
//     pacmanUpImg.src = "./images/pacmanUp.png"

//     pacmanRightImg = new Image()
//     pacmanRightImg.onload = onImageLoad
//     pacmanRightImg.onerror = () => onImageError("./images/pacmanRight.png")
//     pacmanRightImg.src = "./images/pacmanRight.png"
    
//     pacmanleftImg = new Image()
//     pacmanleftImg.onload = onImageLoad
//     pacmanleftImg.onerror = () => onImageError("./images/pacmanLeft.png")
//     pacmanleftImg.src = "./images/pacmanLeft.png"
// }

function resetPositions(){
    pacman.reset()
    pacman.velocityX = 0
    pacman.velocityY = 0

    for(let ghost of ghosts){
        ghost.reset()
        const newDirection = directions[Math.floor(Math.random()*2)]
        ghost.updateDirection(newDirection)

    }
}

class Block{
    constructor(image,x,y,width,height){
        this.image = image
        this.width = width
        this.height = height
        this.x = x
        this.y = y

        this.startx = x
        this.starty = y

        this.direction ='R'
        this.velocityX =0
        this.velocityY =0
    }
    updateDirection(direction){
        const prevDirection = this.direction
        this.direction =direction
        this.updateVelocity()
        this.x += this.velocityX
        this.y += this.velocityY
        for(let wall of walls.values()){
            if (collision(this,wall)){
                this.x -= this.velocityX
                this.y -= this.velocityY
                this.direction = prevDirection
                this.updateVelocity()
                return;
            }
        }
    }
    updateVelocity(){
        if ( this.direction =='U'){
            this.velocityX =0
            this.velocityY = -tileSize/4
        }
        else if ( this.direction =='D'){
            this.velocityX =0
            this.velocityY =  tileSize/4
        }
        else if ( this.direction =='L'){
            this.velocityX =-tileSize/4
            this.velocityY = 0 
        }
        else if ( this.direction =='R'){
            this.velocityX = tileSize/4
            this.velocityY = 0 
        }
    }
    reset(){
        this.x =this.startx
        this.y =this.starty
    }
}




// //board dimensions 32pxby32px 21 tiles row 19 tiles column
// let board 
// const rowCount = 21
// const coloumnCount = 19
// const tileSize = 32;
// const boardWidth = coloumnCount * tileSize
// const boardHeigth = rowCount * tileSize
// let context;
// //images
// let blueGhostImg;
// let redGhostImg;
// let pinkGhostImg;
// let orangeGhostImg;
// let pacmanUpImg;
// let pacmanDownImg;
// let pacmanleftImg;
// let pacmanRightImg;
// let wallImg;

// //X = wall, O = skip, P = pac man, ' ' = food
// //Ghosts: b = blue, o = orange, p = pink, r = red
// const tileMap = [
//     "XXXXXXXXXXXXXXXXXXX",
//     "X        X        X",
//     "X XX XXX X XXX XX X",
//     "X                 X",
//     "X XX X XXXXX X XX X",
//     "X    X       X    X",
//     "XXXX XXXX XXXX X XX",
//     "OOOX X       X X XO",
//     "XXXX X XXrXX X X XX",
//     "        bpo        ",
//     "XXXX X XXXXX X X XX",
//     "OOOX X       X X XO",
//     "XXXX X XXXXX X X XX",
//     "X        X        X",
//     "X XX XXX X XXX XX X",
//     "X  X     P     X  X",
//     "XX X X XXXXX X X XX",
//     "X    X   X   X    X",
//     "X XXXXXX X XXXXXX X",
//     "X                 X",
//     "XXXXXXXXXXXXXXXXXXX" 
// ];

// const walls = new Set();
// const foods = new Set();
// const ghosts = new Set();
// let pacman;

// const directions = ['U','D','L','R']
// let score = 0
// let lives = 3
// let gameOver = false

// window.onload = function(){
//     console.log("Game starting...")
//     board = document.getElementById("board")
//     board.height = boardHeigth
//     board.width = boardWidth
//     context = board.getContext("2d")

//     loadImages(() => {
//         console.log("Images loaded, creating map...")
//         loadMap()
//         console.log("Map created: walls=" + walls.size + ", foods=" + foods.size + ", ghosts=" + ghosts.size)
        
//         for(let ghost of ghosts.values()){
//             const newDirection = directions[Math.floor(Math.random()*4)]
//             ghost.updateDirection(newDirection)
//         }
        
//         console.log("Starting game loop...")
//         update()
//     })
    
//     document.addEventListener("keyup", movePacman)
// }

// function loadMap(){
//     walls.clear()
//     foods.clear()
//     ghosts.clear()

//     for(let r = 0; r < rowCount; r++){
//         for(let c = 0; c < coloumnCount; c++){
//             const row = tileMap[r]
//             const tileMapChar = row[c]

//             const x = c * tileSize
//             const y = r * tileSize

//             if(tileMapChar == "X"){ 
//                 const wall = new Block(wallImg, x, y, tileSize, tileSize)
//                 walls.add(wall)
//             }else if(tileMapChar == "b"){ 
//                 const ghost = new Block(blueGhostImg, x, y, tileSize, tileSize)
//                 ghosts.add(ghost)
//             }else if(tileMapChar == "o"){ 
//                 const ghost = new Block(orangeGhostImg, x, y, tileSize, tileSize)
//                 ghosts.add(ghost)
//             }else if(tileMapChar == "p"){ 
//                 const ghost = new Block(pinkGhostImg, x, y, tileSize, tileSize)
//                 ghosts.add(ghost)
//             }else if(tileMapChar == "r"){ 
//                 const ghost = new Block(redGhostImg, x, y, tileSize, tileSize)
//                 ghosts.add(ghost)
//             }
//             else if(tileMapChar == "P"){ 
//                pacman = new Block(pacmanRightImg, x, y, tileSize, tileSize)
//             }else if(tileMapChar == " "){ 
//                 const food = new Block(null, x + 14, y + 14, 4, 4)
//                 foods.add(food)
//             }
//         }
//     }
// }

// function update(){
//     if(gameOver){
//         return
//     }
//     move()
//     draw()
//     setTimeout(update, 50)
// }

// function draw(){
//     context.clearRect(0, 0, board.width, board.height)
    
//     // Draw with fallbacks if images fail
//     if(pacman) {
//         if(pacman.image && pacman.image.complete && pacman.image.naturalWidth > 0) {
//             context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height)
//         } else {
//             // Fallback: yellow circle
//             context.fillStyle = "yellow"
//             context.beginPath()
//             context.arc(pacman.x + pacman.width/2, pacman.y + pacman.height/2, pacman.width/2, 0, 2 * Math.PI)
//             context.fill()
//         }
//     }
    
//     for(let ghost of ghosts.values()){
//         if(ghost.image && ghost.image.complete && ghost.image.naturalWidth > 0) {
//             context.drawImage(ghost.image, ghost.x, ghost.y, ghost.width, ghost.height)
//         } else {
//             // Fallback: red rectangles
//             context.fillStyle = "red"
//             context.fillRect(ghost.x, ghost.y, ghost.width, ghost.height)
//         }
//     }
    
//     for(let wall of walls.values()){
//         if(wall.image && wall.image.complete && wall.image.naturalWidth > 0) {
//             context.drawImage(wall.image, wall.x, wall.y, wall.width, wall.height)
//         } else {
//             // Fallback: blue rectangles
//             context.fillStyle = "blue"
//             context.fillRect(wall.x, wall.y, wall.width, wall.height)
//         }
//     }
    
//     // Draw food
//     context.fillStyle = "yellow"
//     for(let food of foods.values()){
//        context.fillRect(food.x, food.y, food.width, food.height)
//     }
    
//     //score
//     context.fillStyle = 'white'
//     context.font = '20px Arial'
//     if(gameOver){
//         context.fillText("Game Over: " + String(score) + " - Press any key to restart", 50, 30)
//     }
//     else{
//         context.fillText("Lives: " + String(lives) + " Score: " + String(score), 50, 30)
//     }
// }

// function move(){
//     if(!pacman) return
    
//     pacman.x += pacman.velocityX
//     pacman.y += pacman.velocityY
    
//     //check wall collision
//     for(let wall of walls.values()){
//         if(collision(pacman, wall)){
//             pacman.x -= pacman.velocityX
//             pacman.y -= pacman.velocityY
//             break;
//         }
//     }
    
//     //portal movement pacman
//     if(pacman.x <= 0){
//         pacman.x = boardWidth - pacman.width
//     }
//     else if(pacman.x + pacman.width >= boardWidth){
//         pacman.x = 0
//     }

//     for(let ghost of ghosts){
//         if(collision(ghost, pacman)){
//             lives -= 1
            
//             const scoreEl = document.getElementById('pScore')
//             if(scoreEl) {
//                 scoreEl.innerText = `Score:${score}`
//             }
            
//             playerscore = score
//             console.log("Hit ghost! Lives:", lives, "Score:", playerscore)
            
//             if(lives == 0){
//                 gameOver = true
//                 fetch('/user/updateScore', {
//                     method: 'POST',
//                     headers: {'Content-Type': 'application/json'},
//                     body: JSON.stringify({userId: userId, score: playerscore})
//                 })
//                 .then(res => res.json())
//                 .then(data => console.log('SCORE UPDATED:', data))
//                 .catch(err => console.error('error updating:', err))
                
//                 return
//             }
//             resetPositions()
//         }

//         ghost.x += ghost.velocityX
//         ghost.y += ghost.velocityY
        
//         for(let wall of walls.values()){
//             if(collision(ghost, wall)){
//                 ghost.x -= ghost.velocityX
//                 ghost.y -= ghost.velocityY
//                 const newDirection = directions[Math.floor(Math.random()*4)]
//                 ghost.updateDirection(newDirection)
//             }
//         }
        
//         if(ghost.y == tileSize*9 && ghost.direction != 'U' && ghost.direction != 'D'){
//             const ud_Direction = ['U','D']
//             const newDirection = ud_Direction[Math.floor(Math.random()*2)]
//             ghost.updateDirection(newDirection)
//         }
//     }
    
//     //check food collision
//     let foodEaten = null
//     for(let food of foods){
//         if(collision(pacman, food)){
//             foodEaten = food    
//             score += 10
//             break
//         }
//     }
//     foods.delete(foodEaten)
    
//     //next level
//     if(foods.size == 0){
//         loadMap()
//         resetPositions()
//     }
// }

// function movePacman(e){
//     if(gameOver){
//         console.log("Restarting game...")
//         playerscore = score
//         loadMap()
//         resetPositions()
//         lives = 3
//         score = 0 
//         gameOver = false
//         update()
//         return
//     }
    
//     if(e.code == "ArrowUp" || e.code == "KeyW"){
//         pacman.updateDirection('U')
//     }
//     else if(e.code == "ArrowDown" || e.code == "KeyS"){
//         pacman.updateDirection('D')
//     }
//     else if(e.code == "ArrowLeft" || e.code == "KeyA"){
//         pacman.updateDirection('L')
//     }
//     else if(e.code == "ArrowRight" || e.code == "KeyD"){
//         pacman.updateDirection('R')
//     }
    
//     //update pacman images
//     if(pacman.direction == 'U'){
//         pacman.image = pacmanUpImg
//     }
//     else if(pacman.direction == 'D'){
//         pacman.image = pacmanDownImg
//     }
//     else if(pacman.direction == 'L'){
//         pacman.image = pacmanleftImg
//     }
//     else if(pacman.direction == 'R'){
//         pacman.image = pacmanRightImg
//     }
// }

// function collision(a, b){
//     return  a.x < b.x + b.width && 
//             a.x + a.width > b.x && 
//             a.y < b.y + b.height && 
//             a.y + a.height > b.y
// }

// // FIXED: Only one loadImages function with correct absolute paths
// function loadImages(callback){
//     let imagesToLoad = 9
//     let imagesLoaded = 0
    
//     function onImageLoad() {
//         imagesLoaded++
//         console.log(`Loaded ${imagesLoaded}/${imagesToLoad} images`)
//         if (imagesLoaded >= imagesToLoad) {
//             console.log("All images loaded successfully!")
//             callback()
//         }
//     }
    
//     function onImageError(src) {
//         console.warn("Failed to load:", src)
//         imagesLoaded++
//         if (imagesLoaded >= imagesToLoad) {
//             console.log("Image loading complete (some failed)")
//             callback()
//         }
//     }

//     // FIXED: All paths use absolute paths starting with /
//     wallImg = new Image();
//     wallImg.onload = onImageLoad
//     wallImg.onerror = () => onImageError("/images/wall.png")
//     wallImg.src = "/images/wall.png"

//     blueGhostImg = new Image()
//     blueGhostImg.onload = onImageLoad
//     blueGhostImg.onerror = () => onImageError("/images/blueGhost.png")
//     blueGhostImg.src = "/images/blueGhost.png"

//     orangeGhostImg = new Image()
//     orangeGhostImg.onload = onImageLoad
//     orangeGhostImg.onerror = () => onImageError("/images/orangeGhost.png")
//     orangeGhostImg.src = "/images/orangeGhost.png"
    
//     pinkGhostImg = new Image()
//     pinkGhostImg.onload = onImageLoad
//     pinkGhostImg.onerror = () => onImageError("/images/pinkGhost.png")
//     pinkGhostImg.src = "/images/pinkGhost.png"
    
//     redGhostImg = new Image()
//     redGhostImg.onload = onImageLoad
//     redGhostImg.onerror = () => onImageError("/images/redGhost.png")
//     redGhostImg.src = "/images/redGhost.png"

//     pacmanDownImg = new Image()
//     pacmanDownImg.onload = onImageLoad
//     pacmanDownImg.onerror = () => onImageError("/images/pacmanDown.png")
//     pacmanDownImg.src = "/images/pacmanDown.png"
    
//     pacmanUpImg = new Image()
//     pacmanUpImg.onload = onImageLoad
//     pacmanUpImg.onerror = () => onImageError("/images/pacmanUp.png")
//     pacmanUpImg.src = "/images/pacmanUp.png"

//     pacmanRightImg = new Image()
//     pacmanRightImg.onload = onImageLoad
//     pacmanRightImg.onerror = () => onImageError("/images/pacmanRight.png")
//     pacmanRightImg.src = "/images/pacmanRight.png"
    
//     pacmanleftImg = new Image()
//     pacmanleftImg.onload = onImageLoad
//     pacmanleftImg.onerror = () => onImageError("/images/pacmanLeft.png")
//     pacmanleftImg.src = "/images/pacmanLeft.png"
// }

// function resetPositions(){
//     if(!pacman) return
    
//     pacman.reset()
//     pacman.velocityX = 0
//     pacman.velocityY = 0

//     for(let ghost of ghosts){
//         ghost.reset()
//         const newDirection = directions[Math.floor(Math.random()*4)] // FIXED: was *2
//         ghost.updateDirection(newDirection)
//     }
// }

// class Block{
//     constructor(image, x, y, width, height){
//         this.image = image
//         this.width = width
//         this.height = height
//         this.x = x
//         this.y = y

//         this.startx = x
//         this.starty = y

//         this.direction = 'R'
//         this.velocityX = 0
//         this.velocityY = 0
//     }
    
//     updateDirection(direction){
//         const prevDirection = this.direction
//         this.direction = direction
//         this.updateVelocity()
//         this.x += this.velocityX
//         this.y += this.velocityY
        
//         for(let wall of walls.values()){
//             if(collision(this, wall)){
//                 this.x -= this.velocityX
//                 this.y -= this.velocityY
//                 this.direction = prevDirection
//                 this.updateVelocity()
//                 return;
//             }
//         }
//     }
    
//     updateVelocity(){
//         if(this.direction == 'U'){
//             this.velocityX = 0
//             this.velocityY = -tileSize/4
//         }
//         else if(this.direction == 'D'){
//             this.velocityX = 0
//             this.velocityY = tileSize/4
//         }
//         else if(this.direction == 'L'){
//             this.velocityX = -tileSize/4
//             this.velocityY = 0 
//         }
//         else if(this.direction == 'R'){
//             this.velocityX = tileSize/4
//             this.velocityY = 0 
//         }
//     }
    
//     reset(){
//         this.x = this.startx
//         this.y = this.starty
//     }
// }