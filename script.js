
// Get the canvas element
const canvas = document.getElementById("gameCanvas");
const c = canvas.getContext("2d");

// Simple queue data structure to control snake body
let queue = [];
function enqueue(e){
    queue.unshift(e);
}
function dequeue(){
    return queue.pop();
}

// Various global variables declared
let gridSize = 20;
let gridCoordinates = makeGrid();
enqueue(Math.floor(Math.random() * (gridSize*gridSize)));
let apple = Math.floor(Math.random() * (gridSize*gridSize));
while (apple === queue[0]){
    apple = Math.floor(Math.random() * (gridSize*gridSize));
}
let ateApple = false;
let score = 0;
let currentDirection = null;
let alive = true;
let renderGrid = true;
let displaySpeed = 15;
let updateInterval = 101; // Interval between game updates
let screenWidth = 0;
let screenHeight = 0;

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
    document.getElementById("score").textContent="Score: "+score;

    // Readjusts canvas size when screen size is updated
    if(screenWidth-window.innerWidth !== 0 || screenHeight-window.innerHeight !== 0){
        adjustCanvasSize();
    }
}

// Render function
function render() {
    // Displays background
    c.clearRect(0, 0, canvas.width, canvas.height);

    displayGrid();
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
        dequeue();
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
        score++;
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
            break;
        }
    }
}

// Code for making grid
function makeGrid(){
    coordinates = [];
    for(let y = 0; y < canvas.height; y+=(canvas.height/gridSize)){
        for(let x = 0; x < canvas.width; x+=(canvas.width/gridSize)+0.000000000001){
            coordinates.push([x,y,false,false]);
        }
    }

    //Return a list containing the coordinates
    return coordinates;
}

// Displays the grid during gameplay
function displayGrid(){
    for(let i = 0; i < gridCoordinates.length; i++){
        if (renderGrid === true){
            c.strokeStyle = "black";
            c.strokeRect(gridCoordinates[i][0], gridCoordinates[i][1], canvas.width/gridSize, canvas.height/gridSize);
        }
        //Grid spaces containing snake are green
        if(gridCoordinates[i][2] === true){
            c.fillStyle = "green";
            c.fillRect(gridCoordinates[i][0], gridCoordinates[i][1], canvas.width/gridSize, canvas.height/gridSize);
        }
        //Grid spaces containing apple are red
        else if(gridCoordinates[i][3] === true){
            c.fillStyle = "red";
            c.fillRect(gridCoordinates[i][0], gridCoordinates[i][1], canvas.width/gridSize, canvas.height/gridSize);
        }
    }
}

// Returns the current location of the snake's head (relative to the canvas)
function findHead(){
    return [gridCoordinates[queue[0]][0],gridCoordinates[queue[0]][1]]
}

// Resets the game
function reset(){
    queue = [];
    gridCoordinates = makeGrid();
    enqueue(Math.floor(Math.random() * (gridSize*gridSize)));
    apple = Math.floor(Math.random() * (gridSize*gridSize));
    while (apple === queue[0]){
        apple = Math.floor(Math.random() * (gridSize*gridSize));
    }
    ateApple = false;
    score = 0;
    currentDirection = null;
    alive = true;
}

// Displays the grid if it isn't currently displayed or remove it if it is
function removeGrid(){
    if(renderGrid === true){
        renderGrid = false;
        document.getElementById("show-grid").textContent="Show Grid";
    }
    else{
        renderGrid = true;
        document.getElementById("show-grid").textContent="Remove Grid";
    }
}

// Change the size of the game grid (Resets the game)
function changeGridSize(direction){
    if(direction === "up"){
        gridSize++;
    }
    else if(direction != "up" && gridSize > 2){
        gridSize--;
    }
    else{
        return;
    }
    reset();
    document.getElementById("grid-size-text").value="Grid Size: "+gridSize;
}

// Changes the time between game updates
function changeSnakeSpeed(direction){
    if(direction === "up" && updateInterval > 1){
        displaySpeed++;
        updateInterval-=5;
        console.log(updateInterval);
    }
    else if(direction != "up" && displaySpeed > 1){
        displaySpeed--;
        updateInterval += 5;
    }
    else{
        return;
    }
    document.getElementById("snake-speed-text").value="Speed: "+displaySpeed;
    clearInterval(timer);
    timer = setInterval(update,updateInterval);
}

// Adjusts canvas size based on screen size
function adjustCanvasSize(){
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

    if(screenWidth > screenHeight){
        canvas.width = screenHeight-(screenHeight*.15);
        canvas.height = screenHeight-(screenHeight*.15);
    }
    else {
        canvas.width = screenWidth-(screenWidth*.2);
        canvas.height = screenWidth-(screenWidth*.2);
    }

    reset();
}

// Calls main game loop
gameLoop();


// Sets an interval between logic calculations
let timer = setInterval(update,updateInterval);

// Event listener for reset button
document.getElementById("reset").addEventListener("click", reset);
//Event listener for button that shows/removes grid
document.getElementById("show-grid").addEventListener("click", removeGrid);
//Event Listeners for arrow buttons that change grid size
document.getElementById("grid-size-left").addEventListener("click", changeGridSize.bind(null, "down"));
document.getElementById("grid-size-right").addEventListener("click", changeGridSize.bind(null, "up"));
//Event Listeners for arrow buttons that change snake movement speed
document.getElementById("snake-speed-left").addEventListener("click", changeSnakeSpeed.bind(null, "down"));
document.getElementById("snake-speed-right").addEventListener("click", changeSnakeSpeed.bind(null, "up"));

// Adds an event listener for the keydown event
document.addEventListener('keydown', function(event) {
    const key = event.key;

    // Prevent the default behavior of the up and down keys
    if (event.keyCode === 38 || event.keyCode === 40) {
        event.preventDefault();
    }

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

  // Adds an event mousedown for the keydown event
  document.getElementById("gameCanvas").addEventListener('mousedown', function(event) {
    // Calculates the center of the snake's head
    const headCenterX = findHead()[0] + 0.5 * (canvas.width / gridSize);
    const headCenterY = findHead()[1] + 0.5 * (canvas.height / gridSize);

    // Finds the relative distance of the latest click from the center of the snake's head
    const x = event.clientX - document.getElementById("gameCanvas").getBoundingClientRect().left - headCenterX;
    const y = -(event.clientY - document.getElementById("gameCanvas").getBoundingClientRect().top - headCenterY); // y is negative to make calculations more intuitive to my mathematical nature

    // Calculates where the snake should move when there is only one body segment
    if(queue.length <= 1){
        if (Math.abs(x) <= Math.abs(y) && y > 0) {
            currentDirection = "up";
        } 
        else if (Math.abs(x) <= Math.abs(y) && y < 0) {
            currentDirection = "down";
        } 
        else if (Math.abs(x) >= Math.abs(y) && x > 0) {
            currentDirection = "right";
        } 
        else if (Math.abs(x) >= Math.abs(y) && x < 0) {
            currentDirection = "left";
        }
    }
    // Calculates where the snake should move when there is more than one body segment
    else {
        if(y > 0 && (currentDirection === "left" || currentDirection === "right")){
            currentDirection = "up";
        }
        else if(y < 0 && (currentDirection === "left" || currentDirection === "right")){
            currentDirection = "down";
        }
        else if(x > 0 && (currentDirection === "up" || currentDirection === "down")){
            currentDirection = "right";
        }
        else if(x < 0 && (currentDirection === "up" || currentDirection === "down")){
            currentDirection = "left";
        }
    }
  })