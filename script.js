// DOM
const world = document.querySelector("#world")
const ctx = world.getContext("2d");

const camera = document.querySelector("#camera");
const cameraCtx = camera.getContext("2d");

world.width = world.clientWidth;
world.height = world.clientHeight;

camera.width = window.innerWidth;
camera.height = window.innerHeight;

// Relative Length and DOM
const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
const position = document.querySelector("#position");
const details = document.querySelector("#details");
const player = document.querySelector("#player");
const result = document.querySelector("#result");
const resultText = document.querySelector("#resultText");
const pause = document.querySelector("#pause");
const menuScreen = document.querySelector("#menuScreen");
const home = document.querySelector("#home");
const start = document.querySelector("#start");
const show = document.querySelector("#show");
const resume = document.querySelector("#resume");
const restart = document.querySelector("#restart");
const damage = document.querySelector("#damage");
const retry = document.querySelector("#retry");
const mainMenu = document.querySelector("#mainMenu");
const marketPlace = document.querySelector("#marketPlace");
const message = document.querySelector("#message");
const items = document.querySelectorAll(".items");
let itemButton, itemButtonText;
let itemPrices = [3, 5, 7, 10, 10, 15, 0, 0];
const instructions = document.querySelector("#instructions");
const howToPlay = document.querySelector("#howToPlay");
const confirmation = document.querySelector("#confirmation");
const sure = document.querySelector("#sure");
const yes = document.querySelector("#yes");
const no = document.querySelector("#no");
const inventory = document.querySelector("#inventory");
const owned = Array.from(document.querySelectorAll(".owned"));
const use = Array.from(document.querySelectorAll(".use"));
const prefs = document.querySelector("#prefs");
const preferences = document.querySelector("#preferences");
const hackMode = document.querySelector("#hackMode");
const resetScore = document.querySelector("#resetScore");

// Variables
let isMarket = false;
let isRestart = null;
let isShiftPressed = false;

// World Variables
let isStart = true;
let isPlay = true;
let timeElapsed = 0;
const nColumns = 7;
const nRows = 7;
const blockWidth = world.width / nColumns;
const blockHeight = world.height / nRows;
let playerKeys = 0;
let playerShards = 0;
let playerHealth = 50;
const playerHealthDecrease = 0.4;
let playerScore = 0;
let playerAngle, nearestX, nearestY, distX, distY;

if (localStorage.getItem('highScore') !== null) {
    highScore = parseInt(localStorage.getItem("highScore"));
} else {
    highScore = 0;
}
show.innerText = `HIGH SCORE : ${highScore}`;

// Grass
const rectX = blockWidth / 10;
const rectY = blockHeight / 10;
const rectWidth = blockWidth * 4 / 5;
const rectHeight = blockHeight * 4 / 5;

// Building
let buildingX, buildingY, nBuildings, isCollidedRX, isCollidedUY, isCollidedLX, isCollidedDY, collision;
const buildingWidth = rectWidth / 3;
const buildingHeight = rectHeight / 3;
let buildings = [];
let blockBuildings = [];
let renderedBuildings = [];
let damagedBuilding = [];
let initialBuildingHealth = 3;

// Shooter
let shooterX, shooterY, shooterBuilding, shooterAngle;
let shooterRadius = buildingWidth / 8;
const shooterRange = buildingWidth * 2;
const shooterArc = Math.PI * 7 / 36;
const shooterSpeed = Math.PI / 350;
let damageOpacity = 0.4;

// Key
const keysToShards = 4;
let keyX, keyY, nKeys, newKeyX, newKeyY;
let keyRadius = buildingWidth / 12;
let keys = [];
let blockKeys = [];
let systemHealth = 200;
const magnetSpeed = 0.3 * remInPx;

function createKeys() {
    // Keys
    nKeys = 2 + Math.floor(Math.random() * 4);
    keys = []

    for (let key = 0; key < nKeys; key++) {
        keyX = Math.random() * blockWidth;
        keyY = Math.random() * blockHeight;
        keys.push([keyX, keyY]);
    }
    return keys;
}

const chunksVisited = new Set();
chunksVisited.add('0, 0');
let chunkSize = 7;
let chunkX, chunkY, minChunkX, minChunkY, maxChunkX, maxChunkY, shuffledBlockType, shuffledBlockTypes, paddingBlock;

const blockTypes = ['central', 'base', 'safe', 'factory']
const global = new Map();
let blockData, globalBlockX, globalBlockY, blockX, blockY, isSafe;
let globalXChange = '0';

let bots = [];
const botFactories = new Map();
let botGenerateTimer = 8;
const botRadius = buildingWidth / 8;
const botRange = buildingWidth * 1.25;
const botSpeed = 0.075 * remInPx;
let lastBotProduced, moves, move, botDistanceFromPlayer;

const healthPackChance = 0.015;
const healthRadius = 0.5 * remInPx;
let healthX, healthY, healthPack;

const invisibilityPackChance = 0.03;
const invisibilityRadius = 0.5 * remInPx;
let invisibilityX, invisibilityY, invisibilityPack;
let isInvisible = 0;

const baseChunkBorder = Math.floor(chunkSize / 2);
function createBaseChunk() {
    shuffledBlockTypes = shuffleArray(blockTypes);
    for (let block = 0; block < shuffledBlockTypes.length; block++) {
        shuffledBlockType = shuffledBlockTypes[block];
        if (shuffledBlockType === 'factory' || shuffledBlockType === 'safe') {
            global.set('0, 0', {
                type : 'safe',
                buildings: [],
                shooter: [0, 0, 0],
                keys: [],
                health : [],
                invisibility : []
            });
            continue;
        } else if (shuffledBlockType === 'central') {
            paddingBlock = 0;
        } else {
            paddingBlock = 1;
        }

        if (block === 0) {
            blockX = -1 * baseChunkBorder + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = baseChunkBorder - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        } else if (block === 1) {
            blockX = baseChunkBorder - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = baseChunkBorder - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        } else if (block === 2) {
            blockX = baseChunkBorder - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = -1 * baseChunkBorder + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        } else {
            blockX = -1 * baseChunkBorder + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = -1 * baseChunkBorder + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        }

        if (shuffledBlockType === 'factory') botFactories.set(`${blockX}, ${blockY}`, botGenerateTimer)

        global.set(`${blockX}, ${blockY}`, {
            type: shuffledBlockType,
            buildings: [],
            shooter: [0, 0, 0],
            keys: createKeys(),
            health : (Math.random() < healthPackChance) ? [Math.random() * blockWidth, Math.random() * blockHeight] : [],
            invisibility : (Math.random() < invisibilityPackChance) ? [Math.random() * blockWidth, Math.random() * blockHeight] : []
        });
    }
}

