const { ipcRenderer } = require('electron');

const y_axis_dropdown = document.getElementById('y_axis_dropdown');
const y_axix_dropdown_menu = document.getElementById('y_axis_dropdown_menu');
const x_axis_dropdown = document.getElementById('x_axis_dropdown');
const x_axix_dropdown_menu = document.getElementById('x_axis_dropdown_menu');

var y_axis_var_selected = null;
var x_axis_var_selected = null;

ipcRenderer.send('get variables');

ipcRenderer.on('variables', (event, variables) => {
    variables.forEach(element => {
        let variable = document.createElement('a');
        let variable_name = document.createTextNode(element);

        variable.classList.add('dropdown-item');

        variable.appendChild(variable_name);
        y_axix_dropdown_menu.appendChild(variable);

        variable.addEventListener('click', () => {
            y_axis_dropdown.classList.remove('btn-secondary');
            y_axis_dropdown.classList.add('btn-primary');
            y_axis_dropdown.innerHTML = element;
            y_axis_var_selected = element;
        });
    });

    variables.forEach(element => {
        let variable = document.createElement('a');
        let variable_name = document.createTextNode(element);

        variable.classList.add('dropdown-item');

        variable.appendChild(variable_name);
        x_axis_dropdown_menu.appendChild(variable);

        variable.addEventListener('click', () => {
            x_axis_dropdown.classList.remove('btn-secondary');
            x_axis_dropdown.classList.add('btn-primary');
            x_axis_dropdown.innerHTML = element;
            x_axis_var_selected = element;
        });
    });
});