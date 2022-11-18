const DISPLAY_WIDTH = 800;
const DAY_WIDTH = 750;
const DAY_HEIGHT = 250;
const DAY_SPACING = 10;
const LEFT_BORDER = (DISPLAY_WIDTH - DAY_WIDTH) /2;
const c = document.getElementById("drawcanvas");
const ctx = c.getContext("2d");

function drawStuff() {

    ctx.moveTo(0, 0);
    ctx.lineTo(200, 100);
    ctx.stroke();
}

let topPos = 10;

function drawDay(pos) {
    ctx.beginPath();
    ctx.rect(LEFT_BORDER, topPos, DAY_WIDTH, DAY_HEIGHT);
    ctx.stroke();  
}

drawDay(0);