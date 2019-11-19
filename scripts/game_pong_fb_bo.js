/********* VARIABLES *********/

// We control which screen is active by settings / updating
// screen variable. We display the correct screen according
// to the value of this variable.
//
// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen

var gameScreen = 0;

// gameplay settings
var gravity = 0.3;
var airfriction = 0.00001;
var friction = 0.1;

// scoring
var score = 0;
var highScore = 0;
var highScoreList = [];
var maxHealth = 100;
var health = 100;
var healthDecrease = 1;
var healthBarWidth = 60;
var isGameOver = false;

// ball settings
var ballX, ballY;
var ballSpeedVert = 0;
var ballSpeedHorizon = 0;
var ballSize = 30;
var ballColor;

// paddle settings
var paddleColor;
var paddleWidth = 50;
var paddleHeight = 5;

// wall settings
var wallSpeed = 9;
var wallInterval = 1000;    // frequency of walls appeariing
var lastAddTime = 0;        // timeer for walls
var minGapHeight = 200;
var maxGapHeight = 300;
var wallWidth = 40;
var wallColors;
var walls = [];

var ballHit = false;        // bool for triggering ball hitting objects
var paddleHit = false;      // paddle hitting wall
var paddleHealth = 1000;
var paddleMaxHealth = 1000;


var blocks = [];
var blockSpeed = 5;
var blockInterval = 1000;
var blockLastAddTime = 500;
var minBlockHeight = 200; // need to set in setup!
var maxBlockHeight = 200;
var blockWidth = 80;
var blockHeight = 20;
var blockHit = false;

var randomEventOn = false;

var randomEventMinTime = 4000;
var randomEventMaxTime = 7000;
var randomEventRunTime = 5000;
var lastRandomEvent = 0;
var nextRandomEvent = 0;
var resetEvent = false;
var eventText = "";
var numberOfEvents = 10; // todo turn into array

let START = 0;
let PLAYING = 1;
let GAME_OVER = 2;
var ballScaleFactor = 1.0;
var paddleScaleFactor = 1.0;


/********* SETUP BLOCK *********/

function setup() {
    w = 800;
    h = 500;

    createCanvas(windowWidth,windowHeight);
    // createCanvas(w, h);
    // set the initial coordinates of the ball
    ballX=width/4;
    ballY=height/5;
    smooth();

    ballColor = color(0);
    paddleColor = color(0);
    wallColors = color(44, 62, 80);
    blockColours = color(255,0,0);
    minBlockHeight = height - 200;
}


/********* DRAW BLOCK *********/

function draw() {
    // Display the contents of the current screen
    if (isGameOver == false){
        console.log("gameScreen", gameScreen);
        if (gameScreen == START) {
            initScreen();
        } else if (gameScreen == PLAYING) {
            gameplayScreen();
        }
    } else {
        if (gameScreen == GAME_OVER) {
            gameOverScreen();
        }
    }



}


/********* SCREEN CONTENTS *********/

function initScreen() {
    background(236, 240, 241);
    textAlign(CENTER);
    fill(52, 73, 94);
    textSize(40);
    text("Flappy Breakout Pong", width/2, height/2);
    textSize(15);
    text("Click to start", width/2, height-30);

}
function gameplayScreen() {

    background(236, 240, 241);
    drawPaddle();
    watchPaddleBounce();
    drawBall();
    applyGravity();
    applyHorizontalSpeed();
    keepInScreen();
    drawHealthBar();
    printScore();
    wallAdder();
    wallHandler();
    blockAdder();
    blockHandler();
    checkForRandomEvent();
    displayEventTxt();
}
function gameOverScreen() {
    background(44, 62, 80);
    textAlign(CENTER);
    fill(236, 240, 241);
    textSize(12);
    text("Your Score", width/2, height/2 - 120);
    textSize(130);

    text(score, width/2, height/2);
    textSize(50);
    text(highScore, width/2, height/2 + 100);
    textSize(15);
    text("Click to Restart", width/2, height-30);

}


/********* INPUTS *********/

function mousePressed() {
    console.log("Mouse Press");
    // if we are on the initial screen when clicked, start the game
    if (gameScreen == START) {
        loop();
        isGameOver = false;
        startGame();
    }
    if (gameScreen == GAME_OVER) {
        restart();
        noLoop();
    }
}


/********* OTHER FUNCTIONS *********/

// This method sets the necessery variables to start the game
function startGame() {
    gameScreen = PLAYING;
}
function gameOver() {
    if (score > highScore){
        highScoreList.push(score);
        highScore = score;
    }
    gameScreen = GAME_OVER;
    isGameOver = true;
}

