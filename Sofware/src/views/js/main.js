const { ipcRenderer } = require('electron');
const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');

var database_button = document.getElementById('database_button');
var battery_button = document.getElementById('battery');
var general_button = document.getElementById('general');
var serial_indicator = document.getElementById('serial_indicator');
var database_indicator = document.getElementById('database_indicator');

let batteryWindow = null;
let databaseWindow = null;

var map;
var marker = null;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0.000000, lng: 0.000000},
        zoom: 2
    });
}

function serial_active_indicator() {
    serial_indicator.style.backgroundColor = 'rgba(48, 190, 55, 0.7)';
}

function serial_desactive_indicator() {
    serial_indicator.style.backgroundColor = 'rgba(165, 165, 165, .7)';
}

function database_active_indicator() {
    database_indicator.style.backgroundColor = 'rgba(86, 178, 253, .7)';
}

function database_desactive_indicator() {
    database_indicator.style.backgroundColor = 'rgba(165, 165, 165, .7)';
}

database_button.addEventListener('click', () => {
    if (batteryWindow == null) {
        create_database_window();
    }
    //databaseWindow.webContents.openDevTools();
}); 

battery_button.addEventListener('click', () => {
    if (batteryWindow == null) {
        create_battery_window();
    }
    //batteryWindow.webContents.openDevTools();    
});

general_button.addEventListener('click', () => {
    //ipcRenderer.send('general-click');
    testWindow = new BrowserWindow({
        width: 600,
        height: 330,
        title: 'Test',
        webPreferences: {
          nodeIntegration: true
        }
    });
}); 

ipcRenderer.on('serial_connected', (event, message) => {
    if (message) {
        serial_active_indicator();
    } else {
        serial_desactive_indicator();
    }
});

ipcRenderer.on('serial_data', (event, data) => {
    console.log(data);
    pos = {
        lat: data.latitude,
        lng: data.longitude
    }

    if (pos.lat != 0  && pos.lng != 0) {
        if (marker == null) {
            marker = new google.maps.Marker({
                animation: google.maps.Animation.DROP,
                position: pos,
                map: map,
                title: 'VES'
            })
        } else {
            marker.setPosition(pos);
            map.setCenter(pos);
            map.setZoom(17);
        }
    }

    if (batteryWindow) batteryWindow.webContents.send('serial_data', data);
});

function create_battery_window() {
    batteryWindow = new BrowserWindow({
        width: 600,
        height: 330,
        title: 'Batteries',
        webPreferences: {
          nodeIntegration: true
      }
    });

    batteryWindow.loadFile(path.join(path.dirname(__dirname), 'views/battery.html'));

    batteryWindow.on('closed', () => {
        batteryWindow = null;
    })
}

function create_database_window() {
    databaseWindow = new BrowserWindow({
        width: 600,
        height: 380,
        title: 'Database',
        webPreferences: {
          nodeIntegration: true
      }
    });

    databaseWindow.loadFile(path.join(path.dirname(__dirname), 'views/database.html'));

    databaseWindow.on('closed', () => {
        databaseWindow = null;
    })
}