createBaseChunk();

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createChunk(chunkX, chunkY) {
    minChunkX = chunkX * chunkSize - Math.floor(chunkSize / 2);
    maxChunkX = chunkX * chunkSize + Math.floor(chunkSize / 2);
    minChunkY = chunkY * chunkSize - Math.floor(chunkSize / 2);
    maxChunkY = chunkY * chunkSize + Math.floor(chunkSize / 2);

    shuffledBlockTypes = shuffleArray(blockTypes)
    for (let block = 0; block < blockTypes.length; block++) {
        shuffledBlockType = shuffledBlockTypes[block];
        if ((shuffledBlockType === 'safe' || shuffledBlockType === 'factory')) {
            paddingBlock = 0;
        }
        else {
            paddingBlock = 1;
        }

        if (block === 0) {
            blockX = minChunkX + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = maxChunkY - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        }
        else if (block === 1) {
            blockX = maxChunkX - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = maxChunkY - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        }
        else if (block === 2) {
            blockX = maxChunkX - Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = minChunkY + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        }
        else {
            blockX = minChunkX + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
            blockY = minChunkY + Math.floor(Math.random() * (Math.floor(chunkSize / 2) - paddingBlock));
        }

        if (shuffledBlockType === 'factory') botFactories.set(`${blockX}, ${blockY}`, botGenerateTimer)

        global.set(`${blockX}, ${blockY}`, {
            type : shuffledBlockType,
            buildings: [],
            shooter: [0, 0, 0],
            keys: createKeys(),
            health : (Math.random() < healthPackChance) ? [Math.random() * blockWidth, Math.random() * blockHeight] : [],
            invisibility : (Math.random() < invisibilityPackChance) ? [Math.random() * blockWidth, Math.random() * blockHeight] : []
        });
    }
    chunksVisited.add(`${chunkX}, ${chunkY}`)

}

function createBlock(globalX, globalY) {

    // Buildings
    nBuildings = 2 + Math.floor(Math.random() * 2);
    buildings = []
    for (let building = 0; building < nBuildings; building++) {
        buildingX = rectX + Math.random() * (rectWidth - buildingWidth);
        buildingY = rectY + Math.random() * (rectHeight - buildingHeight);
        buildings.push([buildingX, buildingY, initialBuildingHealth]);
    }

    // Shooter
    shooterBuilding = buildings[0];
    shooterX = shooterBuilding[0] + shooterRadius + Math.random() * (buildingWidth - 2 * shooterRadius);
    shooterY = shooterBuilding[1] + shooterRadius + Math.random() * (buildingHeight - 2 * shooterRadius);

    if (globalXChange === '+') shooterAngle = (shooterArc + 3 * Math.PI / 2) + Math.random() * (Math.PI - 2 * shooterArc);
    else if (globalXChange === '-') shooterAngle = (shooterArc + Math.PI / 2) + Math.random() * (Math.PI - 2 * shooterArc);
    else shooterAngle = Math.PI * 2 * Math.random();

    global.set(`${globalX}, ${globalY}`, {
        type : 'regular',
        buildings : buildings,
        shooter: [shooterX, shooterY, shooterAngle],
        keys : createKeys(),
        health : (Math.random() < healthPackChance) ? [Math.random() * blockWidth, Math.random() * blockHeight] : [],
        invisibility : (Math.random() < invisibilityPackChance) ? [Math.random() * blockWidth, Math.random() * blockHeight] : []
    });

}

function checkIfKeyCollected(keyX, keyY) {
    if ((keyRadius + playerRadius) ** 2 >= (playerX - keyX) ** 2 + (playerY - keyY) ** 2) {
        return true;
    }
    return false;
}

function checkIfHealthCollected(healthX, healthY) {
    if ((healthRadius + playerRadius) ** 2 >= (playerX - healthX) ** 2 + (playerY - healthY) ** 2) {
        return true;
    }
    return false;
}

function checkIfInvisibilityCollected(invisibilityX, invisibilityY) {
    if ((invisibilityRadius + playerRadius) ** 2 >= (playerX - invisibilityX) ** 2 + (playerY - invisibilityY) ** 2) {
        return true;
    }
    return false;
}

function isCollided(buildingX, buildingY) {
    // Clamping Function
    nearestX = Math.max(buildingX, Math.min(buildingX + buildingWidth, playerX));
    nearestY = Math.max(buildingY, Math.min(buildingY + buildingHeight, playerY));

    distX = playerX - nearestX
    distY = playerY - nearestY

    if (playerRadius ** 2 >= distX ** 2 + distY ** 2) {
        if (Math.abs(distX) > Math.abs(distY)) {
            return (distX > 0) ? 'X' : '-X';
        }
        else {
            return (distY > 0) ? 'Y' : '-Y';
        }
    }
    return 'N';
}

function createShards(rectX, rectY) {
    if (playerX > rectX - playerRadius && playerX < rectX + rectWidth + playerRadius &&
        playerY > rectY - playerRadius && playerY < rectY + rectHeight + playerRadius) {
        if (keysToShards <= playerKeys) {
            playerKeys -= keysToShards;
            playerShards++;
            if (!isHackMode) playerScore += 20;
        }
    }
}

function shardsToHealth(rectX, rectY) {
    if (playerX > rectX - playerRadius && playerX < rectX + rectWidth + playerRadius &&
        playerY > rectY - playerRadius && playerY < rectY + rectHeight + playerRadius) {
        if (playerShards) {
            playerShards--;
            systemHealth = Math.min(systemHealth + 10, 250);
            if (!isHackMode) playerScore += 25;
        }
    }
}

function checkIfSafe(rectX, rectY) {
    if (playerX > rectX - playerRadius && playerX < rectX + rectWidth + playerRadius &&
        playerY > rectY - playerRadius && playerY < rectY + rectHeight + playerRadius) {
        return true;
    }
    return false;
}

