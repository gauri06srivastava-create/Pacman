let board=0;
const rowcount=21;
const columncount=19;
const tilesize=32;
const boardwidth=columncount*tilesize;
const boardheight=rowcount*tilesize;
let context;

let blueghostimg;
let redghostimg;
let pinkghostimg;
let pacmanupimg;
let pacmandownimg;
let pacmanleftimg;
let pacmanrightimg;
let scaredghostimg;
let wallimg;

//X = wall, O = skip, P = pac man, ' ' = food
//Ghosts: b = blue, o = orange, p = pink, r = red
const tileMap = [
    "XXXXXXXXXXXXXXXXXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X                 X",
    "X XX X XXXXX X XX X",
    "X    X       X    X",
    "XXXX XXXX XXXX XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXrXX X XXXX",
    "O       bpo       O",
    "XXXX X XXXXX X XXXX",
    "OOOX X       X XOOO",
    "XXXX X XXXXX X XXXX",
    "X        X        X",
    "X XX XXX X XXX XX X",
    "X  X     P     X  X",
    "XX X X XXXXX X X XX",
    "X    X   X   X    X",
    "X XXXXXX X XXXXXX X",
    "X                 X",
    "XXXXXXXXXXXXXXXXXXX" 
];

const walls=new Set();
const foods=new Set();
const ghosts=new Set();
let pacman;

const directions=['U','L','D','R'];

let score=0;
let lives=3;
let gameover=false;

window.onload=function()
{
    board=document.getElementById("board");
    board.height=boardheight;
    board.width=boardwidth;
    context=board.getContext("2d");

    loadimages();
    loadMap();

    for(let ghost of ghosts.values())
    {
        const newDirection=directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newDirection);
    }

   
    //console.log(walls.size);
    //console.log(foods.size);
    //console.log(ghosts.size);
    update();
    document.addEventListener("keyup",movePacman);
}

function loadimages()
{
    wallimg=new Image();
    wallimg.src="./wall.png";

    blueghostimg=new Image();
    blueghostimg.src="./blue.png";

    orangeghostimg=new Image();
    orangeghostimg.src="./orange.png";

    pinkghostimg=new Image();
    pinkghostimg.src="./pink.png";

    redghostimg=new Image();
    redghostimg.src="./red.png";

    pacmanupimg=new Image();
    pacmanupimg.src="./pacmanup.jpg";

    pacmandownimg=new Image();
    pacmandownimg.src="./pacmandown.jpg";

    pacmanleftimg=new Image();
    pacmanleftimg.src="./pacmanleft.jpg";

    pacmanrightimg=new Image();
    pacmanrightimg.src="./pacmanright.jpg";
}

function loadMap()
{
    walls.clear();
    foods.clear();
    ghosts.clear();

    for(let r=0;r<rowcount;r++)
    {
        for(let c=0;c<columncount;c++)
        {
            const row=tileMap[r];
            const tileMapChar=row[c];

            const x=c*tilesize;
            const y=r*tilesize;
            if(tileMapChar=='X'){
                const wall=new Block(wallimg,x,y,tilesize,tilesize);
                walls.add(wall);}
                else if(tileMapChar=='b')
            {
             const ghost=new Block(blueghostimg,x,y,tilesize,tilesize);
             ghosts.add(ghost);
            }
             else if(tileMapChar=='p')
            {
             const ghost=new Block(pinkghostimg,x,y,tilesize,tilesize);
             ghosts.add(ghost);
            }
            else if(tileMapChar=='o')
            {
            const ghost=new Block(orangeghostimg,x,y,tilesize,tilesize);
            ghosts.add(ghost);
            }
            else if(tileMapChar=='r')
            {
            const ghost=new Block(redghostimg,x,y,tilesize,tilesize);
            ghosts.add(ghost);
            }


            else if(tileMapChar=='P')
            {
                pacman=new Block(pacmanrightimg,x,y,tilesize,tilesize);
            }
            else if(tileMapChar==' ')
            {
                const food=new Block(null,x+14,y+14,4,4);
                foods.add(food);
            }
        }
    }
}

function update()
{
    if(gameover){
    return;}
    move();
    draw();
    setTimeout(update,50);
}
function draw()
{
    context.clearRect(0,0,board.width,board.height);
    context.drawImage(pacman.image, pacman.x, pacman.y, pacman.width, pacman.height);

    for(let ghost of ghosts.values())
    {
        context.drawImage(ghost.image,ghost.x,ghost.y,ghost.width,ghost.height);
    }
    for(let wall of walls.values())
    {
        context.drawImage(wall.image,wall.x,wall.y,wall.width,wall.height);
    }
    context.fillStyle="white";
    for(let food of foods.values())
    {
        context.fillRect(food.x,food.y,food.width,food.height);
    }
    context.fillStyle="white";
    context.font="14px sans-serif";
    if(gameover)
    {
        context.fillText("Game Over: "+String(score),tilesize/2,tilesize/2);
    }
    else{
        context.fillText("x" + String(lives)+" "+String(score),tilesize/2,tilesize/2);
    }
}

