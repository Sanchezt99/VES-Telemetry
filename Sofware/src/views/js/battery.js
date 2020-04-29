const io = require('socket.io-client');
var socket = io("http://localhost:4000");

soc = 0;
instantVolt = 0;
minVolt = 0;
current = 0;

socField = document.getElementById('soc');
socBar = document.getElementById('socBar');
instantVolt_value = document.getElementById('instantVolt_value');
minVolt_value = document.getElementById('minVolt_value');
current_value = document.getElementById('current_value');

socket.on('serial_data', (data) => {
    soc = data.soc;
    socField.innerHTML = `${soc}%`;
    socBar.style.width = `${soc}%`; //level of progress bar
    instantVolt_value.innerHTML = `${instantVolt}`;
    minVolt_value.innerHTML = `${minVolt}`;
    current_value.innerHTML = `${current}`;
});