function restart() {

    score = 0;
    resetHealth();
    resetBall();
    lastAddTime = 0;
    walls = [];
    gameScreen = START;
    isGameOver = false;
}

function resetHealth(){
    health = maxHealth;
    paddleHealth = paddleMaxHealth;
}
function resetBall(){
    ballX = width / 4;
    ballY = width / 5;
}


function drawBall() {
    fill(ballColor);
    ellipse(ballX, ballY, ballSize, ballSize);
}
function drawPaddle() {
    fill(paddleColor);
    rectMode(CENTER);
    rect(mouseX, mouseY, paddleWidth, paddleHeight, 5);
}


function blockAdder(){
    if (millis() - blockLastAddTime > blockInterval){
        var randHeight = round(random(minBlockHeight, maxBlockHeight));
        var randY = round(random(0, height - randHeight));
        var yPos = width;
        // todo points = rnadom value
        points = 10;
        blockType = round(random(0,4));
        var dir = round(random(1,2));
        if (dir == 2){
            dir = -1;
            yPos = 0;
        }


        speed = round(random(3,10));
        // console.log("DIR: ",dir, ypos, blockType);
        var randBlock = [yPos, randY, blockWidth, blockHeight, blockType, points, dir, speed ];
     //   console.log("RND:", randBlock, " ---> DIR: ", dir);
        blocks.push(randBlock);
        blockLastAddTime = millis();

    }

}

function blockHandler(){
    if (blockCount()){
        for (var i = 0; i < blocks.length; i++){
            blockRemover(i);
            blockMover(i);
            blockDrawer(i);
            watchBlockCollision(i);

        }
    }

}

function blockRemover(index){
    if (blockCount()){
        var block = blocks[index];
      //  console.log("Dir: ......", block[6])
        if (block[6] == -1){
            if (block[0] + block[2] >= width){

                blocks.splice(index,1);
                if (block[7] > 5){
                    increaseHealth(-10);
                    increasePaddleHealth(-50);
                } else {
                    increaseHealth(-20);
                    increasePaddleHealth(-200);
                }

            }

        } else {
            if (block[0] + block[2] <= 0) {
                blocks.splice(index, 1);
                if (block[7] > 5){
                    increaseHealth(-10);
                    increasePaddleHealth(-50);
                } else {
                    increaseHealth(-20);
                    increasePaddleHealth(-200);
                }
            }
        }

    }
}
function blockMover(index){
    if (blockCount()) {
        var block = blocks[index];
        var speed = block[6] * block[7];


    //   console.log("B,S....",block, speed, block[7] ,  block[8);
        block[0] -= speed;
    }
}
function blockDrawer(index){
    if (blockCount()) {
        var block = blocks[index];
        // get gap wall settings
        var blockX = block[0];
        var blockY = block[1];
        var blockWidth = block[2];
        var blockHeight = block[3];

     // draw actual walls
        rectMode(CORNER);
        noStroke();
        strokeCap(ROUND);
        colour = getBlockColor(index);
        fill(colour);
        // rect x,y, w, h   - upper l
        rect(blockX, blockY, blockWidth, blockHeight, 15, 15, 15, 15);
        // rect(gapWallX, gapWallY+gapWallHeight, gapWallWidth, height-(gapWallY+gapWallHeight), 15, 15, 0, 0);
    }

}

function getBlockColor(index){
    if (blockCount()) {
        block = blocks[index];
        type = block[4];
        blockColor = color(255, 0, 0);
        switch (type) {
            case 1: // red
                blockColor = color(255, 0, 0);
                blocks[index][5] = 10;
                break;
            case 2:
                blockColor = color(0, 255, 0);
                blocks[index][5] = 5;
                break;
            case 3:
                blockColor = color(0, 0, 255);
                blocks[index][5] = 15;
                break;
            case 0:
                blockColor = color(255, 255, 255);
                blocks[index][5] = -10;
                break;


        }
        return blockColor;
    }
}

