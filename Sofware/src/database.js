const r = require('rethinkdb');
const {ipcMain} = require('electron');

let connection = null;
let table_selected = null;
let recording = false;

r.connect({host: 'localhost', port: 28015, db: 'KRATOS-VES'}, (err, conn) => {
    if (err) throw err;
    connection = conn;
    module.exports.database_connection = connection;
    console.log('Database connected.');
});

ipcMain.on('get data', (event) => {
    r.db('KRATOS-VES').tableList().run(connection, (err, tables) => {
        if (err) throw err;
        data = [tables, table_selected, recording];
        event.reply('data update', data);
    });
});

ipcMain.on('create table', (event, name) => {
    r.db('KRATOS-VES').tableCreate(name).run(connection, (err, res) => {
        if (err) {
            throw err;
        }
        console.log(res);
        event.reply('table created', name);
    });
});

ipcMain.on('table selected', (event, name) => {
    table_selected = name;
    event.reply('table selected', name);
});

ipcMain.on('table deleted', (event, name) => {
    r.db('KRATOS-VES').tableDrop(name).run(connection, (err, res) => {
        if (err) {
            throw err;
        }
        event.reply('table deleted', name);
        console.log(res);
    });
});

ipcMain.on('record', (event, state) => {
    recording = state;
});

function insert(data) {
    r.table(table_selected).insert(data).run(connection, (err, result) => {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
}

function get_recording_state() {
    return recording;
}

module.exports.insert = insert;
module.exports.get_recording_state = get_recording_state;
