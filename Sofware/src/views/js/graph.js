const {
    ipcRenderer
} = require('electron');
const Chart = require('chart.js');

const header = document.getElementById('header_title');
const dropdownMenuButton = document.getElementById('dropdownMenuButton');
const plus_btn = document.getElementById('plus_btn');
const dropdown_menu = document.getElementById('dropdown_menu');
const line_btn = document.getElementById('line_btn');
const area_btn = document.getElementById('area_btn');
const dropdown_menu_plus = document.getElementById('dropdown_menu_plus');
const start_btn = document.getElementById('start_btn');
const graph_selection_wrapper = document.getElementById('graph_selection');
const chart_wrapper = document.getElementById('chart_wrapper');
const ctx = document.getElementById('myChart').getContext('2d');

var var_selected = null;
var var_selected_2 = null;
var graph_type_selected = null;
var variables = [];
var chart;
var graph_data = [];
var graph_data_2 = [];
var labels = [];


var speed_gradient = ctx.createLinearGradient(10,10,10,350);
speed_gradient.addColorStop(0,'rgba(247, 255, 0, 0.5)');
speed_gradient.addColorStop(1,'rgba(247, 255, 0, 0.0)');

var soc_gradient = ctx.createLinearGradient(10,10,10,350);
soc_gradient.addColorStop(0,'rgba(0, 255, 162, 0.5)');
soc_gradient.addColorStop(1,'rgba(0, 255, 162, 0.0)');

const var_color_code = {
    'speed': ['rgba(232, 239, 20, 1)', speed_gradient],
    'soc': ["rgba(0, 255, 140, 1)", soc_gradient] //BorderColor, background
}

ipcRenderer.send('get variables');

ipcRenderer.on('variables', (event, vars) => {
    variables = vars;
    set_dropdown(dropdown_menu, true);
    set_dropdown(dropdown_menu_plus, false);
});


function set_dropdown(dropdown, is_main) {
    variables.forEach(element => {
        if (element !== 'timestamp') {
            let variable = document.createElement('a');
            let variable_name = document.createTextNode(element);

            variable.classList.add('dropdown-item');
            variable.appendChild(variable_name);
            dropdown.appendChild(variable);

            if (is_main) {
                variable.addEventListener('click', () => {
                    dropdownMenuButton.classList.remove('btn-secondary');
                    dropdownMenuButton.classList.add('btn-primary');
                    dropdownMenuButton.innerHTML = element;
                    var_selected = element;
                    set_start_btn();
                });
            } else {
                variable.addEventListener('click', () => {
                    var_selected_2 = element;
                    ipcRenderer.send('get data');
                    plus_btn.style.display = 'none';
                });
            }
        }
    });
}

function fill_data(arr, is_main) {
    if (is_main) {
        if (graph_data.length === 0) {
            arr.forEach((element) => {
                labels.push(element.timestamp);
                graph_data.push(element[var_selected]);
            });
        }
    } else {
        arr.forEach((element) => {
            graph_data_2.push(element[var_selected_2]);
        });
        let newDataset = {
            label: var_selected_2,
            data: graph_data_2,
            borderColor: var_color_code[var_selected_2],
            pointHoverBackgroundColor: "rgba(246, 25, 25, .5)",
            pointHoverBorderColor: "rgba(246, 25, 25, 1)",
            pointRadius: 0,
            fill: false
        };
        chart.data.datasets.push(newDataset);
        console.log(chart.data.datasets);
        chart.update();
    }
}

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
    if (var_selected && graph_type_selected) {
        start_btn.classList.remove('btn-secondary');
        start_btn.classList.add('btn-primary');

        start_btn.addEventListener('click', () => {
            ipcRenderer.send('get data');

            ipcRenderer.on('data', (event, data) => {
                fill_data(data, true);
                fill_data(data, false);
            });

            if (graph_type_selected === 'line') {
                chart = new Chart(ctx, {
                    type: graph_type_selected,

                    // The data for our dataset
                    data: {
                        labels: labels,
                        datasets: [{
                            label: var_selected,
                            data: graph_data,
                            borderColor: var_color_code[var_selected][0],
                            pointHoverBackgroundColor: "rgba(246, 25, 25, .5)",
                            pointHoverBorderColor: "rgba(246, 25, 25, 1)",
                            pointRadius: 0,
                            fill: false
                        }]
                    },
                    // Configuration options go here
                    options: {

                    }
                });
            } else if (graph_type_selected === 'area') {
                chart = new Chart(ctx, {
                    type: 'line',

                    // The data for our dataset
                    data: {
                        labels: labels,
                        datasets: [{
                            label: var_selected,
                            data: graph_data,
                            borderColor: var_color_code[var_selected][0],
                            pointHoverBackgroundColor: "rgba(246, 25, 25, .5)",
                            pointHoverBorderColor: "rgba(246, 25, 25, 1)",
                            pointRadius: 0,
                            fill: true,
                            backgroundColor: var_color_code[var_selected][1]
                        }]
                    },
                    // Configuration options go here
                    options: {
                        fill: true
                    }
                });
            }

            graph_selection_wrapper.style.display = 'none';
            chart_wrapper.style.display = 'block';
            header.innerHTML = var_selected;
            header.style.fontSize = '20px';
            plus_btn.style.display = 'inline-block';

            ipcRenderer.on('serial data', (event, data) => {
                addData(chart, data.timestamp, data[var_selected]);
            });

            function addData(chart, label, data) {
                chart.data.labels.push(label);
                chart.data.datasets[0].data.push(data);
                chart.update();
            }

        });
    }
}