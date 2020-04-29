const io = require('socket.io-client');
var socket = io("http://localhost:4000");
const fs = require('fs');
const {dialog} = require('electron').remote;

var local_create_btn = document.getElementById('local_create_btn');
var local_select_btn = document.getElementById('local_select_btn');
var local_start_btn = document.getElementById('local_start_btn');
var local_indicator = document.getElementById('local_state_indicator');
var local_path_indicator = document.getElementById('local_selection');

var file_is_selected = false;

local_create_btn.addEventListener('click', () => {
   dialog.showSaveDialog((filename) => {
        if(filename === undefined) {
            alert("The document has not been created.");
            return;
        }

        fs.writeFile(filename, "", (err) => {
            if(err) {
                alert("Error: " + err.message);
            } else {
                alert(`The document has been created successfully in path: ${filename}`);
            }
        });
   });
});

local_select_btn.addEventListener('click', () => {
    dialog.showOpenDialog((filenames) => {
        if (filenames[0] !== undefined) {
            socket.emit('local file', filenames[0]);
        }
    });
});

local_start_btn.addEventListener('click', () => {
    socket.emit('start storage', true);
});

socket.on('storage state', (state) => {
    if (file_is_selected) {
        local_start_btn.innerHTML = state ? 'Stop storage' : 'Start storage'; 
        local_start_btn.className = state ? "btn btn-outline-danger local_btn" : "btn btn-outline-success local_btn";
    }
});

socket.on('file selected', (path) => {
    local_path_indicator.innerHTML = `table selected: ${path}`;
    local_indicator.style.backgroundColor = 'rgb(86, 209, 82)';
    file_is_selected = true;
});