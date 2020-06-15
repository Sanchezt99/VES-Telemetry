const r = require('rethinkdb');
const {ipcMain} = require('electron');

var connection = null;

r.connect({host: 'localhost', port: 28015, db: 'KRATOS-VES'}, (err, conn) => {
    if (err) throw err;
    connection = conn;
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