function watchBlockCollision(index) {
    if (blockCount()) {

        var block = blocks[index];
        var blockX = block[0];
        var blockY = block[1];
        var blockWidth = block[2];
        var blockHeight = block[3];
       // var blockType = block[4];
        blockHit = collideRectCircle(blockX, blockY, blockWidth, blockHeight, ballX, ballY, ballSize);
        if (blockHit) {
            console.log("block Hit");
            decreasePaddleHealth(index)
            health += 10;
            paddleHealth += 10;
            blocks.splice(index, 1);


        }
    }

}
function decreasePaddleHealth(index){
    if (blockCount()) {
        var block = blocks[index];
        var blockType = block[4];
        var points = block[5];
        switch (blockType) {
            case 1:
                increaseHealth(points)

                break;
            case 2:
                increasePaddleHealth(points);

                break;
            case 3:
                increasePaddleHealth(Math.round(points / 2));
                increaseHealth(Math.round(points /2));
                health += 5;
                break;
            case 4:
                increasePaddleHealth(points)
                increaseHealth(Math.round(points / 2));
                break;
        }
    }
}


function increaseHealth(points){
    health += points;
    if (health > maxHealth){
        health = maxHealth;
    }
    if (health <= 0){
        gameOver();
    }
}


function increasePaddleHealth(points){
    paddleHealth += points;
    if (paddleHealth > paddleMaxHealth){
        paddleHealth = paddleMaxHealth;
    }
    if (paddleHealth <= 0 ){
        gameOver();
    }
}


function wallAdder() {
    if (millis()-lastAddTime > wallInterval) {
        var randHeight = round(random(minGapHeight, maxGapHeight));
        var randY = round(random(0, height-randHeight));
        // {gapWallX, gapWallY, gapWallWidth, gapWallHeight, scored}
        var randWall = [width, randY, wallWidth, randHeight, 0];
        walls.push(randWall);
        lastAddTime = millis();
    }
}
function wallHandler() {
    for (var i = 0; i < walls.length; i++) {
        wallRemover(i);
        wallMover(i);
        wallDrawer(i);
        watchWallCollision(i);
    }
}
function wallDrawer(index) {
    var wall = walls[index];
    // get gap wall settings
    var gapWallX = wall[0];
    var gapWallY = wall[1];
    var gapWallWidth = wall[2];
    var gapWallHeight = wall[3];
    // draw actual walls
    rectMode(CORNER);
    noStroke();
    strokeCap(ROUND);
    fill(wallColors);
    // rect x,y, w, h   - upper l

    // width, 0, wall width,
    rect(gapWallX, 0, gapWallWidth, gapWallY, 0, 0, 15, 15);
    rect(gapWallX, gapWallY+gapWallHeight, gapWallWidth, height-(gapWallY+gapWallHeight), 15, 15, 0, 0);
}
function wallMover(index) {
    var wall = walls[index];
    wall[0] -= wallSpeed;
}
function wallRemover(index) {
    var wall = walls[index];
    if (wall[0]+wall[2] <= 0) {
        walls.splice(index, 1);
    }
}

function watchWallCollision(index) {
    var wall = walls[index];




    // get gap wall settings
    var gapWallX = wall[0];
    var gapWallY = wall[1];
    var gapWallWidth = wall[2];
    var gapWallHeight = wall[3];
    var wallScored = wall[4];
    var wallTopX = gapWallX;
    var wallTopY = 0;
    var wallTopWidth = gapWallWidth;
    var wallTopHeight = gapWallY;
    var wallBottomX = gapWallX;
    var wallBottomY = gapWallY+gapWallHeight;
    var wallBottomWidth = gapWallWidth;
    var wallBottomHeight = height-(gapWallY+gapWallHeight);

    // top
    paddleHit =  collideRectRect(mouseX, mouseY, paddleWidth, paddleHeight, wallTopX, wallTopY, wallTopWidth, wallTopHeight)
            || collideRectRect(mouseX, mouseY, paddleWidth, paddleHeight, wallBottomX, wallBottomY, wallBottomWidth, wallBottomHeight);

    if (paddleHit){
        console.log("Paddle HIT");
        paddleDecreaseHealth();
        paddleHit = false;
    }
    ballHit = collideRectCircle( wallTopX, wallTopY, wallTopWidth, wallTopHeight, ballX,ballY, ballSize)
        || collideRectRect(wallBottomX, wallBottomY, wallBottomWidth, wallBottomHeight, ballY, ballY, ballSize);
    if (ballHit){
        console.log("Ball Hit");
        ballHit = false;
        decreaseHealth();
        friction = 0.5;
    } else {
        friction = 0.1;
    }


    if (ballX > gapWallX+(gapWallWidth/2) && wallScored==0) {
        wallScored=1;
        wall[4]=1;
        addScore();
    }
}

