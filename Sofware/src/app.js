const Serial = require('./Comunication/coordinator');
const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    ipcMain
} = require('electron');

let mainWindow;

function create_main_window() {

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 700,
        webPreferences: {
            nodeIntegration: true
        }
    })

    const template = [
        // { role: 'appMenu' }
        ...(process.platform === 'darwin' ? [{
            label: app.getName(),
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

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    // and load the index.html of the app.
    //mainWindow.loadFile(path.join(__dirname, 'views/main.html'));

    //mainWindow.webContents.openDevTools();

    // Emitido cuando la ventana es cerrada.
    mainWindow.on('closed', () => {
        // Elimina la referencia al objeto window, normalmente  guardarías las ventanas
        // en un vector si tu aplicación soporta múltiples ventanas, este es el momento
        // en el que deberías borrar el elemento correspondiente.
        mainWindow = null;
    })
}