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
const pause = document.querySelector("#pause");
const menuScreen = document.querySelector("#menuScreen");
const resume = document.querySelector("#resume");
const restart = document.querySelector("#restart");
const damage = document.querySelector("#damage");

// World Variables
let isPlay = true;
let timeElapsed = 0;
const nColumns = 7;
const nRows = 7;
const blockWidth = world.width / nColumns;
const blockHeight = world.height / nRows;
let playerKeys = 0;
let playerShards = 0;
let playerHealth = 50;
let playerScore = 0;
let playerAngle, nearestX, nearestY, distX, distY;

if (localStorage.getItem('highScore') !== null) {
    highScore = parseInt(localStorage.getItem("highScore"));
} else {
    highScore = 0;
}

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

// Shooter
let shooterX, shooterY, shooterBuilding, shooterAngle;
let shooterRadius = buildingWidth / 8;
const shooterRange = buildingWidth * 2.2;
const shooterArc = Math.PI * 7 / 36;
const shooterSpeed = Math.PI / 350;

// Key
const keysToShards = 4;
let keyX, keyY, nKeys, newKeyX, newKeyY;
let keyRadius = buildingWidth / 12;
let keys = [];
let blockKeys = [];
let systemHealth = 200;

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

const blockTypes = ['central', 'base', 'factory', 'safe']
const global = new Map();
let blockData, globalBlockX, globalBlockY, blockX, blockY, isSafe;

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
                keys: createKeys()
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

        global.set(`${blockX}, ${blockY}`, {
            type: shuffledBlockType,
            buildings: [],
            shooter: [0, 0, 0],
            keys: createKeys()
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
        if ((shuffledBlockType === 'central' || shuffledBlockType === 'factory')) {
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


        global.set(`${blockX}, ${blockY}`, {
            type : shuffledBlockType,
            buildings: [],
            shooter: [0, 0, 0],
            keys: createKeys()
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
        buildings.push([buildingX, buildingY, 3]);
    }

    // Shooter
    shooterBuilding = buildings[0];
    shooterX = shooterBuilding[0] + shooterRadius + Math.random() * (buildingWidth - 2 * shooterRadius);
    shooterY = shooterBuilding[1] + shooterRadius + Math.random() * (buildingHeight - 2 * shooterRadius);

    global.set(`${globalX}, ${globalY}`, {
        type : 'regular',
        buildings : buildings,
        shooter: [shooterX, shooterY, Math.random() * Math.PI * 2],
        keys : createKeys()
    });

}

function checkIfKeyCollected(keyX, keyY) {
    if ((keyRadius + playerRadius) ** 2 >= (playerX - keyX) ** 2 + (playerY - keyY) ** 2) {
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
            playerScore += 30;
        }
    }
}

function shardsToHealth(rectX, rectY) {
    if (playerX > rectX - playerRadius && playerX < rectX + rectWidth + playerRadius &&
        playerY > rectY - playerRadius && playerY < rectY + rectHeight + playerRadius) {
        if (playerShards) {
            playerShards--;
            systemHealth += 20;
            playerScore += 50;
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
    }

    if (!global.has(`${globalBlockX}, ${globalBlockY}`)) {
        createBlock(globalBlockX, globalBlockY)
    }

    blockData = global.get(`${globalBlockX}, ${globalBlockY}`);

    if (blockData.type === 'regular') {
        ctx.fillStyle = 'rgb(57, 255, 20)';
    }
    else if (blockData.type === 'central') {
        createShards(worldX * blockWidth + rectX, worldY * blockHeight + rectY);
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
        shardsToHealth(worldX * blockWidth + rectX, worldY * blockHeight + rectY)
        ctx.fillStyle = '#0088FF';
    }

    ctx.strokeStyle = "white"
    ctx.lineWidth = 0.2 * remInPx;
    ctx.fillRect(worldX * blockWidth + rectX, worldY * blockHeight + rectY, rectWidth, rectHeight);
    ctx.strokeRect(worldX * blockWidth + rectX, worldY * blockHeight + rectY, rectWidth, rectHeight);

    blockBuildings = blockData.buildings;
    ctx.fillStyle = 'black';
    for (let building = 0; building < blockBuildings.length; building++) {
        buildingX = worldX * blockWidth + blockBuildings[building][0];
        buildingY = worldY * blockHeight + blockBuildings[building][1];
        ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
        renderedBuildings.push([buildingX, buildingY]);
    }

    blockKeys = blockData.keys;
    blockKeys.forEach(([keyX, keyY]) => {
        newKeyX = worldX * blockWidth + keyX;
        newKeyY = worldY * blockHeight + keyY;

        if (checkIfKeyCollected(newKeyX, newKeyY)) {
            blockKeys = blockKeys.filter(([x, y]) => !(x === keyX && y === keyY));
            global.set(`${globalBlockX}, ${globalBlockY}`, {
                type: blockData.type,
                buildings: blockBuildings,
                keys: blockKeys,
                shooter: blockData.shooter
            });
            playerKeys++;
            playerScore += 5;
        }
    });
    ctx.fillStyle = '#FF1493';
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
    ctx.strokeStyle = "rgb(255, 36, 36)";
    ctx.fillStyle = 'rgba(255, 36, 36, 0.4)';
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

    if ((playerX - shooterX) ** 2 + (playerY - shooterY) ** 2 <= (playerRadius + shooterRange) ** 2 && blockData.type !== 'safe'
    && playerHealth > 0) {
        playerAngle = Math.atan2(playerY - shooterY, playerX - shooterX);
        shooterAngle = shooterAngle % (Math.PI * 2);
        shooterAngle = (shooterAngle > Math.PI) ? shooterAngle - 2 * Math.PI : shooterAngle;
        playerAngle = (playerAngle > Math.PI) ? playerAngle - 2 * Math.PI : playerAngle;
        if (playerAngle > shooterAngle - shooterArc &&
        playerAngle < shooterAngle + shooterArc && !isSafe) {
            playerHealth -= 0.5;
            damage.style.opacity = '1';
        } else {
        }
    } else {
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

    chunkX = Math.floor((globalX + 7) / chunkSize);
    chunkY = Math.floor((globalY + 6) / chunkSize);

    if (!chunksVisited.has(`${chunkX}, ${chunkY}`)) {
        createChunk(chunkX, chunkY);
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

    if (playerHealth > 0) {
        // Player +X
        if (!isCollidedRX) {
            if (keysPressed['a']) playerX -= playerSpeed;
            if (playerX > initialPlayerX + blockWidth * 3 / 4 || playerX < initialPlayerX - blockWidth * 3 / 4) {
                if (keysPressed['a']) cameraX -= playerSpeed;
            }
        }
        // Player -X
        if (!isCollidedLX) {
            if (keysPressed['d']) playerX += playerSpeed;
            if (playerX > initialPlayerX + blockWidth * 3 / 4 || playerX < initialPlayerX - blockWidth * 3 / 4) {
                if (keysPressed['d']) cameraX += playerSpeed;
            }
        }

        // Player +Y
        if (!isCollidedUY) {
            if (keysPressed['w']) playerY -= playerSpeed;
            if (playerY > initialPlayerY + blockHeight * 3 / 4 || playerY < initialPlayerY - blockHeight * 3 / 4) {
                if (keysPressed['w']) cameraY -= playerSpeed;
            }
        }


        // Camera
        if (!isCollidedDY) {
            if (keysPressed['s']) playerY += playerSpeed;
            if (playerY > initialPlayerY + blockHeight * 3 / 4 || playerY < initialPlayerY - blockHeight * 3 / 4) {
                if (keysPressed['s']) cameraY += playerSpeed;
            }
        }
    }

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.fillStyle = 'white';
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

const cameraScale = 1;
let cameraX = blockWidth - (5 * blockWidth * (cameraScale - 1)) / 2;
let cameraY = blockHeight * 2 - (3 * blockHeight * (cameraScale - 1)) / 2;

function checkGameOver() {
    if (playerHealth <= 0 || systemHealth <= 20) {
        playerHealth = 0;
        result.style.opacity = '1';
        result.innerText = `GAME OVER\nPlayer Score : ${playerScore}`;
        clearInterval(playerScoreIncrease);
        damage.style.opacity = '0';
        isPlay = false;

        if (playerScore > highScore) {
            localStorage.setItem('highScore', playerScore);
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, world.clientWidth, world.clientHeight);
    cameraCtx.clearRect(0, 0, camera.clientWidth, camera.clientHeight);
    renderedBuildings = [];
    damage.style.opacity = '0';
    drawCity();
    playerMove();

    details.innerText = `System Health : ${systemHealth}\nKeys : ${playerKeys}\nShards : ${playerShards}`;
    player.innerText = `Player Health : ${Math.floor(playerHealth)}\nPlayer Score : ${playerScore}\nHigh Score : ${highScore}`;
    checkGameOver();

    cameraCtx.drawImage(
        world,
        cameraX, cameraY,
        world.width * 5 / 7 * cameraScale, world.height * 3 / 7 * cameraScale,
        0, 0,
        window.innerWidth, window.innerHeight);
    if (isPlay) requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

let decreaseTimer = 1500;
function decreaseHealth() {
    systemHealth -= 2;
    decreaseTimer = Math.max(750, 1500 - timeElapsed);

    if (systemHealth > 0) {
        setTimeout(decreaseHealth, decreaseTimer);
    }
}

setTimeout(decreaseHealth, decreaseTimer);

const playerScoreIncrease = setInterval(() => {
    playerScore++;
    timeElapsed += 1;
}, 1000)

function Pause() {
    menuScreen.style.opacity = '1';
    menuScreen.style.pointerEvents = 'auto';
    isPlay = false
}

function Resume() {
    menuScreen.style.opacity = '0';
    menuScreen.style.pointerEvents = 'none';
    isPlay = true;
    requestAnimationFrame(animate);
}

pause.addEventListener("click", () => {
    Pause()
})

resume.addEventListener("click", () => {
    Resume()
})

window.addEventListener("keydown", (event) => {
    if (event.key === 'Escape' && isPlay) {
        Pause();
    } else if (event.key === 'Escape') {
        Resume();
    }
})

restart.addEventListener("click", () => {
    if (confirm("Are you sure you want to restart the game?")) {
        chunksVisited.clear();
        chunksVisited.add('0, 0');

        global.clear();
        createBaseChunk();

        playerKeys = 0;
        playerShards = 0;
        playerHealth = 50;
        playerScore = 0;
        systemHealth = 200;

        playerX = initialPlayerX;
        playerY = initialPlayerY;
        globalX = 0;
        globalY = 0;
        cameraX = blockWidth;
        cameraY = blockHeight * 2;

        menuScreen.style.opacity = '0';
        menuScreen.style.pointerEvents = 'none';
        isPlay = true;
        requestAnimationFrame(animate);
    }
})