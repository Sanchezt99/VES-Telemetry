const {
    ipcRenderer
} = require('electron');
const Chart = require('chart.js');

const header = document.getElementById('header_title');
const dropdownMenuButton = document.getElementById('dropdownMenuButton');
const dropdown_menu = document.getElementById('dropdown_menu');
const line_btn = document.getElementById('line_btn');
const area_btn = document.getElementById('area_btn');
const start_btn = document.getElementById('start_btn');
const graph_selection_wrapper = document.getElementById('graph_selection');
const chart_wrapper = document.getElementById('chart_wrapper');
const ctx = document.getElementById('myChart').getContext('2d');

var chart;

var var_selected = null;
var graph_type_selected = null;

var graph_data = [];
var labels = [];

ipcRenderer.send('get variables');

ipcRenderer.on('variables', (event, variables) => {
    variables.forEach(element => {
        if (element !== 'timestamp') {
            let variable = document.createElement('a');
            let variable_name = document.createTextNode(element);

            variable.classList.add('dropdown-item');

            variable.appendChild(variable_name);
            dropdown_menu.appendChild(variable);

            variable.addEventListener('click', () => {
                dropdownMenuButton.classList.remove('btn-secondary');
                dropdownMenuButton.classList.add('btn-primary');
                dropdownMenuButton.innerHTML = element;
                var_selected = element;
                set_start_btn();
            });
        }
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
    if (var_selected && graph_type_selected) {
        start_btn.classList.remove('btn-secondary');
        start_btn.classList.add('btn-primary');

        start_btn.addEventListener('click', () => {
            graph_selection_wrapper.style.display = 'none';
            chart_wrapper.style.display = 'block';
            header.innerHTML = var_selected;
            header.style.fontSize = '20px';

            ipcRenderer.send('get data');

            ipcRenderer.on('data', (event, data) => {
                data.forEach((element) => {
                    labels.push(element.timestamp);
                    if (var_selected === 'speed') graph_data.push(element.speed);
                    if (var_selected === 'minVolt') graph_data.push(element.minVolt);
                    if (var_selected === 'maxVolt') graph_data.push(element.maxVolt);
                    if (var_selected === 'current') graph_data.push(element.current);
                    if (var_selected === 'instantVolt') graph_data.push(element.instantVolt);
                    if (var_selected === 'soc') graph_data.push(element.soc);
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
                                borderColor: "#80b6f4",
                                pointHoverBackgroundColor: "rgba(246, 25, 25, .5)",
                                pointHoverBorderColor: "rgba(246, 25, 25, 1)",
                                pointRadius: .3,
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
                                pointRadius: .3,
                                fill: true,
                                backgroundColor: "rgba(244, 144, 128, 0.8)"
                            }]
                        },
                        // Configuration options go here
                        options: {
                            fill: true
                        }
                    });
                }
            });

            ipcRenderer.on('serial data', (event, data) => {
                if (var_selected === 'speed') addData(chart, data.timestamp, data.speed);
                if (var_selected === 'minVolt') addData(chart, data.timestamp, data.minVolt);
                if (var_selected === 'maxVolt') addData(chart, data.timestamp, data.maxVolt);
                if (var_selected === 'current') addData(chart, data.timestamp, data.current);
                if (var_selected === 'instantVolt') addData(chart, data.timestamp, data.instantVolt);
                if (var_selected === 'soc') addData(chart, data.timestamp, data.soc);
            });

        });
    }
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(data);
    chart.update();
}