// #region Html initialization
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Labels
const fpsLabel = document.getElementById("fps");
const resLabel = document.getElementById("res");

//#endregion
// #region Vector class
class vec2{
    constructor(x = 0, y = 0){ // Constructor
        this.x = x;
        this.y = y;
    }
    add(v){ // Add
        if (v instanceof vec2)
            return new vec2(this.x + v.x, this.y + v.y);
        return new vec2(this.x + v, this.y + v);
    }
    sub(v){ // Subtract
        if (v instanceof vec2)
            return new vec2(this.x - v.x, this.y - v.y);
        return new vec2(this.x - v, this.y - v);
    }
    mul(v){ // Multiply
        if (v instanceof vec2)
            return new vec2(this.x * v.x, this.y * v.y);
        return new vec2(this.x * v, this.y * v);
    }
    div(v){ // Divide
        if (v instanceof vec2)
            return new vec2(this.x / v.x, this.y / v.y);
        return new vec2(this.x / v, this.y / v);
    }
    dot(vec){ // Dot product
        return this.x * vec.x + this.y * vec.y;
    }
    length(){ // Length of vector
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    distance(vec){ // Distance to another vector
        let dx = vec.x - this.x;
        let dy = vec.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    normalize(){ // Normalization (-1 - 1)
        let len = this.length();
        return len !== 0 ? this.div(len) : new vec2();
    }
    rotate(angle){ // Rotate vector
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        return new vec2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos);
    }
}
// #endregion
// #region Initialization
// #region Keys
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;

