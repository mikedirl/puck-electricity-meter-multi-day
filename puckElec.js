
const SLOTS_PER_DAY = 288;
const DAYS_TO_KEEP = 7;

function Counter() {
    this.clear();
};

/// Clear the counters back to zero
Counter.prototype.clear = function () {
    this.data = [

    ];
};

Counter.prototype.getDayObject = function (daysSinceEpoc) {
    for(let i=0; i < this.data.length; i++) {
        if(this.data[i].day === daysSinceEpoc) {
            return this.data[i];
        }
    }

    const newDataForToday = {
        day: daysSinceEpoc,
        data: new Uint8Array(288)
    };

    this.data.unshift(newDataForToday);

    if(this.data[this.data.length-1].day > daysSinceEpoc + DAYS_TO_KEEP) {
        this.data.pop();
    }

    return newDataForToday;
};

Counter.prototype.inc = function () {
    const now = new Date();
    const daysSinceEpoc = Math.floor(now/8.64e7);
    const nowSeconds = now.getTime() / 1000;
    const startOfdayTime = new Date();
    startOfdayTime.setHours(0);
    startOfdayTime.setMinutes(0);
    const startOfDaySeconds=startOfdayTime.getTime() / 1000;
    const slot = Math.round((nowSeconds-startOfDaySeconds) / SLOTS_PER_DAY);

    const dataForToday = this.getDayObject(daysSinceEpoc);
    dataForToday.data[slot]+=1;
    console.log(dataForToday, dataForToday.data[slot]);
};

var c = new Counter();

// Update BLE advertising
function update() {
  console.log('Update');
    var a = new ArrayBuffer(4);
    var d = new DataView(a);
    d.setUint32(0, c.data.length, false/*big endian*/);
    NRF.setAdvertising({}, {
        name: "Puck.js Elec \xE2\x9A\xA1",
        manufacturer: 0x0590,
        manufacturerData: a,
        interval: 600 // default is 375 - save a bit of power
    });
}

function onInit() {
  console.log('onInit');
    clearWatch();
    D1.write(0);
    pinMode(D2, "input_pullup");
    setWatch(function (e) {
        console.log('hhhh');
        c.inc();
        update();
        // digitalPulse(LED1, 1, 1); // show activity
    }, D2, { repeat: true, edge: "falling" });
    update();
}

onInit();
