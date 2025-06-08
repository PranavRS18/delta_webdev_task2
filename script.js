// DOM
const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
const world = document.querySelector("#world")
const worldCtx = world.getContext("2d");

const city = document.querySelector("#city");
const cityCtx = city.getContext("2d");

const camera = document.querySelector("#camera");
const cameraCtx = camera.getContext("2d");

world.width = world.clientWidth;
world.height = world.clientHeight;

city.width = world.clientWidth;
city.height = world.clientHeight;

camera.width = window.innerWidth;
camera.height = window.innerHeight;

let [cameraX, cameraY] = [world.getBoundingClientRect().left, world.getBoundingClientRect().top];

const nColumns = 11;
const nRows = 11;
const blockWidth = world.width / nColumns;
const blockHeight = world.height / nRows;

for (let col = 0; col < nColumns; col++) {
    worldCtx.beginPath();
    worldCtx.strokeStyle = "limegreen";
    worldCtx.lineWidth = 0.075 * remInPx;
    worldCtx.moveTo(col * blockWidth, 0);
    worldCtx.lineTo(col * blockWidth, world.height);
    worldCtx.stroke();
    worldCtx.closePath();
}

for (let row = 0; row < nRows; row++) {
    worldCtx.beginPath();
    worldCtx.strokeStyle = "limegreen";
    worldCtx.lineWidth = 0.075 * remInPx;
    worldCtx.moveTo(0, row * blockHeight);
    worldCtx.lineTo(world.width, row * blockHeight);
    worldCtx.stroke();
    worldCtx.closePath();
}

let rectX, rectY;
const rectWidth = blockWidth * 4 / 5;
const rectHeight = blockHeight * 4 / 5;

let buildingX, buildingY, nBuildings;
const buildingWidth = rectWidth / 3;
const buildingHeight = rectHeight / 3;
let buildings = [];

let shooterX, shooterY, shooterBuilding;
let shooterRadius = buildingWidth / 15;
let shooters = [];
const shooterRange = shooterRadius * 24;
const shooterArc = Math.PI * 9 / 32;

let keyX, keyY, nKeys;
let keyRadius = buildingWidth / 15;
let keys = [];

// Buildings, Grass and Keys
for (let col = 0; col < nColumns; col++) {
    for (let row = 0; row < nRows; row++) {
        rectX = blockWidth * (col + 1 / 10) ;
        rectY = blockHeight * (row + 1 / 10) ;

        worldCtx.beginPath();
        worldCtx.fillStyle = "limegreen";
        worldCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
        worldCtx.closePath();

        let blockBuildings = [];
        nBuildings = 2 + Math.floor(Math.random() * 2);

        for(let building = 0; building < nBuildings; building++) {
            buildingX = rectX + Math.floor(Math.random() * (rectWidth - buildingWidth));
            buildingY = rectY + Math.floor(Math.random() * (rectHeight - buildingHeight));
            blockBuildings.push([buildingX, buildingY]);
            buildings.push([buildingX, buildingY]);
        }

        shooterBuilding = blockBuildings[Math.floor(Math.random() * blockBuildings.length)];
        let [shooterBuildingX, shooterBuildingY] = shooterBuilding;

        shooterX = shooterBuildingX + Math.floor(Math.random() * (buildingWidth - shooterRadius));
        shooterY = shooterBuildingY + Math.floor(Math.random() * (buildingHeight - shooterRadius));
        shooters.push([shooterX, shooterY, Math.random() * Math.PI * 2]);

        nKeys = 3 + Math.random() * 3;

        for (let key = 0; key < nKeys; key++) {
            keyX = (col * blockWidth) + Math.floor(Math.random() * blockWidth);
            keyY = (row * blockHeight) + Math.floor(Math.random() * blockHeight);
            keys.push([keyX, keyY]);
        }
    }
}

// Draw Buildings, Keys and Shooters
function drawCanvas() {
    buildings.forEach(building => {
        let [buildingNewX, buildingNewY] = building;
        cityCtx.beginPath();
        cityCtx.fillStyle = "black";
        cityCtx.fillRect(buildingNewX, buildingNewY, buildingWidth, buildingHeight);
        cityCtx.closePath();

    })

    shooters.forEach(shooter => {
        let [shooterNewX, shooterNewY] = shooter;

        cityCtx.beginPath();
        cityCtx.fillStyle = "red";
        cityCtx.arc(shooterNewX, shooterNewY, shooterRadius, 0, Math.PI * 2, false);
        cityCtx.fill();
        cityCtx.closePath();
    })

    keys.forEach(key => {
        let [keyNewX, keyNewY] = key;

        cityCtx.beginPath();
        cityCtx.fillStyle = "yellow";
        cityCtx.arc(keyNewX, keyNewY, keyRadius, 0, Math.PI * 2, false);
        cityCtx.fill();
        cityCtx.closePath();
    })
}
function onCamera() {

    const cameraWidth = camera.width / 5 * 2;
    const cameraHeight = camera.height / 5 * 2;

    cameraCtx.clearRect(0, 0, camera.width, camera.height);
    cameraCtx.drawImage(
        world,
        0, 0,
        cameraWidth, cameraHeight,
        0, 0,
        window.innerWidth, window.innerHeight
    )
    cameraCtx.drawImage(
        city,
        0, 0,
        cameraWidth, cameraHeight,
        0, 0,
        window.innerWidth, window.innerHeight
    )
}

function animate() {
    cityCtx.clearRect(0, 0, world.clientWidth, world.clientHeight);
    drawCanvas();
    shooters.forEach((shooter, idx, shooters) => {
        let [shooterNewX, shooterNewY, shooterNewAngle] = shooter;

        cityCtx.beginPath();
        cityCtx.strokeStyle = "red";
        cityCtx.fillStyle = "rgba(255, 0, 0, 0.3";
        cityCtx.moveTo(shooterNewX, shooterNewY);
        cityCtx.arc(shooterNewX, shooterNewY, shooterRange,
            shooterNewAngle - shooterArc, shooterNewAngle + shooterArc, false);
        cityCtx.lineTo(shooterNewX, shooterNewY);
        cityCtx.stroke();
        cityCtx.fill();
        cityCtx.closePath();

        shooters[idx] = [shooterNewX, shooterNewY, shooterNewAngle + (Math.PI / 100)]
    });

    onCamera();
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);