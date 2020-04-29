const SerialPort = require('serialport');
const xbee_api = require('xbee-api');

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let connect = setInterval(connect_xbee, 1000);
let data = new Object();

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
                    console.log('port opened');
                    clearInterval(connect);
                });

                port.pipe(xbeeAPI.parser);

                xbeeAPI.parser.on("data", function(frame) {
                    parse_data(frame.data);
                });

                port.on('close', function() {
                    //io.emit('serial_connected', false);
                    console.log('close');
                    connect = setInterval(connect_xbee, 1000);
                    return;
                });
            } 
        });
    });
}

function parse_data(data_frame) {
    data.timestamp = parse_time(data_frame[0], data_frame[1], data_frame[2]);
    data.latitude = parse_coordinate(data_frame[3], data_frame[4], data_frame[5], data_frame[6]);
    data.longitude = parse_coordinate(data_frame[7], data_frame[8], data_frame[9], data_frame[10]);
    data.speed = data_frame[11];
    data.minVolt = parse_twoBytes(data_frame[12], data_frame[13])/1000;
    data.maxVolt = parse_twoBytes(data_frame[14], data_frame[15])/1000;
    data.current = parse_twoBytes(data_frame[16], data_frame[17])/10;
    data.instantVolt = parse_twoBytes(data_frame[18], data_frame[19])/10;
    data.soc = data_frame[20];
    //console.log(JSON.stringify(data));
}

function parse_time(hours, minutes, seconds) {
    return `${(hours < 10) ? "0" + hours : hours.toString()}`
            + ':' + `${(minutes < 10) ? "0" + minutes : minutes.toString()}`
            + ':' + `${(seconds < 10) ? "0" + seconds : seconds.toString()}`;
}

function parse_coordinate(byte0, byte1, byte2, byte3) {
    let coordinate;
    coordinate = 0x000000FF&byte0;
    coordinate =  (byte1 << 8) | coordinate;
    coordinate =  (byte2 << 16) | coordinate;
    coordinate =  (byte3 << 24) | coordinate;
    return coordinate/Math.pow(10, 6);
}

function parse_twoBytes(byte0, byte1) {
    //Big-Endian format
    let value;
    value = 0x00FF&byte1;
    value = (byte0 << 8) | value;
    return value;
}

module.exports = data;