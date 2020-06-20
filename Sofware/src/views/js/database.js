const { ipcRenderer } = require('electron');
const prompt = require('electron-prompt');

const create_btn = document.getElementById('create_btn');
const start_btn = document.getElementById('start_btn');
const table_selected_indicator = document.getElementById('table_selected_indicator');
const table_selected_text = document.getElementById('table_selected_text');
const table_list = document.getElementById('table_list');
const tbody = document.getElementById('tbody');

let is_table_selected = false;
let recording = false;

ipcRenderer.send('get tables');

create_btn.addEventListener('click', () => {
    prompt({
        title: 'Create Table',
        label: 'Table Name',
        inputAttrs: {
            type: 'text',
            required: true
        },
        type: 'input'
    })
    .then(input => {
        if (input !== null) {
            ipcRenderer.send('create table', input);
        }
    })
    .catch(console.error);
});

start_btn.addEventListener('click', () => {
    if (is_table_selected) {
        if (!recording) {
            recording = true;
            ipcRenderer.send('start recording');
            set_start_btn();
            start_btn.classList.add('active');
        } else {
            recording = false;
            ipcRenderer.send('stop recording');
            set_start_btn();
        }
    }
});

ipcRenderer.on('tables update', (event, tables) => {
    tables.forEach(table => {
        create_list_node(table);
    });
});

ipcRenderer.on('table created', (event, table) => {
    alert(`${table} created successfully.`);
    create_list_node(table);
});

ipcRenderer.on('table deleted', (event, name) => {
    alert(`${name} deleted successfully.`);
    tbody.removeChild(document.getElementById(name));
});

ipcRenderer.on('table selected', (event, name) => {
    alert(`${name } table has been selected.`);
    table_selected_text.innerHTML = `Table selected: ${name}`;
    table_selected_indicator.style.backgroundColor = 'rgb(86, 209, 82)';
    is_table_selected = true;
    start_btn.classList.remove('disabled');
});

function set_start_btn() {
    start_btn.innerHTML = recording ? 'Stop storage' : 'Start storage'; 
    start_btn.className = recording ? "btn btn-outline-danger local_btn" : "btn btn-outline-success local_btn";
}

function create_list_node(table) {
    let trow = document.createElement('tr');
    let table_name_field = document.createElement('td');
    let action_field = document.createElement('td');
    let table_name_field_text = document.createTextNode(table);
    let select_button = document.createElement('button');
    let delete_button = document.createElement('button');
    let select_button_text = document.createTextNode('Select');
    let delete_button_text = document.createTextNode('Delete');

    trow.setAttribute('id', table);

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

    select_button.addEventListener('click', () => {
        ipcRenderer.send('table selected', table);
    });

    delete_button.addEventListener('click', () => {
        prompt({
            title: 'Delete Table',
            label: `Please enter the table name "${table}" to continue`,
            inputAttrs: {
                type: 'text',
                required: true
            },
            type: 'input',
            resizable: true
        })
        .then(input => {
            if (input !== null) {
                if (input === table) {
                    ipcRenderer.send('table deleted', input);
                } else {
                    alert("Name not match");
                }
            }
        })
        .catch(console.error);
    });
}