function move()
{
    pacman.x+=pacman.velocityX;
    pacman.y+=pacman.velocityY;

    for(let wall of walls.values())
    {
        if(collision(pacman,wall))
        {
            pacman.x-=pacman.velocityX;
            pacman.y-=pacman.velocityY;
            break;
        }
    }
    for(let ghost of ghosts.values())
    {
        if(collision(pacman,ghost))
        {
            lives-=1;
            if(lives==0)
            {
                gameover=true;
                return;
            }
            resetpositions();
        }
        if(ghost.y==tilesize*9 && ghost.direction!='U' && ghost.direction!='D')
        {
            ghost.updateDirection('U');
        }

        ghost.x+=ghost.velocityX;
        ghost.y+=ghost.velocityY;
        for(let wall of walls.values())
        {
            if(collision(ghost,wall) || ghost.x<=0 || ghost.x+ghost.width>=boardwidth)
            {
                ghost.x-=ghost.velocityX;
                ghost.y-=ghost.velocityY;
                const newdirection=directions[Math.floor(Math.random()*4)];
                ghost.updateDirection(newdirection);
            }
        }
    }

    
    let foodeaten=null;
    for(let food of foods.values())
        {
            if(collision(pacman,food))
            {
                foodeaten=food;
                score+=10;
                break;
            }
        }      
        foods.delete(foodeaten);
        if(foods.size==0)
        {
            loadMap();
            resetpositions();
        }
}

function movePacman(e)
{
    if(gameover)
    {
        loadMap();
        resetpositions();
        lives=3;
        score=0;
        gameover=false;
        update();
        return;
    }
    if(e.code=="ArrowUp" || e.code=="KeyW")
    {
        pacman.updateDirection("U");
    }
    if(e.code=="ArrowDown" || e.code=="KeyS")
    {
        pacman.updateDirection("D");
    }
    if(e.code=="ArrowLeft" || e.code=="KeyA")
    {
        pacman.updateDirection("L");
    }
    if(e.code=="ArrowRight" || e.code=="KeyD")
    {
        pacman.updateDirection("R");
    }


if(pacman.direction=='U')
    pacman.image=pacmanupimg;

if(pacman.direction=='D')
    pacman.image=pacmandownimg;

if(pacman.direction=='L')
    pacman.image=pacmanleftimg;

if(pacman.direction=='R')
    pacman.image=pacmanrightimg;

}

function collision (a,b)
{
    return a.x<b.x+b.width && 
    a.x+a.width>b.x &&
    a.y<b.y+b.height &&
    a.y+a.height>b.y;
}

function resetpositions()
{
    pacman.reset();
    pacman.velocityX=0;
    pacman.velocityY=0;
    for(let ghost of ghosts.values())
    {
        ghost.reset();
        const newdirection=directions[Math.floor(Math.random()*4)];
        ghost.updateDirection(newdirection);
    }
}

class Block
{
    constructor(image,x,y,width,height){
        this.image=image;
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.startX=x;
        this.startY=y;

        this.direction="R";
        this.velocityX=0;
        this.velocityY=0;
    }
    updateDirection(direction)
    {
        const prevdirection=this.direction;
        this.direction=direction;
        this.updateVelocity();
        this.x+=this.velocityX;
        this.y+=this.velocityY;

        for(let wall of walls.values()) 
            {
                if(collision(this,wall))
                {
                    this.x-=this.velocityX;
                    this.y-=this.velocityY;
                    this.direction=prevdirection;
                    this.updateVelocity();
                    return;
                }
            }       
    }
    updateVelocity()
    {
        if(this.direction=='U')
        {
            this.velocityX=0;
            this.velocityY=-tilesize/4;
        }
        if(this.direction=='D')
        {
            this.velocityX=0;
            this.velocityY=tilesize/4;
        }
        if(this.direction=='L')
        {
            this.velocityY=0;
            this.velocityX=-tilesize/4;
        }
        if(this.direction=='R')
        {
            this.velocityY=0;
            this.velocityX=tilesize/4;
        }
    }
    reset()
    {
        this.x=this.startX;
        this.y=this.startY;
    }
}