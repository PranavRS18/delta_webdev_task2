// DOM
const world = document.querySelector("#world")
const ctx = world.getContext("2d");

const camera = document.querySelector("#camera");
const cameraCtx = camera.getContext("2d");

world.width = world.clientWidth;
world.height = world.clientHeight;

camera.width = window.innerWidth;
camera.height = window.innerHeight;

// Relative Length
const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);

// world Variables
const nColumns = 7;
const nRows = 7;
const blockWidth = world.width / nColumns;
const blockHeight = world.height / nRows;

// Grass
const rectX = blockWidth / 10;
const rectY = blockHeight / 10;
const rectWidth = blockWidth * 4 / 5;
const rectHeight = blockHeight * 4 / 5;

// Building
let buildingX, buildingY, nBuildings;
const buildingWidth = rectWidth / 3;
const buildingHeight = rectHeight / 3;
let buildings = [];
let blockBuildings = [];

// Shooter
let shooterX, shooterY, shooterBuilding, shooterAngle;
let shooterRadius = buildingWidth / 8;
const shooterRange = shooterRadius * 21;
const shooterArc = Math.PI * 7 / 36;
const shooterSpeed = Math.PI / 350;

// Key
let keyX, keyY, nKeys;
let keyRadius = buildingWidth / 12;
let keys = [];
let blockKeys = [];

// Keys
nKeys = 1 + Math.floor(Math.random() * 3);
keys = []

for (let key = 0; key < nKeys; key++) {
    keyX = Math.random() * blockWidth;
    keyY = Math.random() * blockHeight;
    keys.push([keyX, keyY]);
}

const global = new Map()
global.set('0, 0', {
    type : 'central',
    buildings: [],
    shooter: [0, 0, 0],
    keys: keys
})
let blockData, globalBlockX, globalBlockY;

function createBlock(globalX, globalY) {

    // Buildings
    nBuildings = 2 + Math.floor(Math.random() * 2);
    buildings = []
    for (let building = 0; building < nBuildings; building++) {
        buildingX = rectX + Math.random() * (rectWidth - buildingWidth);
        buildingY = rectY + Math.random() * (rectHeight - buildingHeight);
        buildings.push([buildingX, buildingY, 3]);
    }

    // Shooter
    shooterBuilding = buildings[0];
    shooterX = shooterBuilding[0] + shooterRadius + Math.random() * (buildingWidth - 2 * shooterRadius);
    shooterY = shooterBuilding[1] + shooterRadius + Math.random() * (buildingHeight - 2 * shooterRadius);

    // Keys
    nKeys = 2 + Math.ceil(Math.random() * 3);
    keys = []

    for (let key = 0; key < nKeys; key++) {
        keyX = Math.random() * blockWidth;
        keyY = Math.random() * blockHeight;
        keys.push([keyX, keyY]);
    }

    global.set(`${globalX}, ${globalY}`, {
        type : 'regular',
        buildings : buildings,
        shooter: [shooterX, shooterY, Math.random() * Math.PI * 2],
        keys : keys
    });

}

function drawBlock(worldX, worldY) {

    globalBlockX = globalX + worldX - 3;
    globalBlockY = worldY - globalY - 3;

    if (!global.has(`${globalBlockX}, ${globalBlockY}`)) {
        createBlock(globalBlockX, globalBlockY)
    }

    blockData = global.get(`${globalBlockX}, ${globalBlockY}`);

    if (blockData.type === 'regular') {
        ctx.fillStyle = 'limegreen';
    }
    else if (blockData.type === 'central') {
        ctx.fillStyle = 'blue';
    }

    ctx.fillRect(worldX * blockWidth + rectX, worldY * blockHeight + rectY, rectWidth, rectHeight);

    blockBuildings = blockData.buildings;
    ctx.fillStyle = 'black';
    for (let building = 0; building < blockBuildings.length; building++) {
        buildingX = worldX * blockWidth + blockBuildings[building][0];
        buildingY = worldY * blockHeight + blockBuildings[building][1];
        ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
    }

    blockKeys = blockData.keys;
    ctx.fillStyle = 'orange';
    for (let key = 0; key < blockKeys.length; key++) {
        keyX = worldX * blockWidth + blockKeys[key][0];
        keyY = worldY * blockHeight + blockKeys[key][1];

        ctx.beginPath();
        ctx.arc(keyX,
            keyY,
            keyRadius,
            0,
            Math.PI * 2,
            false);
        ctx.fill();
        ctx.closePath();
    }

}

