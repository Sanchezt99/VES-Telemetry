const { ipcRenderer } = require('electron');
const fs = require('fs');
const {dialog} = require('electron').remote;

let save_options = {
    title: "Create Persistence file",
    buttonLabel: "Create File",
    filters :[
        {name: '*', extensions: ['txt']}
       ]
};

let select_options = {
    title: "Select Persistence file",
    buttonLabel: "Select File",
    filters :[
        {name: '*', extensions: ['txt']}
       ]
};

var local_create_btn = document.getElementById('local_create_btn');
var local_select_btn = document.getElementById('local_select_btn');
var local_start_btn = document.getElementById('local_start_btn');
var local_indicator = document.getElementById('local_state_indicator');
var local_path_indicator = document.getElementById('local_selection');

var file_is_selected = false;

local_create_btn.addEventListener('click', () => {
    dialog.showSaveDialog(save_options).then((res) => {
        if(res.canceled === true) {
            alert("File has not been created.");
            return;
        }
        fs.writeFile(res.filePath, "", (err) => {
            if(err) {
                console.log('err.message');
                alert("Error: " + err.message);
            } else {
                alert(`File has been created successfully in path: ${res.filePath}`);
            }
        });
    });
});

local_select_btn.addEventListener('click', () => {
    dialog.showOpenDialog(select_options).then((res) => {
        if (res.canceled === true) {
            alert("File not selected.");
            return; 
        }

        ipcRenderer.send('local file', res.filePaths[0]);
        alert(`File selected: ${res.filePaths[0]}`);
    });
});

local_start_btn.addEventListener('click', () => {
    ipcRenderer.send('start storage', true);
});

ipcRenderer.on('storage state', (event, state) => {
    if (file_is_selected) {
        local_start_btn.innerHTML = state ? 'Stop storage' : 'Start storage'; 
        local_start_btn.className = state ? "btn btn-outline-danger local_btn" : "btn btn-outline-success local_btn";
    }
});

ipcRenderer.on('local file selected', (event, path) => {
    local_path_indicator.innerHTML = `File selected: ${path}`;
    local_indicator.style.backgroundColor = 'rgb(86, 209, 82)';
    file_is_selected = true;
});