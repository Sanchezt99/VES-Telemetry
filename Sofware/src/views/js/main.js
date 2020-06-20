const {ipcRenderer} = require('electron');

var database_button = document.getElementById('database_button');
var battery_button = document.getElementById('battery');
var general_button = document.getElementById('general');
var serial_indicator = document.getElementById('serial_indicator');
var database_indicator = document.getElementById('database_indicator');
var map;
var marker = null;
let serial_connection = false;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 0.000000, lng: 0.000000},
        zoom: 2
    });
}

function set_serial_indicator(state) {
    if (state) {
        serial_indicator.style.backgroundColor = 'rgba(48, 190, 55, 0.7)';
    } else {
        serial_indicator.style.backgroundColor = 'rgba(165, 165, 165, .7)';
    }
}

function database_active_indicator() {
    database_indicator.style.backgroundColor = 'rgba(86, 178, 253, .7)';
}

function database_desactive_indicator() {
    database_indicator.style.backgroundColor = 'rgba(165, 165, 165, .7)';
}

database_button.addEventListener('click', () => {
    ipcRenderer.send('database-click');
}); 

battery_button.addEventListener('click', () => {
    ipcRenderer.send('battery-click');
});

general_button.addEventListener('click', () => {
    ipcRenderer.send('general-click');
}); 

ipcRenderer.on('serial_connected', (event, state) => {
    if (state) {
        set_serial_indicator(state);
    } else {
        set_serial_indicator(state);
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
});