function drawHealthBar() {

    // ball health bar
    noStroke();

    fill(189, 195, 199);
    rectMode(CORNER);
    rect(ballX-(healthBarWidth/2), ballY - 30, healthBarWidth, 5);
    if (health > 60) {
        fill(46, 204, 113);
    } else if (health > 30) {
        fill(230, 126, 34);
    } else {
        fill(231, 76, 60);
    }
    rectMode(CORNER);
    rect(ballX-(healthBarWidth/2), ballY - 30, healthBarWidth*(health/maxHealth), 5);


    // paddle
    fill(189, 195, 199);
    rectMode(CORNER);
    rect(mouseX-(healthBarWidth/2), mouseY - 20, healthBarWidth, 5);
    if (paddleHealth > 60) {
        fill(46, 204, 113);
    } else if (paddleHealth > 30) {
        fill(230, 126, 34);
    } else {
        fill(231, 76, 60);
    }

    rectMode(CORNER);
    rect(mouseX-(healthBarWidth/2), mouseY - 20, healthBarWidth*(paddleHealth/paddleMaxHealth), 5);
}

function paddleDecreaseHealth() {
    paddleHealth -= healthDecrease;
    if (paddleHealth <= 0) {
        gameOver();
    }
}

function decreaseHealth() {
    health -= healthDecrease;
    if (health <= 0) {
        gameOver();
    }
}
function addScore(value=1) {
    score = score + value;
}
function printScore() {
    textAlign(CENTER);
    fill(0);
    textSize(30);
    txt = score + " ", paddleHealth, " ", health
    text(paddleHealth, height/2, 50);
}

function watchPaddleBounce() {
    var overhead = mouseY - pmouseY;
    if ((ballX+(ballSize/2) > mouseX-(paddleWidth/2)) && (ballX-(ballSize/2) < mouseX+(paddleWidth/2))) {
        if (dist(ballX, ballY, ballX, mouseY)<=(ballSize/2)+abs(overhead)) {
            makeBounceBottom(mouseY);
            ballSpeedHorizon = (ballX - mouseX)/10;
            // paddle moving up
            if (overhead<0) {
                ballY+=(overhead/2);
                ballSpeedVert+=(overhead/2);
            }
        }
    }
}


function checkForRandomEvent(){
    // random events will run every min - max random events
    // they will run for the duration of the specific event type.
    if (! randomEventOn){  // random event is not running.
        if (millis()-lastRandomEvent > nextRandomEvent) {
            // run event
            randomEventOn = true;
            eventText = "Event On";

            var event = Math.round(random(1,numberOfEvents));
            doEvent(event);

            lastRandomEvent = millis();
            nextRandomEvent = Math.round(random(randomEventMinTime, randomEventMaxTime));
        }

    }
}


function doEvent(eventNo){




}

function displayEventTxt(eventText){
    textAlign(CENTER);
    fill(0);
    textSize(30);

    text(eventText, 10, 35);
}

function applyGravity() {
    ballSpeedVert += gravity;
    ballY += ballSpeedVert;
    ballSpeedVert -= (ballSpeedVert * airfriction);
}
function applyHorizontalSpeed() {
    ballX += ballSpeedHorizon;
    ballSpeedHorizon -= (ballSpeedHorizon * airfriction);
}
// ball falls and hits the floor (or other surface)
function makeBounceBottom(surface) {
    ballY = surface-(ballSize/2);
    ballSpeedVert*=-1;
    ballSpeedVert -= (ballSpeedVert * friction);
}
// ball rises and hits the ceiling (or other surface)
function makeBounceTop(surface) {
    ballY = surface+(ballSize/2);
    ballSpeedVert*=-1;
    ballSpeedVert -= (ballSpeedVert * friction);
}
// ball hits object from left side
function makeBounceLeft(surface) {
    ballX = surface+(ballSize/2);
    ballSpeedHorizon*=-1;
    ballSpeedHorizon -= (ballSpeedHorizon * friction);
}
// ball hits object from right side
function makeBounceRight(surface) {
    ballX = surface-(ballSize/2);
    ballSpeedHorizon*=-1;
    ballSpeedHorizon -= (ballSpeedHorizon * friction);
}
// keep ball in the screen
function keepInScreen() {
    // ball hits floor
    if (ballY+(ballSize/2) > height) {
        makeBounceBottom(height);
    }
    // ball hits ceiling
    if (ballY-(ballSize/2) < 0) {
        makeBounceTop(0);
    }
    // ball hits left of the screen
    if (ballX-(ballSize/2) < 0) {
        makeBounceLeft(0);
    }
    // ball hits right of the screen
    if (ballX+(ballSize/2) > width) {
        makeBounceRight(width);
    }
}

function blockCount(){
    return (blocks.length > 0);
}