function drawBlock(worldX, worldY) {

    globalBlockX = globalX + worldX - 3;
    globalBlockY = globalY - worldY + 3;

    if (playerX > worldX * blockWidth && playerX < (worldX + 1) * blockWidth
        && playerY > worldY * blockHeight && playerY < (worldY + 1) * blockHeight) {
        position.innerText = `Global Player Position\nX : ${globalBlockX}\nY : ${globalBlockY}`;
        globalPlayerX = globalBlockX;
        globalPlayerY = globalBlockY;
    }

    if (!global.has(`${globalBlockX}, ${globalBlockY}`)) {
        createBlock(globalBlockX, globalBlockY);
    }

    blockData = global.get(`${globalBlockX}, ${globalBlockY}`);

    if (blockData.type === 'regular') {
        ctx.fillStyle = 'rgb(57, 255, 20)';
    }
    else if (blockData.type === 'central') {
        createShards(worldX * blockWidth + rectX, worldY * blockHeight + rectY)
        ctx.fillStyle = '#FF8C00';
    }
    else if (blockData.type === 'factory') {
        ctx.fillStyle = 'gray';
    }
    else if (blockData.type === 'safe') {
        isSafe = checkIfSafe(worldX * blockWidth + rectX, worldY * blockHeight + rectY);
        ctx.fillStyle = '#FFFF33';
    }
    else {
        shardsToHealth(worldX * blockWidth + rectX, worldY * blockHeight + rectY);
        ctx.fillStyle = '#0088FF';
    }

    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.3 * remInPx;
    ctx.fillRect(worldX * blockWidth + rectX, worldY * blockHeight + rectY, rectWidth, rectHeight);
    ctx.strokeRect(worldX * blockWidth + rectX, worldY * blockHeight + rectY, rectWidth, rectHeight);

    blockBuildings = blockData.buildings;
    ctx.fillStyle = 'black';
    for (let building = 0; building < blockBuildings.length; building++) {
        buildingX = worldX * blockWidth + blockBuildings[building][0];
        buildingY = worldY * blockHeight + blockBuildings[building][1];
        ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
        renderedBuildings.push([buildingX, buildingY, blockBuildings[building][2]]);
    }

    blockBuildings.forEach((building, idx, buildings) => {
        if (damagedBuilding[0] === worldX * blockWidth + building[0] && damagedBuilding[1] === worldY * blockHeight + building[1]) {
            buildings[idx] = [building[0], building[1], damagedBuilding[2]];
            return true;
        }
        if (buildings[idx][2] <= 0) {
           blockBuildings.splice(idx, 1);
           if (idx === 0) blockData.shooter = [];
       }
    });

    blockKeys = blockData.keys;
    blockKeys.forEach(([keyX, keyY]) => {

        newKeyX = worldX * blockWidth + keyX;
        newKeyY = worldY * blockHeight + keyY;

        if (isMagnet) {
            if ((playerX - newKeyX) ** 2 + (playerY - newKeyY) ** 2 < (0.5 * blockWidth) ** 2) {
                blockKeys = blockKeys.filter(([x, y]) => !(x === keyX && y === keyY));
                newKeyX += Math.cos(Math.atan2(playerY - newKeyY, playerX - newKeyX)) * magnetSpeed;
                newKeyY += Math.sin(Math.atan2(playerY - newKeyY, playerX - newKeyX)) * magnetSpeed;
                keyX = newKeyX - worldX * blockWidth;
                keyY = newKeyY - worldY * blockHeight
                blockKeys.push([keyX, keyY]);
            }
        }

        if (checkIfKeyCollected(newKeyX, newKeyY)) {
            blockKeys = blockKeys.filter(([x, y]) => !(x === keyX && y === keyY));
            playerKeys++;
            if (!isHackMode) playerScore += 5;
        }
    });

    if (blockData.health) {
        healthPack = blockData.health;
        healthX = worldX * blockWidth + blockData.health[0];
        healthY = worldY * blockHeight + blockData.health[1];
        if (checkIfHealthCollected(healthX, healthY)) {
            healthPack = [];
            playerHealth = Math.min(playerHealth + 10, 100);
            if (!isHackMode) playerScore += 10;
        }
    }

    if (blockData.invisibility) {
        invisibilityPack = blockData.invisibility;
        invisibilityX = worldX * blockWidth + blockData.invisibility[0];
        invisibilityY = worldY * blockHeight + blockData.invisibility[1];
        if (checkIfInvisibilityCollected(invisibilityX, invisibilityY)) {
            invisibilityPack = [];
            isInvisible += 10;
            if (!isHackMode) playerScore += 10;
        }
    }

    global.set(`${globalBlockX}, ${globalBlockY}`, {
        type: blockData.type,
        buildings: blockBuildings,
        keys: blockKeys,
        shooter: blockData.shooter,
        health: healthPack,
        invisibility: invisibilityPack
    });

    if (blockData.health) {
        ctx.strokeStyle = '#8B0000';
        ctx.fillStyle = '#FF10F0';
        ctx.beginPath();
        ctx.arc(healthX,
            healthY,
            healthRadius,
            0,
            Math.PI * 2,
            false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    if (blockData.invisibility) {
        ctx.strokeStyle = '#8B0000';
        ctx.fillStyle = 'beige';
        ctx.beginPath();
        ctx.arc(invisibilityX,
            invisibilityY,
            invisibilityRadius,
            0,
            Math.PI * 2,
            false);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

    ctx.strokeStyle = '#6B4226';
    ctx.fillStyle = '#D2691E';
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
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }
}

function drawShooter(worldX, worldY) {
    globalBlockX = globalX + worldX - 3;
    globalBlockY = globalY - worldY + 3;
    blockData = global.get(`${globalBlockX}, ${globalBlockY}`);

    [shooterX, shooterY, shooterAngle] = blockData.shooter;
    shooterX = worldX * blockWidth + shooterX;
    shooterY = worldY * blockHeight + shooterY;
    ctx.beginPath();
    ctx.fillStyle = 'rgb(255, 36, 36)';
    ctx.arc(shooterX,
        shooterY,
        (blockData.type === 'regular') ? shooterRadius : 0,
        0,
        Math.PI * 2,
        false);
    ctx.fill();
    ctx.closePath();


    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 36, 36, ${damageOpacity * 0.7 / 0.4})`;
    ctx.fillStyle = `rgba(255, 36, 36, ${damageOpacity})`;
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

    if ((playerX - shooterX) ** 2 + (playerY - shooterY) ** 2 <= (playerRadius + shooterRange) ** 2 && blockData.type === 'regular'
        && playerHealth > 0 && !isInvisible && !isEMPBlast) {
        playerAngle = Math.atan2(playerY - shooterY, playerX - shooterX);
        shooterAngle = shooterAngle % (Math.PI * 2);
        shooterAngle = (shooterAngle > Math.PI) ? shooterAngle - 2 * Math.PI : shooterAngle;
        playerAngle = (playerAngle > Math.PI) ? playerAngle - 2 * Math.PI : playerAngle;
        if (playerAngle > shooterAngle - shooterArc &&
            playerAngle < shooterAngle + shooterArc && !isSafe && !isHackMode) {
            playerHealth -= playerHealthDecrease;
            damage.style.opacity = '1';
        }
    }
}

function drawCity() {

    // Block Separation
    ctx.beginPath();
    ctx.strokeStyle = "rgb(57, 255, 20)";
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

    // Global Updates
    if (playerX > initialPlayerX + blockWidth * 1.75) {
        playerX -= blockWidth;
        cameraX -= blockWidth;
        globalX++;
        globalXChange = "+";
    }
    else if (playerX < initialPlayerX - blockWidth * 1.75) {
        playerX += blockWidth;
        cameraX += blockWidth;
        globalX--;
        globalXChange = "-";
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

    chunkX = Math.floor((globalX + 4) / chunkSize);
    chunkY = Math.floor((globalY + 4) / chunkSize);

    for (let X = -1; X < 2; X++){
        for (let Y = -1; Y < 2; Y++){
            if (!chunksVisited.has(`${chunkX + X}, ${chunkY + Y}`)) {
                createChunk(chunkX + X, chunkY + Y);
            }
        }
    }

    // Draw City
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

function botMove() {
    bots.forEach(bot => {
        if (bot[0] === bot[2] && bot[1] === bot[3]) {
            moves = [bot[0] - blockWidth, bot[0] + blockWidth].concat(
                [bot[1] - blockHeight, bot[1] + blockHeight]);
            move = Math.floor(Math.random() * (moves.length - 1))

            if (move < 2) bot[2] = moves[move]
            else bot[3] = moves[move]

        } else {
            if (bot[2] !== bot[0]) {
                if (Math.abs(bot[2] - bot[0]) > botSpeed) bot[0] += (bot[2] - bot[0] > 0 ? 1 : -1) * botSpeed;
                else bot[0] = bot[2]
            }
            else {
                if (Math.abs(bot[3] - bot[1]) > botSpeed) bot[1] += (bot[3] - bot[1] > 0 ? 1 : -1) * botSpeed;
                else bot[3] = bot[1]
            }
        }
    });
}

function drawBots() {
    bots.forEach(bot => {
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'rgb(159, 159, 159)';
        ctx.arc(bot[0] + (3 - globalX) * blockWidth, (3 + globalY) * blockHeight - bot[1], botRadius, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = `rgba(63, 63, 63, ${damageOpacity * 0.7 / 0.4})`;
        ctx.fillStyle = `rgba(63, 63, 63, ${damageOpacity})`;
        ctx.arc(bot[0] + (3 - globalX) * blockWidth, (3 + globalY) * blockHeight - bot[1], botRange, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.fill();

        botDistanceFromPlayer = (bot[0] + (3 - globalX) * blockWidth - playerX) ** 2 + ((3 + globalY) * blockHeight - bot[1] - playerY) ** 2;

        // Remove if Bot Not in 15 Blocks Radius
        if (botDistanceFromPlayer > (15 * blockWidth) ** 2) {
            bots = bots.filter(([botX, botY]) => !(botX === bot[0] && botY === bot[1]));
        }

        if ((botRange + playerRadius) ** 2 > botDistanceFromPlayer && !isSafe && !isInvisible && !isEMPBlast && !isHackMode) {
            playerHealth -= playerHealthDecrease * 2;
            damage.style.opacity = '1';
        }

    })
}

function isBulletCollided(buildingX, buildingY, bulletX, bulletY, bulletAngle) {
    newBulletX = (3 - globalX) * blockWidth + bulletX;
    newBulletY = (3 + globalY - Math.floor(bulletY / blockHeight)) * blockHeight + blockHeight - ((bulletY % blockHeight) + blockHeight) % blockHeight;

    // Clamping Function
    nearestX = Math.max(buildingX, Math.min(buildingX + buildingWidth, newBulletX));
    nearestY = Math.max(buildingY, Math.min(buildingY + buildingHeight, newBulletY));

    distX = newBulletX - nearestX
    distY = newBulletY - nearestY

    if (bulletRadius ** 2 >= distX ** 2 + distY ** 2) {
        if (Math.abs(distX) > Math.abs(distY)) {
            bulletX += ((distX >= 0) ? 1 : -1) * bulletSpeed
            bulletX += ((distX === 0 && bulletAngle === 0) ? 2 : 0) * bulletSpeed * 1.25
            return ['X', bulletX, bulletY];
        }
        else {
            bulletY += ((distY > 0) ? -1 : 1) * bulletSpeed
            bulletY += ((distY === 0 && bulletAngle === Math.PI / 2) ? -2 : 0) * bulletSpeed * 1.25
            return ['Y', bulletX, bulletY];
        }
    }
    return ['N', bulletX, bulletY];
}

// Player
const playerRadius = 0.8 * remInPx;
const playerSpeed = 0.25 * remInPx;
const keysPressed = [];
const initialPlayerX = world.width / 2;
const initialPlayerY = world.height / 2;
let playerX = initialPlayerX;
let playerY = initialPlayerY;
let playerLookAngle = 3 * Math.PI / 2;
const playerLookArc = Math.PI / 8;
const playerLookAngleSpeed = Math.PI / 15;
let globalX = 0;
let globalY = 0;
let globalPlayerX, globalPlayerY;

// Track Keys Pressed
window.addEventListener('keydown', (event) => {
    keysPressed[event.key.toLowerCase()] = true;
    if (event.key === 'Shift') isShiftPressed = true;
});
window.addEventListener('keyup', (event) => {
    keysPressed[event.key.toLowerCase()] = false;
    if (event.key === 'Shift') isShiftPressed = false;
});

function showPowers(startAngle) {
    let endAngle = startAngle + Math.PI / 3.1;
    ctx.beginPath();
    ctx.moveTo(playerX + (playerRadius * Math.cos(startAngle) * 2.25), playerY + (playerRadius * Math.sin(startAngle) * 2.25));
    ctx.arc(playerX, playerY, playerRadius * 5, startAngle, endAngle, false);
    ctx.lineTo(playerX + (playerRadius * Math.cos(endAngle) * 2.25), playerY + (playerRadius * Math.sin(endAngle)) * 2.25);
    ctx.arc(playerX, playerY, playerRadius * 2.3, endAngle, startAngle, true);
    ctx.lineTo(playerX + (playerRadius * Math.cos(startAngle) * 2.25), playerY + (playerRadius * Math.sin(startAngle) * 2.25))
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function playerMove() {

    isCollidedRX = false;
    isCollidedUY = false;
    isCollidedLX = false;
    isCollidedDY = false
    renderedBuildings.forEach(building => {
       collision = isCollided(building[0], building[1]);
       isCollidedRX ||= (collision === 'X');
       isCollidedUY ||= (collision === 'Y');
       isCollidedLX ||= (collision === '-X');
       isCollidedDY ||= (collision === '-Y');
    });

    playerLookAngle %= 2 * Math.PI;

    if (playerHealth > 0 && !isStart) {

        if (keysPressed['q']) {
            playerLookAngle -= playerLookAngleSpeed / 2;
        } else if (keysPressed['e']) {
            playerLookAngle += playerLookAngleSpeed / 2;
        }

        // Player +X
        if (!isCollidedRX) {
            if (keysPressed['a']) {
                playerLookAngle = (playerLookAngle < 0) ? playerLookAngle + 2 * Math.PI : playerLookAngle;
                playerX -= playerSpeed;
                playerLookAngle -= Math.sin((playerLookAngle - Math.PI) / 2) * playerLookAngleSpeed;
                if (playerX > initialPlayerX + blockWidth * 3 / 4 || playerX < initialPlayerX - blockWidth * 3 / 4) {
                    cameraX -= playerSpeed;
                }
            }
        }
        // Player -X
        if (!isCollidedLX) {
            if (keysPressed['d']) {
                playerLookAngle = (playerLookAngle < Math.PI) ? playerLookAngle + 2 * Math.PI : playerLookAngle;
                playerX += playerSpeed;
                playerLookAngle -= Math.sin(playerLookAngle / 2 - Math.PI) * playerLookAngleSpeed;
                if (playerX > initialPlayerX + blockWidth * 3 / 4 || playerX < initialPlayerX - blockWidth * 3 / 4) {
                    if (keysPressed['d']) cameraX += playerSpeed;
                }
            }
        }

        // Player +Y
        if (!isCollidedUY) {
            if (keysPressed['w']) {
                playerLookAngle = (playerLookAngle < Math.PI / 2) ? playerLookAngle + 2 * Math.PI : playerLookAngle;
                playerY -= playerSpeed;
                playerLookAngle -= Math.sin((playerLookAngle - 3 * Math.PI / 2) / 2) * playerLookAngleSpeed;
                if (playerY > initialPlayerY + blockHeight * 3 / 4 || playerY < initialPlayerY - blockHeight * 3 / 4) {
                    if (keysPressed['w']) cameraY -= playerSpeed;
                }
            }
        }


        // Camera
        if (!isCollidedDY) {
            if (keysPressed['s']) {
                playerLookAngle = (playerLookAngle <  3 * Math.PI / 2) ? playerLookAngle + 2 * Math.PI : playerLookAngle;
                playerY += playerSpeed;
                playerLookAngle -= Math.sin((playerLookAngle - 5 * Math.PI / 2) / 2) * playerLookAngleSpeed;
                if (playerY > initialPlayerY + blockHeight * 3 / 4 || playerY < initialPlayerY - blockHeight * 3 / 4) {
                    if (keysPressed['s']) cameraY += playerSpeed;
                }
            }
        }
    }

    cameraX = Math.max(0, Math.min(cameraX, 1.5 * blockWidth));

    ctx.beginPath();
    if (!isInvisible) {
        ctx.strokeStyle = "black";
        ctx.fillStyle = 'white';
    } else {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    }
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    if (!isInvisible) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    } else {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    }
    ctx.moveTo(playerX + (playerRadius * Math.cos(playerLookAngle - playerLookArc) * 1.4), playerY + (playerRadius * Math.sin(playerLookAngle - playerLookArc) * 1.4));
    ctx.arc(playerX, playerY, playerRadius * 1.75, playerLookAngle - playerLookArc, playerLookAngle + playerLookArc, false);
    ctx.lineTo(playerX + (playerRadius * Math.cos(playerLookAngle + playerLookArc) * 1.4), playerY + (playerRadius * Math.sin(playerLookAngle + playerLookArc)) * 1.4);
    ctx.arc(playerX, playerY, playerRadius * 1.5, playerLookAngle + playerLookArc, playerLookAngle - playerLookArc, true);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    if (isShiftPressed) {
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.fillStyle = 'rgba(223, 223, 223, 0.8)';
        showPowers(0)
        showPowers(Math.PI / 3)
        showPowers(2 * Math.PI / 3)
        showPowers(Math.PI)
        showPowers(4 * Math.PI / 3)
        showPowers(5 * Math.PI / 3)
    }
}

const cameraScale = 1.1;
let cameraX = blockWidth - (5 * blockWidth * (cameraScale - 1)) / 2;
let cameraY = blockHeight * 2 - (3 * blockHeight * (cameraScale - 1)) / 2;

function checkGameOver() {
    if (playerHealth <= 0 || systemHealth <= 20) {
        closeMarket();
        if (isInventory) {
            inventory.style.opacity = '0';
            inventory.style.pointerEvents = 'none';
            inventory.style.transform = "scale(0)";
            isInventory = false;
        }
        result.style.opacity = '1';
        playerScore = Math.floor(playerScore);
        resultText.innerText = `GAME OVER\nPlayer Score : ${playerScore}`;
        result.style.pointerEvents = "auto";
        damage.style.opacity = '0';
        isPlay = false;

        if (playerScore > highScore) {
            localStorage.setItem('highScore', playerScore);
            highScore = playerScore;
        }
        player.innerText = `Player Health : ${Math.ceil(playerHealth)}\nPlayer Score : ${Math.floor(playerScore)}\nHigh Score : ${highScore}`;
        return true;
    }
    return false;
}

function animate() {
    ctx.clearRect(0, 0, world.clientWidth, world.clientHeight);
    cameraCtx.clearRect(0, 0, camera.clientWidth, camera.clientHeight);
    renderedBuildings = [];
    damage.style.opacity = '0';
    drawCity();
    damagedBuilding = [];
    botMove();
    drawBots();
    playerMove();


    bullets.forEach((bullet, idx, bullets) => {
        bullet[2] %= 2 * Math.PI;
        bullet[2] = (bullet[2] < 0) ? bullet[2] + Math.PI * 2 : bullet[2];
        renderedBuildings.some((building, index) => {
            collision = isBulletCollided(building[0], building[1], bullet[0], bullet[1], bullet[2])
            if (collision[0] === 'Y') {
                bullet[2] *= -1;
                bullet[3] -= 1;
                renderedBuildings[index][2] -= ammoDamage;
                damagedBuilding = renderedBuildings[index];
                return true;
            } else if (collision[0] === 'X') {
                bullet[2] = Math.PI - bullet[2];
                bullet[3] -= 1;
                renderedBuildings[index][2] -= ammoDamage;
                damagedBuilding = renderedBuildings[index];
                return true;
            }
        });
        if (!bullet[3]) {
            bullets.splice(idx, 1);
            ammoCapacity++;
        }
        else bullets[idx] = [collision[1] - bulletSpeed / (6 - bullet[3]) * 2 * Math.cos(bullet[2]), collision[2] + bulletSpeed / (6 - bullet[3]) * 2 * Math.sin(bullet[2]), bullet[2], bullet[3]];

    });

    bullets.forEach((bullet, idx) => {
        [bulletX, bulletY] = bullet.slice(0, 2);
        newBulletX = (3 - globalX) * blockWidth + bulletX;
        newBulletY = (3 + globalY - Math.floor(bulletY / blockHeight)) * blockHeight + blockHeight - ((bulletY % blockHeight) + blockHeight) % blockHeight;

        if (3 - globalX + Math.floor(bulletX / blockWidth) < 0 || 3 - globalX + Math.floor(bulletX / blockWidth) > 6 || 3 + globalY - Math.floor(bulletY / blockHeight) < 0 || 3 + globalY - Math.floor(bulletY / blockHeight) > 6) {
            bullets.splice(idx, 1);
            ammoCapacity++;
        }

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(newBulletX, newBulletY, bulletRadius, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
    });

    items.forEach((item, idx, items) => {
        itemButton = Array.from(item.children).reverse()[0];
        if (idx === 4 && ammoCapacity === 20) {
            itemButtonText = "MAXED AMMO";
        }
        else if (idx === 5 && ammoDamage === 3) {
            itemButtonText = "MAXED FIREPOWER";
        }
        else if (itemButton.matches(":hover")) {
            itemButtonText = `BUY FOR ${itemPrices[idx]} SHARDS`;
        } else {
            itemButtonText = `COSTS ${itemPrices[idx]} SHARDS`;
        }
        itemButton.innerText = itemButtonText;
    });

    if (isTracking) {
        requestAnimationFrame(tracker);
        trackAngleCentral = Math.atan2(((3 + globalY - nearestCentral[2] + 0.5) * blockHeight) - playerY, ((nearestCentral[1] - globalX + 3 + 0.5) * blockWidth) - playerX)
        trackAngleBase = Math.atan2(((3 + globalY - nearestBase[2] + 0.5) * blockHeight) - playerY, ((nearestBase[1] - globalX + 3 + 0.5) * blockWidth) - playerX)

        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.moveTo(playerX + Math.cos(trackAngleCentral) * trackArrowDistance, playerY + Math.sin(trackAngleCentral) * trackArrowDistance);
        ctx.lineTo(playerX + Math.cos(trackAngleCentral - Math.PI / 12) * trackArrowDistance * 3 / 5, playerY + Math.sin(trackAngleCentral - Math.PI / 12) * trackArrowDistance * 3 / 5);
        ctx.lineTo(playerX + Math.cos(trackAngleCentral) * trackArrowDistance * 3 / 4, playerY + Math.sin(trackAngleCentral) * trackArrowDistance * 3 / 4);
        ctx.lineTo(playerX + Math.cos(trackAngleCentral + Math.PI / 12) * trackArrowDistance * 3 / 5, playerY + Math.sin(trackAngleCentral + Math.PI / 12) * trackArrowDistance * 3 / 5);
        ctx.lineTo(playerX + Math.cos(trackAngleCentral) * trackArrowDistance, playerY + Math.sin(trackAngleCentral) * trackArrowDistance);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 0, 255, 0.8)";
        ctx.moveTo(playerX + Math.cos(trackAngleBase) * trackArrowDistance, playerY + Math.sin(trackAngleBase) * trackArrowDistance);
        ctx.lineTo(playerX + Math.cos(trackAngleBase - Math.PI / 12) * trackArrowDistance * 3 / 5, playerY + Math.sin(trackAngleBase - Math.PI / 12) * trackArrowDistance * 3 / 5);
        ctx.lineTo(playerX + Math.cos(trackAngleBase) * trackArrowDistance * 3 / 4, playerY + Math.sin(trackAngleBase) * trackArrowDistance * 3 / 4);
        ctx.lineTo(playerX + Math.cos(trackAngleBase + Math.PI / 12) * trackArrowDistance * 3 / 5, playerY + Math.sin(trackAngleBase + Math.PI / 12) * trackArrowDistance * 3 / 5);
        ctx.lineTo(playerX + Math.cos(trackAngleBase) * trackArrowDistance, playerY + Math.sin(trackAngleBase) * trackArrowDistance);
        ctx.fill();
        ctx.closePath();
    }

    owned.forEach((owns, idx) => {
        if (inventoryItems[idx] < 10) owns.innerHTML = `OWNED : &nbsp&nbsp&nbsp${inventoryItems[idx]}&nbsp`
        else owns.innerHTML = `OWNED : ${inventoryItems[idx]}&nbsp`
    });


    details.innerText = `System Health : ${systemHealth}\nKeys : ${playerKeys}\nShards : ${playerShards}`;
    player.innerText = `Player Health : ${Math.ceil(playerHealth)}\nPlayer Score : ${Math.floor(playerScore)}\nHigh Score : ${highScore}`;
    checkGameOver();

    cameraCtx.drawImage(
        world,
        cameraX, cameraY,
        world.width * 5 / 7 * cameraScale, world.height * 3 / 7 * cameraScale,
        0, 0,
        window.innerWidth, window.innerHeight);
    if (isPlay) requestAnimationFrame(animate);
}

function closeMarket() {

    items.forEach((item) => {
        item.style.transform = "scale(0)"
    })

    marketPlace.style.opacity = '0';
    marketPlace.style.width = '0';
    marketPlace.style.height = '0';
    marketPlace.style.top = "50vh";
    marketPlace.style.left = "50vw";
    marketPlace.style.pointerEvents = "none";

    isMarket = false
}

requestAnimationFrame(animate);
let decreaseTimer = 5000;
function decreaseHealth() {
    if (systemHealth > 0 && isPlay && !isStart && !isHackMode) {
        systemHealth -= 1;
        decreaseTimer = Math.max(500, 5000 - 9 * timeElapsed);
    }
    setTimeout(decreaseHealth, decreaseTimer);
}

setTimeout(decreaseHealth, decreaseTimer);

setInterval(() => {
    if (isPlay && !isStart && !isHackMode) {
        playerScore += 0.5;
        timeElapsed += 1;
    }
    botGenerateTimer = Math.max(3, 8 - Math.floor(timeElapsed / 120));

    if (isInvisible) {
        isInvisible--;
    }

    if (isMagnet) {
        isMagnet--;
    }

    if (isTracking) {
        isTracking--;
    }
}, 1000)

let factoryX, factoryY, botGenerate
setInterval(() => {
    if (isPlay && !isStart) {
        for (let col = 0; col < nColumns; col++) {
            for (let row = 0; row < nRows; row++) {
                factoryX = globalX + col - 3;
                factoryY = globalY - row + 3;
                if (botFactories.has(`${factoryX}, ${factoryY}`)) {
                    lastBotProduced = botFactories.get(`${factoryX}, ${factoryY}`)
                    if (lastBotProduced > botGenerateTimer - 1) {

                        botFactories.set(`${factoryX}, ${factoryY}`, 0);
                        factoryX *= blockWidth;
                        factoryY *= blockHeight;

                        botGenerate = Math.floor(blockWidth * 4 * Math.random())
                        if (botGenerate < blockWidth) {
                            bots.push([factoryX + botGenerate, factoryY, factoryX + blockWidth, factoryY]);
                        } else if (botGenerate < blockWidth * 2) {
                            bots.push([factoryX + blockWidth, factoryY - botGenerate + blockHeight, factoryX + blockWidth, factoryY - blockHeight]);
                        } else if (botGenerate > blockWidth * 3) {
                            bots.push([factoryX - botGenerate + 4 * blockWidth, factoryY - blockHeight, factoryX, factoryY - blockHeight]);
                        } else {
                            bots.push([factoryX, factoryY + botGenerate - 3 * blockHeight, factoryX, factoryY]);
                        }

                    } else {
                        botFactories.set(`${factoryX}, ${factoryY}`, lastBotProduced + 1);
                    }
                }
            }
        }
    }
}, 1000);

let isEMPBlast = 0;
let isMagnet = 0;
let isTracking = 0;
let isInventory = false;


let distance, worldData, trackAngleCentral, trackAngleBase, nearestCentral, nearestBase;
const trackArrowDistance = 4.5 * remInPx;
function tracker() {
    if (isTracking) {
        nearestCentral = [16 * blockWidth, 0, 0];
        nearestBase = [16 * blockWidth, 0, 0];
        for (let column = 0; column < nColumns; column++) {
            for (let row = 0; row < nRows; row++) {
                worldData = global.get(`${globalX + column - 3}, ${globalY - row + 3}`)
                distance = Math.sqrt((column * blockWidth - playerX) ** 2 + (row * blockHeight - playerY) ** 2)
                if (worldData.type === 'central' && distance < nearestCentral[0]) {
                    nearestCentral[0] = distance;
                    nearestCentral[1] = globalX + column - 3;
                    nearestCentral[2] = globalY - row + 3;
                } else if (worldData.type === 'base' && distance < nearestBase[0]) {
                    nearestBase[0] = distance;
                    nearestBase[1] = globalX + column - 3;
                    nearestBase[2] = globalY - row + 3;
                }
            }
        }
        requestAnimationFrame(tracker)
    }
}

let inventoryItems = [0, 0, 0, 0, 0, 0]
function getItems(idx) {
    if (isPlay && !isStart) {
        if (idx < 4) {
            inventoryItems[idx] += 1;
        } else if (idx === 4) {
            ammoCapacity += 5;
            if (!isHackMode) {
                itemPrices[4] += 10;
            }
        } else if (idx === 5) {
            ammoDamage += 1;
            if (!isHackMode) {
                itemPrices[5] += 10;
            }
        }
    }
}

function usePowerup(idx) {
    if (isPlay && !isStart) {
        if (idx === 0) {
            nearestCentral = [16 * blockWidth, 0, 0];
            nearestBase = [16 * blockWidth, 0, 0];
            isTracking = 60;
        }
        else if (idx === 1) {
            playerHealth += 20;
        } else if (idx === 2) {
            isMagnet = 15;
        }
        else if (idx === 3) {
            isEMPBlast = 25;
            bots = [];
        }
    }
}

setInterval(() => {
    if (isSafe) {
        message.style.opacity = '1';
    } else {
        if (isMarket) {
            closeMarket();
        }
        message.style.opacity = '0';
    }

    if (isEMPBlast > 0) {
        isEMPBlast -= 0.02;
    }
    else {
        isEMPBlast = 0;
    }

    if (isEMPBlast < 3) {
        damageOpacity = Math.acos(Math.cos(6 * isEMPBlast - Math.PI)) * 0.4 / Math.PI;
    }
    else if(isEMPBlast > 22) {
        damageOpacity = Math.acos(Math.cos(6 * isEMPBlast)) * 0.4 / Math.PI;
    }
    else {
        damageOpacity = 0
    }
},20)

items.forEach((item, idx) => {
    itemButton = Array.from(item.children).reverse()[0];
    itemButton.addEventListener('click', () => {
        if (idx === 4 && ammoCapacity === 20) {}
        else if (idx === 5 && ammoDamage === 3) {}
        else if (playerShards >= itemPrices[idx]) {
            playerShards -= itemPrices[idx];
            getItems(idx);
        }
    })
})

function Pause() {
    menuScreen.style.opacity = '1';
    menuScreen.style.pointerEvents = 'auto';
    isPlay = false;
}

function Resume() {
    menuScreen.style.opacity = '0';
    menuScreen.style.pointerEvents = 'none';
    isPlay = true;
    requestAnimationFrame(animate);
}

function Restart() {
    chunksVisited.clear();
    botFactories.clear();
    chunksVisited.add('0, 0');

    global.clear();
    createBaseChunk();

    playerKeys = 0;
    playerShards = 0;
    playerHealth = 50;
    playerScore = 0;
    systemHealth = 200;
    isEMPBlast = 0;
    isInvisible = 0;
    isMagnet = 0;
    isTracking = 0;
    decreaseTimer = 5000;
    timeElapsed = 0;
    botGenerateTimer = 8;
    playerLookAngle = 3 * Math.PI / 2

    playerX = initialPlayerX;
    playerY = initialPlayerY;
    globalX = 0;
    globalY = 0;
    cameraX = blockWidth - (5 * blockWidth * (cameraScale - 1)) / 2;
    cameraY = blockHeight * 2 - (3 * blockHeight * (cameraScale - 1)) / 2;
    bots = [];
    damagedBuilding = [];
    ammoCapacity = 10;
    ammoDamage = 1;
    isInventory = false;
    isShiftPressed = false;
    inventoryItems = [0, 0, 0, 0, 0, 0]

    if (!isHackMode) {
        itemPrices = [3, 5, 7, 10, 10, 15, 0, 0]
    } else {
        itemPrices = [0, 0, 0, 0, 0, 0, 0, 0]
    }

}

pause.addEventListener("click", () => {
    if (!isStart) Pause();
    pause.blur();
})

resume.addEventListener("click", () => {
    Resume();
    resume.blur();
})

// Shoot
let bullets = [];
const bulletSpeed = 0.8 * remInPx;
let ammoCapacity = 10;
let ammoDamage = 1;
let bulletX, bulletY, bulletRadius = 0.4 * remInPx;
let newBulletX, newBulletY;
window.addEventListener("keydown", (event) => {
    if (event.code === "Space" && isPlay && !isStart) {
        if (ammoCapacity) {
            bullets.push([globalPlayerX * blockWidth + playerX % blockWidth, globalPlayerY * blockHeight + blockHeight - playerY % blockHeight, playerLookAngle + Math.PI, 5]);
            ammoCapacity--;
        }
    }
    else if (event.key === "Escape" && !isPlay && !isStart && isPreferences) {
        preferences.style.opacity = '0';
        preferences.style.pointerEvents = 'none';
        menuScreen.style.opacity = '1';
        menuScreen.style.pointerEvents = 'auto';
        isPreferences = false
    }
    else if (event.key === 'Escape' && isPlay && !isStart) {
        Pause();
        if (isMarket) {
            closeMarket();
        }
        if (isInventory) {
            inventory.style.opacity = '0';
            inventory.style.pointerEvents = 'none';
            inventory.style.transform = "scale(0)";
            isInventory = false;
        }
    } else if (event.key === 'Escape' && !isStart && (parseInt(howToPlay.style.opacity))) {
        howToPlay.style.opacity = '0';
        howToPlay.style.pointerEvents = 'none';
        menuScreen.style.opacity = '1';
        menuScreen.style.pointerEvents = 'auto';
    }
    else if (event.key === 'Escape' && !isStart && !(parseInt(howToPlay.style.opacity))) {
        Resume();
    } else if (event.code === "Space" && isStart && isPlay) {
        isStart = false;
        home.style.opacity = '0';
        home.style.pointerEvents = 'none';
    } else if (event.code === "Space" && !isPlay && checkGameOver()) {
        Restart();
        result.style.opacity = '0';
        result.style.pointerEvents = 'none';
        isPlay = true;
        requestAnimationFrame(animate);
    } else if (event.key.toLowerCase() === 'm' && !isMarket && isSafe && !isStart && isPlay && !isInventory) {
        marketPlace.style.opacity = '1';
        marketPlace.style.width = '70vw';
        marketPlace.style.height = '70vh';
        marketPlace.style.top = "15vh";
        marketPlace.style.left = "15vw";
        marketPlace.style.pointerEvents = "auto";

        items.forEach((item) => {
            item.style.transform = "scale(1)"
        })

        isMarket = true;
    } else if (event.key.toLowerCase() === 'm' && isMarket) {
        closeMarket();
    } else if (event.key.toLowerCase() === 'i' && !isInventory && !isMarket && isPlay && !isStart) {
        inventory.style.opacity = '1';
        inventory.style.pointerEvents = 'auto';
        inventory.style.transform = 'scale(1)'
        isInventory = true;
    } else if (event.key.toLowerCase() === 'i' && isInventory) {
        inventory.style.opacity = '0';
        inventory.style.pointerEvents = 'none';
        inventory.style.transform = "scale(0)";
        isInventory = false;
    }

    if (isShiftPressed) {
        let invPower = -1;
        if (event.key === "!") invPower = 0
        else if (event.key === "@") invPower = 1
        else if (event.key === "#") invPower = 2
        else if (event.key === "$") invPower = 3
        if (invPower !== -1 && inventoryItems[invPower] > 0) {
            inventoryItems[invPower] -= 1;
            usePowerup(invPower);
        }
    }
})

use.forEach((use, idx) => {
    use.addEventListener('click', () => {
        if (inventoryItems[idx]) {
            inventoryItems[idx] -= 1;
            usePowerup(idx);
        }
        use.blur();
    })
});

mainMenu.addEventListener("click", () => {
    if (!isPlay) {
        sure.innerText = "Are you sure you want to quit?"
        confirmation.style.pointerEvents = 'auto';
        confirmation.style.opacity = '1';
        confirmation.style.zIndex = '5';
        menuScreen.style.opacity = '0.5';
        menuScreen.style.pointerEvents = 'none';
        isRestart = false;
    }
    mainMenu.blur();
})

instructions.addEventListener("click", () => {
    howToPlay.style.opacity = '1';
    howToPlay.style.pointerEvents = 'auto';
    menuScreen.style.opacity = '0';
    menuScreen.style.pointerEvents = 'none';
    instructions.blur();
})

start.addEventListener("click", () => {
    isStart = false;
    home.style.opacity = '0';
    home.style.pointerEvents = 'none';
    start.blur();
})
restart.addEventListener("click", () => {
    sure.innerText = "Are you sure you want to Restart?"
    confirmation.style.pointerEvents = 'auto';
    confirmation.style.opacity = '1';
    confirmation.style.zIndex = '5';
    menuScreen.style.opacity = '0.5';
    menuScreen.style.pointerEvents = 'none';
    isRestart = true;
    restart.blur();
})
retry.addEventListener("click", () => {
    Restart();
    result.style.opacity = '0';
    result.style.pointerEvents = 'none';
    isPlay = true;
    requestAnimationFrame(animate);
    retry.blur();
})

yes.addEventListener("click", () => {
    if (isHack && isRestart && !isHackMode) {
        hackMode.innerText = "DEACTIVATE HACK MODE";
        hackMode.style.width = '70%';
        hackMode.style.left = "15%";
        isHackMode = true;
        isHack = false;
        preferences.style.opacity = '0';
    } else if (isHack && isRestart) {
        hackMode.innerText = "INITIATE HACK MODE";
        hackMode.style.width = '60%';
        hackMode.style.left = "20%";
        isHackMode = false;
        isHack = false;
        preferences.style.opacity = '0';
    }

    if (isRestart) {
        Restart();
        confirmation.style.pointerEvents = 'none';
        confirmation.style.opacity = '0';
        confirmation.style.zIndex = '0';
        menuScreen.style.opacity = '0';
        isPlay = true;
        isRestart = null;
        requestAnimationFrame(animate);
    }
    else if (isRestart === false) {
        confirmation.style.pointerEvents = 'none';
        confirmation.style.opacity = '0';
        confirmation.style.zIndex = '0';
        menuScreen.style.opacity = '0';
        isStart = true;
        isPlay = true;
        home.style.opacity = '1';
        home.style.pointerEvents = 'auto';
        isRestart = null;
        Restart();
        requestAnimationFrame(animate);
    }

    if (isReset) {
        localStorage.setItem('highScore', '0');
        highScore = 0;
        player.innerText = `Player Health : ${Math.ceil(playerHealth)}\nPlayer Score : ${Math.floor(playerScore)}\nHigh Score : ${highScore}`;
        confirmation.style.pointerEvents = 'none';
        confirmation.style.opacity = '0';
        confirmation.style.zIndex = '0';
        preferences.style.opacity = '1';
        preferences.style.pointerEvents = 'auto';
        isReset = false;
    }

    yes.blur();
})

no.addEventListener("click", () => {
    if (isReset && !isHack) {
        confirmation.style.pointerEvents = 'none';
        confirmation.style.opacity = '0';
        confirmation.style.zIndex = '0';
        preferences.style.opacity = '1';
        preferences.style.pointerEvents = 'auto';
    } else if (!isHack) {
        confirmation.style.pointerEvents = 'none';
        confirmation.style.opacity = '0';
        confirmation.style.zIndex = '0';
        menuScreen.style.opacity = '1';
        menuScreen.style.pointerEvents = 'auto';
        isPlay = false;
        isRestart = null;
        isReset = false;
        no.blur();
    }

    else if (isHack && isRestart) {
        isHack = false;
        confirmation.style.pointerEvents = 'none';
        confirmation.style.opacity = '0';
        confirmation.style.zIndex = '0';
        preferences.style.opacity = '1';
        preferences.style.pointerEvents = 'auto';
    }
});

let isPreferences = false;
prefs.addEventListener("click", () => {
    preferences.style.opacity = '1';
    preferences.style.pointerEvents = 'auto';
    menuScreen.style.opacity = '0.5';
    menuScreen.style.pointerEvents = 'none';
    isPreferences = true;
    prefs.blur();
})

let isReset = false;
resetScore.addEventListener("click", () => {
    sure.innerText = "Are you sure you want to Reset your Score?";
    sure.style.fontSize = '1.4rem';
    confirmation.style.pointerEvents = 'auto';
    confirmation.style.opacity = '1';
    confirmation.style.zIndex = '6';
    preferences.style.opacity = '0.5';
    preferences.style.pointerEvents = 'none';
    resetScore.blur();
    isReset = true;
})

let isHackMode = false;
let isHack = null;
hackMode.addEventListener("click", () => {
    sure.innerText = "Are you sure you want to Restart?"
    confirmation.style.pointerEvents = 'auto';
    confirmation.style.opacity = '1';
    confirmation.style.zIndex = '6';
    preferences.style.opacity = '0.5';
    preferences.style.pointerEvents = 'none';
    isRestart = true;
    isHack = true;
    hackMode.blur();
})