const DATE_OPTIONS = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
const COST_PER_KWH = 0.47
const COST_PER_PULSE = COST_PER_KWH / 1000;
const DISPLAY_WIDTH = 800;
const SLOTS_PER_DAY = 288;
const DAYS_TO_KEEP = 7;
const DAY_WIDTH = 750;
const DAY_HEIGHT = 250;

const GRAPH_WIDTH = 600;
const GRAPH_HEIGHT = 220;

const VERT_SPACING = 20;
const LEFT_BORDER = (DISPLAY_WIDTH - DAY_WIDTH) / 2;
const c = document.getElementById("drawcanvas");
const ctx = c.getContext("2d");

const data = [

]

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
    topPos = 10;
    ctx.clearRect(0, 0, DISPLAY_WIDTH, 1000);

    drawBatteryLevel();

    for(let i=0; i < data.length; i++) {
        const epocDate = data[i].day*8.64e7;
        //console.log('epocDate', epocDate);
        drawDay(new Date(epocDate), data[i].data);
    }


    /*
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
*/
    // const now = new Date()
    // const secondsSinceEpoch = Math.round(now.getTime() / 1000)
    // console.log(secondsSinceEpoch);
}

function showGraphs() {
    document.getElementById("connectButton").style.visibility = "hidden";
    document.getElementById("drawcanvas").style.visibility = "visible";

    const connectButton = document.getElementById("connectButton");
    connectButton.remove();
    document.getElementById("drawcanvas").style.visibility = "visible";
    render();
}

function connectToPuck() {
    Puck.eval("{bat:E.getBattery()}", function (d, err) {
        if (!d) {
            alert("Web Bluetooth connection failed!\n" + (err || ""));
            return;
        }

        batteryValue = d.bat;

        Puck.eval("c.data", function(d,err) {
            data = d;
            showGraphs();
        });  
    });
    
    //showGraphs();
};



function getDayObject(daysSinceEpoc) {
    for(let i=0; i < data.length; i++) {
        if(data[i].day === daysSinceEpoc) {
            return data[i];
        }
    }


    const newDataForToday = {
        day: daysSinceEpoc,
        data: new Uint8Array(288)
    };

    data.unshift(newDataForToday);

    if(data[data.length-1].day > daysSinceEpoc + DAYS_TO_KEEP) {
        data.pop();
    }

    return newDataForToday;
}

function addPulse() {

    const now = new Date();
    const daysSinceEpoc = Math.floor(now/8.64e7);
    const nowSeconds = now.getTime() / 1000;
    const startOfdayTime = new Date();
    startOfdayTime.setHours(0);
    startOfdayTime.setMinutes(0);
    const startOfDaySeconds=startOfdayTime.getTime() / 1000;
    const slot = Math.round((nowSeconds-startOfDaySeconds) / SLOTS_PER_DAY);

    const dataForToday = getDayObject(daysSinceEpoc);
    dataForToday.data[slot]+=1;
    console.log(dataForToday, dataForToday.data[slot]);
}


function keepRunning() {
    addPulse();
    render();
    setTimeout(keepRunning, Math.random() * 20000)
  }
  
  keepRunning()