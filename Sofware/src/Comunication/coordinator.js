const SerialPort = require('serialport');
const xbee_api = require('xbee-api');

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

var cont = 0;

let connect = setInterval(connect_xbee, 1000);

function connect_xbee() {
    console.log('Scanning ports...');
    SerialPort.list().then(ports => {
        ports.forEach((port) => {
            if (port.manufacturer != undefined && port.manufacturer.includes('FTDI')) { //'FTDI' id the xbee explorer manufacturer
                port = new SerialPort(port.path, {
                    baudRate: 115200,
                    parser: xbeeAPI.rawParser()
                });

                port.on('error', function(err) {
                    console.log('Error: ', err.message);
                });

                port.on('open', () => {
                    clearInterval(connect);
                });

                port.pipe(xbeeAPI.parser);

                xbeeAPI.parser.on("data", function(frame) {
                console.log(`>> ${cont}`, frame);
                cont++;
                });
            } 
        });
    });
}