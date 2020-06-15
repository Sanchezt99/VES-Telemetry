const { ipcRenderer } = require('electron');

const create_btn = document.getElementById('create_btn');
const start_btn = document.getElementById('start_btn');
const table_selected_indicator = document.getElementById('table_selected_indicator');
const table_selected_text = document.getElementById('table_selected_text');
const table_list = document.getElementById('table_list');

var table_is_selected = false;

get_tables();

create_btn.addEventListener('click', () => {

});

start_btn.addEventListener('click', () => {
    ipcRenderer.send('start storage', true);
});

ipcRenderer.on('storage state', (event, state) => {
    if (table_is_selected) {
        start_btn.innerHTML = state ? 'Stop storage' : 'Start storage'; 
        start_btn.className = state ? "btn btn-outline-danger local_btn" : "btn btn-outline-success local_btn";
    }
});

ipcRenderer.on('local file selected', (event, path) => {
    table_selected_text.innerHTML = `File selected: ${path}`;
    local_indicator.style.backgroundColor = 'rgb(86, 209, 82)';
    file_is_selected = true;
});

ipcRenderer.on('tables update', (event, tables) => {
    let tbody = document.createElement('tbody');
    
    tables.forEach(table => {
        let trow = document.createElement('tr');
        let table_name_field = document.createElement('td');
        let action_field = document.createElement('td');
        let table_name_field_text = document.createTextNode(table);
        let select_button = document.createElement('button');
        let delete_button = document.createElement('button');
        let select_button_text = document.createTextNode('Select');
        let delete_button_text = document.createTextNode('Delete');

        action_field.classList.add('action_field');
        table_name_field.classList.add('table_name_field');
        select_button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        delete_button.classList.add('btn', 'btn-outline-danger', 'btn-sm');

        table_name_field.appendChild(table_name_field_text);
        select_button.appendChild(select_button_text);
        delete_button.appendChild(delete_button_text);
        action_field.appendChild(select_button);
        action_field.appendChild(delete_button);
        trow.appendChild(table_name_field);
        trow.appendChild(action_field);
        tbody.appendChild(trow);
    });

    table_list.appendChild(tbody);
});

function get_tables() {
    ipcRenderer.send('get tables');
}