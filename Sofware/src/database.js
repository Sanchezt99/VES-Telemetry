const r = require('rethinkdb');
const {ipcMain} = require('electron');

let connection = null;
let table_selected = null;

r.connect({host: 'localhost', port: 28015, db: 'KRATOS-VES'}, (err, conn) => {
    if (err) throw err;
    connection = conn;
    module.exports.database_connection = connection;
    console.log('Database connected.');
});

ipcMain.on('get tables', (event) => {
    r.db('KRATOS-VES').tableList().run(connection, (err, tables) => {
        if (err) throw err;
        event.reply('tables update', tables);
    });
});

ipcMain.on('create table', (event, name) => {
    r.db('KRATOS-VES').tableCreate(name).run(connection, (err, res) => {
        if (err) {
            event.reply('table not created');
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

function insert(data) {
    r.table(table_selected).insert(data).run(connection, (err, result) => {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
}

module.exports.insert = insert;