function drawShooter(worldX, worldY) {

    globalBlockX = globalX + worldX - 3;
    globalBlockY = worldY - globalY - 3;
    blockData = global.get(`${globalBlockX}, ${globalBlockY}`);

    [shooterX, shooterY, shooterAngle] = blockData.shooter;
    shooterX = worldX * blockWidth + shooterX;
    shooterY = worldY * blockHeight + shooterY;
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(shooterX,
        shooterY,
        (blockData.type === 'regular') ? shooterRadius : 0,
        0,
        Math.PI * 2,
        false);
    ctx.fill();
    ctx.closePath();


    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.moveTo(shooterX, shooterY);
    ctx.arc(shooterX,
        shooterY,
        (blockData.type === 'regular') ? shooterRange : 0,
        shooterAngle - shooterArc,
        shooterAngle + shooterArc,
        false);
    ctx.lineTo(shooterX, shooterY);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    blockData.shooter[2] += shooterSpeed;
}

function drawCity() {

    // Block Separation
    ctx.beginPath();
    ctx.strokeStyle = "limegreen";
    ctx.lineWidth = 0.1 * remInPx;
    for (let col = 0; col < nColumns; col++) {
        ctx.moveTo(col * blockWidth, 0)
        ctx.lineTo(col * blockWidth, world.height)
        ctx.stroke();
        ctx.closePath();
    }

    for (let row = 0; row < nColumns; row++) {
        ctx.moveTo(0, row * blockHeight)
        ctx.lineTo(world.width, row * blockHeight)
        ctx.stroke();
        ctx.closePath();
    }

    if (playerX > initialPlayerX + blockWidth * 1.75) {
        playerX -= blockWidth;
        cameraX -= blockWidth;
        globalX++;
    }
    else if (playerX < initialPlayerX - blockWidth * 1.75) {
        playerX += blockWidth;
        cameraX += blockWidth;
        globalX--;
    }

    if (playerY > initialPlayerY + blockHeight * 1.75) {
        playerY -= blockHeight;
        cameraY -= blockHeight;
        globalY--;
    }
    else if (playerY < initialPlayerY - blockHeight * 1.75) {
        playerY += blockHeight;
        cameraY += blockHeight;
        globalY++;
    }

    for (let col = 0; col < nColumns; col++) {
        for (let row = 0; row < nRows; row++) {
            drawBlock(col, row);
        }
    }

    for (let col = 0; col < nColumns; col++) {
        for (let row = 0; row < nRows; row++) {
            drawShooter(col, row);
        }
    }
}

// Player
const playerRadius = 0.8 * remInPx;
const playerSpeed = 0.15 * remInPx;
const keysPressed = [];
const initialPlayerX = world.width / 2;
const initialPlayerY = world.height / 2;
let playerX = initialPlayerX;
let playerY = initialPlayerY;
let globalX = 0;
let globalY = 0;

// Track Keys Pressed
window.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
});

function playerMove() {

    // Player
    if (keysPressed['w']) playerY -= playerSpeed;
    if (keysPressed['s']) playerY += playerSpeed;
    if (keysPressed['a']) playerX -= playerSpeed;
    if (keysPressed['d']) playerX += playerSpeed;

    // Camera
    if (playerX > initialPlayerX + blockWidth * 3 / 4 || playerX < initialPlayerX - blockWidth * 3 / 4) {
        if (keysPressed['a']) cameraX -= playerSpeed;
        if (keysPressed['d']) cameraX += playerSpeed;
    }

    if (playerY > initialPlayerY + blockHeight * 3 / 4 || playerY < initialPlayerY - blockHeight * 3 / 4) {
        if (keysPressed['w']) cameraY -= playerSpeed;
        if (keysPressed['s']) cameraY += playerSpeed;
    }

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

let cameraX = blockWidth;
let cameraY = blockHeight * 2;

function animate() {
    ctx.clearRect(0, 0, world.clientWidth, world.clientHeight);
    cameraCtx.clearRect(0, 0, camera.clientWidth, camera.clientHeight);
    drawCity();
    playerMove();

    cameraCtx.drawImage(
        world,
        cameraX, cameraY,
        world.width * 5 / 7, world.height * 3 / 7,
        0, 0,
        window.innerWidth, window.innerHeight);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);