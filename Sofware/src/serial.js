const app = require('./app.js');
const {ipcMain} = require('electron');
const {parse_data} = require('./parser.js');
const SerialPort = require('serialport');
const xbee_api = require('xbee-api');
const database = require('./database.js');

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 2
});
  
let connect = setInterval(connect_xbee, 1000);

function connect_xbee() {
    console.log('Scanning ports...');
    SerialPort.list().then(ports => {
        ports.forEach(port => {
            if (port.manufacturer != undefined && port.manufacturer.includes('FTDI')) { //'FTDI' id the xbee explorer manufacturer
                port = new SerialPort(port.path, {
                    baudRate: 115200,
                    parser: xbeeAPI.rawParser()
                });

                port.on('error', function(err) {
                    console.log('Error: ', err.message);
                });

                port.on('open', () => {
                    console.log('Serial port opened.');
                    clearInterval(connect);
                });

                port.pipe(xbeeAPI.parser);

                xbeeAPI.parser.on("data", function(frame) {
                    let data = parse_data(frame.data);

                    if (database.get_recording_state()) {
                        database.insert(data);
                    }

                    let mainWindow = app.get_mainWindow();
                    let batteryWindow = app.get_batteryWindow();
                    
                    if (mainWindow) {
                        mainWindow.webContents.send('serial_data', data);
                        mainWindow.webContents.send('serial_connected', true);
                    }
                    if (batteryWindow) batteryWindow.webContents.send('serial_data', data);
                });

                port.on('close', function() {
                    console.log('close');
                    connect = setInterval(connect_xbee, 1000);
                    return;
                });
            } 
        });
    });
}