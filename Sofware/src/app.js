const SerialPort = require('serialport');
const xbee_api = require('xbee-api');
const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain
} = require('electron');
const path = require('path');

if (process.env.NODE_ENV !== 'production') require('electron-reload')(__dirname, {
    //electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
});

let mainWindow;
let batteryWindow;
let databaseWindow;
let data = {};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(create_main_window);

app.on('activate', () => {
    // En macOS es común volver a crear una ventana en la aplicación cuando el
    // icono del dock es clicado y no hay otras ventanas abiertas.
    if (mainWindow === null) {
      create_main_window();
    }
  });

// Quit when all windows are closed.
app.on('window-all-closed', () => {
// On macOS it is common for applications and their menu bar
// to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      create_main_window();
    }
});

//=============================== Windows =================================//

function create_main_window() {
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    });

    const template = [
        // { role: 'appMenu' }
        ...(process.platform === 'darwin' ? [{
            label: app.name,
            submenu: [{
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        }] : []),
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [{
                    role: 'reload'
                },
                {
                    role: 'forcereload'
                },
                {
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [{
                    role: 'minimize'
                },
                {
                    role: 'zoom'
                },
                ...(process.platform === 'darwin' ? [{
                        type: 'separator'
                    },
                    {
                        role: 'front'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        role: 'window'
                    }
                ] : [{
                    role: 'close'
                }])
            ]
        },
        {
            label: 'Tools',
            submenu: [{
                label: 'Console',
                click: () => {
                    mainWindow.webContents.openDevTools();
                }
            }]
        },
        {
            role: 'help',
            submenu: [{
                label: 'Learn More',
                click: async () => {
                    const {
                        shell
                    } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }]
        }
    ]

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'views/main.html'));

    mainWindow.webContents.openDevTools();

    // Emitido cuando la ventana es cerrada.
    mainWindow.on('closed', () => {
        // Elimina la referencia al objeto window, normalmente  guardarías las ventanas
        // en un vector si tu aplicación soporta múltiples ventanas, este es el momento
        // en el que deberías borrar el elemento correspondiente.
        mainWindow = null;
    });

    //==================================== Serial connection ===========================//

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
                        parse_data(frame.data);
                        mainWindow.webContents.send('serial_data', data);
                        if (batteryWindow) batteryWindow.webContents.send('serial_data', data);
                        mainWindow.webContents.send('serial_connected', true);
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
}

function create_database_window() {
    databaseWindow = new BrowserWindow({
        width: 600,
        height: 330,
        title: 'Database',
        webPreferences: {
          nodeIntegration: true
      }
    });

    databaseWindow.loadFile(path.join(__dirname, 'views/database.html'));

    databaseWindow.on('closed', () => {
        databaseWindow = null;
    })
}

function create_battery_window() {
    batteryWindow = new BrowserWindow({
        width: 600,
        height: 330,
        title: 'Batteries',
        webPreferences: {
          nodeIntegration: true
      }
    });

    batteryWindow.loadFile(path.join(__dirname, 'views/battery.html'));

    batteryWindow.on('closed', () => {
        batteryWindow = null;
    })
}


//=================================== Events =====================================//

ipcMain.on('database-click', (event) => {
    if (batteryWindow == null) {
        create_database_window();
    }
    databaseWindow.webContents.openDevTools();
})

ipcMain.on('battery-click', (event) => {
    if (batteryWindow == null) {
        create_battery_window();
    }
    //batteryWindow.webContents.openDevTools();
})

ipcMain.on('local file', (event, path) => {
    console.log(path);
    event.reply('local file selected', path);
})

//================================ Serial Parser ============================================//

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