const { ipcRenderer } = require('electron');
const Chart = require('chart.js');

const header = document.getElementById('header_title');
const y_axis_dropdown = document.getElementById('y_axis_dropdown');
const y_axix_dropdown_menu = document.getElementById('y_axis_dropdown_menu');
const x_axis_dropdown = document.getElementById('x_axis_dropdown');
const x_axix_dropdown_menu = document.getElementById('x_axis_dropdown_menu');
const line_btn = document.getElementById('line_btn');
const area_btn = document.getElementById('area_btn');
const start_btn = document.getElementById('start_btn');
const graph_selection_wrapper = document.getElementById('graph_selection');
const chart_wrapper = document.getElementById('chart_wrapper');
const ctx = document.getElementById('myChart').getContext('2d');

var y_axis_var_selected = null;
var x_axis_var_selected = null;
var graph_type_selected = null;

var x_data = [];
var y_data = [];

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
            set_start_btn();
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
            set_start_btn();
        });
    });
});

line_btn.addEventListener('click', () => {
    graph_type_selected = 'line';
    line_btn.style.color = 'rgb(129, 42, 170)';
    area_btn.style.color = 'gray';
    set_start_btn();
});

area_btn.addEventListener('click', () => {
    graph_type_selected = 'area';
    area_btn.style.color = 'rgb(129, 42, 170)';
    line_btn.style.color = 'gray';
    set_start_btn();
});

function set_start_btn() {
    if (y_axis_var_selected && x_axis_var_selected && graph_type_selected) {
        start_btn.classList.remove('btn-secondary');
        start_btn.classList.add('btn-primary');

        start_btn.addEventListener('click', () => {
            graph_selection_wrapper.style.display = 'none';
            chart_wrapper.style.display = 'block';
            header.innerHTML = `${y_axis_var_selected} - ${x_axis_var_selected}`;
            header.style.fontSize = '20px';

            ipcRenderer.send('get data');

            ipcRenderer.on('data', (event, data) => {
                console.log(data);
                
                data.forEach((element) => {
                    if (y_axis_var_selected === 'timestamp') y_data.push(element.timestamp);
                    if (x_axis_var_selected === 'timestamp') x_data.push(element.timestamp);
                    if (y_axis_var_selected === 'speed') y_data.push(element.speed);
                    if (x_axis_var_selected === 'speed') x_data.push(element.speed);
                    if (y_axis_var_selected === 'minVolt') y_data.push(element.minVolt);
                    if (x_axis_var_selected === 'minVolt') x_data.push(element.minVolt);
                    if (y_axis_var_selected === 'maxVolt') y_data.push(element.maxVolt);
                    if (x_axis_var_selected === 'maxVolt') x_data.push(element.maxVolt);
                    if (y_axis_var_selected === 'current') y_data.push(element.current);
                    if (x_axis_var_selected === 'current') x_data.push(element.current);
                    if (y_axis_var_selected === 'instantVolt') y_data.push(element.instantVolt);
                    if (x_axis_var_selected === 'instantVolt') x_data.push(element.instantVolt);
                    if (x_axis_var_selected === 'soc') x_data.push(element.soc);
                    if (y_axis_var_selected === 'soc') y_data.push(element.soc);
                });

                var chart = new Chart(ctx, {
                    type: graph_type_selected,
                
                    // The data for our dataset
                    data: {
                        labels: x_data,
                        datasets: [{
                            label: y_axis_var_selected,
                            data: y_data
                        }]
                    },
                
                    // Configuration options go here
                    options: {
                
                    }
                });
            });

        });
    }
}