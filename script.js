// DOM
const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
const world = document.getElementById("world");
const ctx = world.getContext("2d");

world.width = world.clientWidth;
world.height = world.clientHeight;

ctx.strokeStyle = "limegreen";
ctx.lineWidth = 0.15 * remInPx;

const blockWidth = world.width / 5;
const blockHeight = world.height / 16;

for (let col = 0; col < 5; col++) {
    ctx.beginPath();
    ctx.moveTo(col * blockWidth, 0);
    ctx.lineTo(col * blockWidth, world.height);
    ctx.stroke();
    ctx.closePath();
}

for (let row = 0; row < 16; row++) {
    ctx.beginPath();
    ctx.moveTo(0, row * blockHeight);
    ctx.lineTo(world.width, row * blockHeight);
    ctx.stroke();
    ctx.closePath();
}

let rectX, rectY;
const rectWidth = blockWidth * 4 / 5;
const rectHeight = blockHeight * 4 / 5;

let buildingX, buildingY, nBuildings, shooterBuilding, shooterX, shooterY, shooterAngle;

const buildingWidth = rectWidth / 3;
const buildingHeight = rectHeight / 3;
let blockBuildings = [];
let buildings = [];
let shooters = [];
let shooterBuildings = [];
let shooterRadius = 0.5 * remInPx;
const shooterRange = 12 * remInPx;

let nKeys, keyX, keyY;
let keys = [];
const keyRadius = 0.5 * remInPx;

// Buildings, Grass and Keys
for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 16; row++) {

        rectX = col * world.width / 5 + (rectWidth / 8);
        rectY = row * world.height / 16 + (rectHeight / 8);

        // Grass
        ctx.beginPath();
        ctx.fillStyle = "limegreen";
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        ctx.closePath();

        blockBuildings = [];

        // Buildings
        nBuildings = Math.round(2 + Math.random());
        for (let building = 0; building < nBuildings; building++) {
            buildingX = rectX + Math.random() * rectWidth * 2 / 3;
            buildingY = rectY + Math.random() * rectHeight * 2 / 3;

            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.fillRect(buildingX, buildingY, buildingWidth, buildingHeight);
            ctx.closePath();

            buildings.push([buildingX, buildingY]);
            blockBuildings.push([buildingX, buildingY]);
        }

        shooterBuilding = blockBuildings[Math.floor(Math.random() * blockBuildings.length)];
        shooterBuildings.push(shooterBuilding);

        let [shooterBuildingX, shooterBuildingY] = shooterBuilding;
        shooterX = shooterBuildingX + shooterRadius + Math.random() * (buildingWidth - 2 * shooterRadius);
        shooterY = shooterBuildingY + shooterRadius + Math.random() * (buildingHeight - 2 * shooterRadius);

        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(shooterX, shooterY, shooterRadius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

        shooters.push([shooterX, shooterY, Math.random() * Math.PI * 2]);

        nKeys = 2 + Math.random() * 3;
        for (let key = 0; key < nKeys; key++) {

            let keyX = rectX + Math.random() * rectWidth;
            let keyY = rectY + Math.random() * rectHeight;
            keys.push([keyX, keyY])
        }

    }
}

// Game
const game = document.getElementById("game");
context = game.getContext("2d");

game.width = world.clientWidth;
game.height = world.clientHeight;

const playerRadius = 1.2 * remInPx;
const playerSpeed = 0.6 * remInPx;
let playerX = playerRadius;
let playerY = playerRadius;

// Animation
function animate() {
    context.clearRect(0, 0, world.clientWidth, world.clientHeight);

    // Player
    context.beginPath();
    context.fillStyle = "blue";
    context.arc(playerX, playerY, playerRadius, 0, Math.PI * 2, false);
    context.fill();
    context.closePath();

    window.addEventListener("keydown", (event) => {
        if (event.key === "s") {
            playerY += playerSpeed;
        } else if (event.key === "w") {
            playerY -= playerSpeed;
        } else if (event.key === "d") {
            playerX += playerSpeed;
        } else if (event.key === "a") {
            playerX -= playerSpeed;
        }
    });

    // Shooters
    shooters.forEach((shooter, idx, shooters) => {

        let [newShooterX, newShooterY, shooterAngle] = shooter;
        context.strokeStyle = "red";
        context.fillStyle = "rgba(255, 0, 0, 0.3)"

        context.beginPath();
        context.moveTo(newShooterX, newShooterY);
        context.arc(newShooterX, newShooterY, shooterRange, shooterAngle, shooterAngle + (Math.PI * 9 / 16), false);
        context.lineTo(newShooterX, newShooterY);
        context.fill();
        context.stroke();
        context.closePath()

        shooters[idx] = [newShooterX, newShooterY, shooterAngle + (Math.PI / 50)];

    });

    // Keys
    keys.forEach((key) => {

        [keyX, keyY] = key

        context.beginPath();
        context.fillStyle = "yellow";
        context.arc(keyX, keyY, keyRadius, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();

    })

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);


