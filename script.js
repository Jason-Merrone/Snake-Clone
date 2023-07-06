// Get the canvas element
const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

// Simple queue data structure to control snake body
let queue = [];
function enqueue(e){
    queue.unshift(e);
}
function dequeueLast(){
    return queue.pop();
}
function queueSize(){
    queue.length;
}

// Various global variables declared
let gridSize = 30;
let gridCoordinates = makeGrid(gridSize);
enqueue(Math.floor(Math.random() * (gridSize*gridSize)));
let apple = Math.floor(Math.random() * (gridSize*gridSize));
while (apple === queue[0]){
    apple = Math.floor(Math.random() * (gridSize*gridSize));
}
let ateApple = false;
let currentDirection = null;
let alive = true;
let renderGrid = false;

// Game loop
function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}

// Game logic update function (Handles logic for collision and movement)
function update() {
    handleAppleCollision(true);
    handleWallCollision();
    if(alive){
        moveSnake();
        handleAppleCollision(false);
    }
    handleSelfCollision();
}

// Render function
function render() {
    // Displays background
    c.clearRect(0, 0, canvas.width, canvas.height);

    displayGrid(gridSize);
    drawSnake();
    drawApple();
}

// Figures out where to display the snake's body segments on the screen
function drawSnake(){

    // Resets the screen
    for(let i = 0; i < gridCoordinates.length; i++){
        gridCoordinates[i][2] = false;
    }

    // Tells the grid which coordinates contain a snake to draw
    for(let i = 0; i < queue.length; i++){
        gridCoordinates[queue[i]][2] = true;
    }
}

// Figures out where to display the apple on the screen
function drawApple(){
    gridCoordinates[apple][3] = true;
}

// Logic for snake "movement"
function moveSnake(){
    if(currentDirection === null){
        return;
    }

    if(currentDirection === "up"){
        enqueue(queue[0]-gridSize);
    }
    else if(currentDirection === "down"){
        enqueue(queue[0]+gridSize);
    }
    else if(currentDirection === "right"){
        enqueue(queue[0]+1);
    }
    else {
        enqueue(queue[0]-1);
    }

    // Only removes the tail if the snake has not eaten an apple
    if(ateApple === false){
        dequeueLast();
    }
    else{
        ateApple = false;
    }
}

// Logic for detecting when the snake eats an apple
function handleAppleCollision(headTest){ // Head test is only done during first pass (Two per interval)
    // This tests if the head has collided with the apple and sets "ateApple" to true if yes
    if(((queue[0]+1 === apple && currentDirection === "right") || (queue[0]-1 === apple && currentDirection === "left") || (queue[0]+gridSize === apple && currentDirection === "down") || (queue[0]-gridSize === apple && currentDirection === "up")) && headTest){
        gridCoordinates[apple][3] = false;
        apple = Math.floor(Math.random() * (gridSize*gridSize));
        ateApple = true;
    }

    // This tests if any body segment (Including the head) collided with the apple
    for(let i = 0; i < queue.length; i++){
        if(queue[i] === apple && queue.length < gridCoordinates.length){
            gridCoordinates[apple][3] = false;
            apple = Math.floor(Math.random() * (gridSize*gridSize));
            handleAppleCollision();
            break;
        }
    }
}

// Kills user of they collide with a wall 
function handleWallCollision(){
    if(queue[0]%gridSize === gridSize-1 && currentDirection === "right" || queue[0]%gridSize === 0 && currentDirection === "left" || queue[0] < gridSize && currentDirection === "up" || queue[0] >= gridSize*gridSize-gridSize && currentDirection === "down"){
        alive = false;
    }
}

// Kills user if they collide with themselves
function handleSelfCollision(){
    for(let i = 0; i < queue.length; i++){
        if(queue[0] === queue[i] && i !== 0){
            alive = false;
        }
    }
}

// Code for making grid
function makeGrid(size){
    coordinates = [];
    for(let y = 0; y < canvas.height; y+=(canvas.height/size)){
        for(let x = 0; x < canvas.width; x+=(canvas.width/size)+0.000000000001){
            coordinates.push([x,y,false,false]);
        }
    }

    //Return a list containing the coordinates
    return coordinates;
}

// Displays the grid during gameplay
function displayGrid(size){
    for(let i = 0; i < gridCoordinates.length; i++){
        if (renderGrid === true){
            c.strokeStyle = "black";
            c.strokeRect(gridCoordinates[i][0], gridCoordinates[i][1], canvas.width/size, canvas.height/size);
        }
        //Grid spaces containing snake are green
        if(gridCoordinates[i][2] === true){
            c.fillStyle = "green";
            c.fillRect(gridCoordinates[i][0], gridCoordinates[i][1], canvas.width/size, canvas.height/size);
        }
        //Grid spaces containing apple are red
        else if(gridCoordinates[i][3] === true){
            c.fillStyle = "red";
            c.fillRect(gridCoordinates[i][0], gridCoordinates[i][1], canvas.width/size, canvas.height/size);
        }
    }
}

// Calls main game loop
gameLoop();

// Sets an nterval between logic calculations
let timer = setInterval(update,100);

// Adds an event listener for the keydown event
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && !(queue[0] === queue[1]+gridSize)) {
        currentDirection = "up";
    } 
    else if ((key === 'ArrowDown' || key === 's' || key === 'S') && !(queue[0] === queue[1]-gridSize)) {
        currentDirection = "down";
    } 
    else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && !(queue[0] === queue[1]-1)) {
        currentDirection = "right";
    } 
    else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && !(queue[0] === queue[1]+1)) {
        currentDirection = "left";
    } 
  })