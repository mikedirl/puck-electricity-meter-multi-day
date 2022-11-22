const DATE_OPTIONS = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
const COST_PER_KWH = 0.47
const COST_PER_PULSE = COST_PER_KWH / 1000;
const DISPLAY_WIDTH = 800;
const DAY_WIDTH = 750;
const DAY_HEIGHT = 250;

const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 220;

const VERT_SPACING = 20;
const LEFT_BORDER = (DISPLAY_WIDTH - DAY_WIDTH) / 2;
const c = document.getElementById("drawcanvas");
const ctx = c.getContext("2d");

function drawStuff() {

    ctx.moveTo(0, 0);
    ctx.lineTo(200, 100);
    ctx.stroke();
}

let topPos = 10;
let batteryValue = 0;

function drawBatteryLevel() {
    //Battery Label
    ctx.font = "bold 18px Arial";
    ctx.fillText("Battery:", LEFT_BORDER + 5, topPos + 15);

    //Battery Text
    ctx.font = "18px Arial";
    ctx.fillText(batteryValue + "%", LEFT_BORDER + 75, topPos + 15);

    topPos += 30
}

function drawGraph(data) {
    // axies
    ctx.moveTo(LEFT_BORDER + 50, topPos + 30);
    ctx.lineTo(LEFT_BORDER + 50, topPos + GRAPH_HEIGHT);
    ctx.lineTo(LEFT_BORDER + 50 + GRAPH_WIDTH, topPos + GRAPH_HEIGHT);
    ctx.stroke();

    ctx.font = "12px Arial";
    //draw graph times
    let graphLabelTop = topPos + GRAPH_HEIGHT + 20;
    let graphLabelLeft = LEFT_BORDER + 50;
    const graphLabelHorInc = GRAPH_WIDTH / 24;
    for (let i = 0; i < 24; i++) {
        ctx.fillText(i, graphLabelLeft, graphLabelTop);
        graphLabelLeft += graphLabelHorInc;
    }

    //draw graph values
    graphLabelTop = topPos + 40;
    graphLabelLeft = LEFT_BORDER + 25;
    const graphLabelVERInc = GRAPH_HEIGHT / 15;
    for (let i = 13; i >= 0; i--) {
        ctx.fillText(i * 2, graphLabelLeft, graphLabelTop);
        graphLabelTop += graphLabelVERInc;
    }

    //plot data

    const dataSlotWidth = GRAPH_WIDTH / data.length;
    const dataSlotUnitHeight = (GRAPH_HEIGHT - 30) / 255;

    let graphDataLeftPos = LEFT_BORDER + 50;

    let graphData0VertPos = topPos + GRAPH_HEIGHT;

    ctx.moveTo(graphDataLeftPos, graphData0VertPos - (data[0] * dataSlotUnitHeight));

    for (let i = 0; i < data.length; i++) {
        const height = data[i] * dataSlotUnitHeight;
        ctx.lineTo(graphDataLeftPos, graphData0VertPos - height);
        ctx.lineTo(graphDataLeftPos + dataSlotWidth, graphData0VertPos - height);
        graphDataLeftPos += dataSlotWidth;
    }
    ctx.stroke();
}

function drawDay(date, data) {
    ctx.beginPath();
    ctx.rect(LEFT_BORDER, topPos, DAY_WIDTH, DAY_HEIGHT);
    ctx.stroke();

    let accm = 0;

    for (let i = 0; i < data.length; i++) {
        accm += data[i];
    }

    //Date Label
    ctx.font = "bold 18px Arial";
    ctx.fillText("Date:", LEFT_BORDER + 5, topPos + 20);

    //Date Text
    ctx.font = "18px Arial";
    ctx.fillText(date.toLocaleDateString("en-US", DATE_OPTIONS), LEFT_BORDER + 55, topPos + 20);


    //Counts Label
    ctx.font = "bold 18px Arial";
    ctx.fillText("Counts:", LEFT_BORDER + 290, topPos + 20);

    //Counts Text
    ctx.font = "18px Arial";
    ctx.fillText(accm, LEFT_BORDER + 365, topPos + 20);

    //Est cost Label
    ctx.font = "bold 18px Arial";
    ctx.fillText("Est Cost:", LEFT_BORDER + 500, topPos + 20);

    //Est Cost Text
    ctx.font = "18px Arial";
    ctx.fillText(Math.round((accm * COST_PER_PULSE) * 100 + Number.EPSILON) / 100
        + "€", LEFT_BORDER + 585, topPos + 20);

    drawGraph(data);

    topPos += DAY_HEIGHT + VERT_SPACING;
}

function generateRandomData() {
    const data = new Uint8Array(288);
    for (let i = 0; i < 288; i++) {
        data[i] = Math.floor(Math.random() * 255);
    }
    return data;
}


function render() {
    var today = new Date();

    drawBatteryLevel();

    var today = new Date();
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());
    drawDay(today, generateRandomData());



    // const now = new Date()
    // const secondsSinceEpoch = Math.round(now.getTime() / 1000)
    // console.log(secondsSinceEpoch);
}

function connectToPuck() {
    // Puck.connect(function (connection) {
    //     if (connection === null) {
    //         alert("Connection failed!");
    //         return;
    //     }
    // });

    Puck.eval("{bat:E.getBattery()}", function (d, err) {
        if (!d) {
            alert("Web Bluetooth connection failed!\n" + (err || ""));
            return;
        }

        batteryValue = d.bat;

        document.getElementById("connectButton").style.visibility = "hidden";
        document.getElementById("drawcanvas").style.visibility = "visible";

        const connectButton = document.getElementById("connectButton");
        connectButton.remove();
        document.getElementById("drawcanvas").style.visibility = "visible";
        render();
    });
    
};