    // Prevent arrow key normal behavior
    if (["arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
// #endregion
// #region Game Settings
const RES = 1;
const FOV = 90;
const VIEW  = 80;
const SIZE = 0.2;
// #endregion
// #region Scale by resolution
let internalWidth, internalHeight;

function updateDimensions() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Keep drawing buffer in sync with display size
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    internalWidth = Math.floor(canvas.width / RES);
    internalHeight = Math.floor(canvas.height / RES);

    resLabel.textContent = internalWidth + 'x' + internalHeight;
}

window.addEventListener("resize", updateDimensions);
updateDimensions();
// #endregion
// #region Vector initialization
let CameraRot = new vec2(0, 0);
let camDir = new vec2(1, 0);
let camPos = new vec2(2, 2);

let ScreenSpace = new vec2(0, 0);
updateScreenSpace();

function updateScreenSpace(){
    let fovRad = (FOV * Math.PI) / 180;
    let planeLength = Math.tan(fovRad / 2);
    ScreenSpace.x = camDir.y * planeLength;
    ScreenSpace.y = -camDir.x * planeLength;
}
// #endregion
// #endregion
// #region Map
const map = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,3,0,4,0,0,0,0,0,0,4,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,4,0,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,0,2,2,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,0,0,1,0,2,2,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
// #endregion
// #region Game
// #region Player collision
function Collision(v) {
    if (v.y < 0 || v.y >= map.length ||
        v.x < 0 || v.x >= map[0].length) {
        return false; // OOB
    }

    let flippedY = map.length - 1 - Math.floor(v.y);
    let tileX = Math.floor(v.x);
    return map[flippedY][tileX] > 0;
}

function tryMove(v){
    // Check x
    let newX = new vec2(v.x, camPos.y);
    if (!Collision(new vec2(Math.floor(newX.x + SIZE), Math.floor(newX.y))) &&
        !Collision(new vec2(Math.floor(newX.x - SIZE), Math.floor(newX.y)))) {
        camPos.x = newX.x;
    }

    // Check y
    let newY = new vec2(camPos.x, v.y);
    if (!Collision(new vec2(Math.floor(newY.x), Math.floor(newY.y + SIZE))) &&
        !Collision(new vec2(Math.floor(newY.x), Math.floor(newY.y - SIZE)))) {
        camPos.y = newY.y;
    }
}
// Main update function
function update(dt){
    const move = 3 * dt;
    const rot = 2 * dt;

    // Forward / Backwards
    if (keys['w']){
        tryMove(camPos.add(camDir.mul(move)));
    }
    if (keys['s']){
        tryMove(camPos.sub(camDir.mul(move)));
    }

    // Left / Right
    const right = new vec2(camDir.y, -camDir.x);
    if (keys["a"]) {
        tryMove(camPos.sub(right.mul(move)));
    }
    if (keys["d"]) {
        tryMove(camPos.add(right.mul(move)));
    }

    // Looking
    if (keys["arrowleft"]) {
        camDir = camDir.rotate(rot);
        updateScreenSpace();
    }
    if (keys["arrowright"]) {
        camDir = camDir.rotate(-rot);
        updateScreenSpace();
    }
}
// #endregion
// #region Main render function
function render(){
    // Sky
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

    // Ground
    ctx.fillStyle = "darkgreen";
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    // Main loop
    for (let x = 0; x < internalWidth; x++){
        let camX = 2 * x / internalWidth - 1;
        let rayDir = new vec2(
            camDir.x + ScreenSpace.x * camX,
            camDir.y + ScreenSpace.y * camX
        );

        // Cast ray
        let distance = castRay(camPos, rayDir, map);
        if (distance === -1) continue;
        if (!distance || distance === Infinity) distance = VIEW;

        // Get drawing data
        let height = (internalHeight / distance | 0) * RES;
        let drawStart = (canvas.height / 2 - height / 2);

        // Draw wall segment
        ctx.fillRect(
            x * RES,
            drawStart,
            RES,
            height
        );
    }
}

function castRay(pos, dir, map){
    // Get tile pos
    let mapPos = new vec2(Math.floor(pos.x), Math.floor(pos.y));

    // Length of ray
    let sideDist = new vec2();

    // Length of ray from last
    let deltaDist = new vec2();
    deltaDist.x = (dir.x === 0) ? 1e30 : Math.abs(1 / dir.x);
    deltaDist.y = (dir.y === 0) ? 1e30 : Math.abs(1 / dir.y);
    let perpWallDist;

    // Step dir
    let step = new vec2();

    // Initial step
    step.x = (dir.x < 0) ? -1 : 1;
    step.y = (dir.y < 0) ? -1 : 1;

    sideDist.x = (dir.x < 0) 
        ? (pos.x - mapPos.x) * deltaDist.x
        : (mapPos.x + 1.0 - pos.x) * deltaDist.x;
    sideDist.y = (dir.y < 0) 
        ? (pos.y - mapPos.y) * deltaDist.y
        : (mapPos.y + 1.0 - pos.y) * deltaDist.y;

    // DDA
    let hit = 0;
    let side = 0;
    let count = 0;

    while (hit === 0 && count < VIEW){
        if (sideDist.x < sideDist.y){
            sideDist.x += deltaDist.x;
            mapPos.x += step.x;
            side = 0;
        } else {
            sideDist.y += deltaDist.y;
            mapPos.y += step.y;
            side = 1;
        }
        if(Collision(mapPos)) hit = 1;

        count++;
    }

    if (hit === 0) return -1; // no hit means no render

    // Fisheye fix
    if (side === 0)
        perpWallDist = sideDist.x - deltaDist.x;
    else
        perpWallDist = sideDist.y - deltaDist.y;

    // Shading
    side === 1 ? ctx.fillStyle = "darkblue" : ctx.fillStyle = "blue"; 
    return perpWallDist;
}

// #endregion
// #region Game loop

// Fps inititialization
let lastTime = performance.now();
let fps = 0;

function gameLoop(timestamp){
    // Delta
    let delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Fps
    fps = (1 / delta).toFixed(1);
    fpsLabel.textContent = `FPS: ${fps}`;

    // Main functions
    update(delta);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Program start
requestAnimationFrame(gameLoop);

// #endregion