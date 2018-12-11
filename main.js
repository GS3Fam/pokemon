const electron = require('electron');
const url = require('url');
const path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://jairo_pokemon:9wHNRNQg43XBskw@ds041633.mlab.com:41633/pokemon')

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;
let viewDeleteWindow;

// var db = mongoose.connection;

app.on('ready', function(){
    // create new window
    mainWindow = new BrowserWindow({

    });

    //load html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }));

    //quit app
    mainWindow.on('closed', function(){
        app.quit();
    });

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

function createWindow(){
    //add window
    addWindow = new BrowserWindow({
        width: 300,
        height: 400,
        title: 'Add pokemon'
    });

    //load html
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/addWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    //garbage collection
    addWindow.on('closed', function(){
        addWindow = null;
    });
}

function viewDelete(){
    //add window
    viewDeleteWindow = new BrowserWindow({
        width: 300,
        height: 400,
        title: 'Add pokemon'
    });

    //load html
    viewDeleteWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/viewDelete.html'),
        protocol: 'file',
        slashes: true
    }));

    //garbage collection
    viewDeleteWindow.on('closed', function(){
        viewDeleteWindow = null;
    });
}
// catch add pokemon
var pokeSchema = new mongoose.Schema({
    id: String,
    name: String,
    nature: String,
    type: String,
    isDeleted: Boolean
});
var pokemon = mongoose.model('Pokemon', pokeSchema);



ipcMain.on('pokemon:add', function(event, pokemon_data){
    console.log(pokemon_data[0]);
    var new_pokemon = new pokemon({id: pokemon_data[0], name: pokemon_data[1], nature: pokemon_data[2], type: pokemon_data[3], isDeleted: false });
    new_pokemon.save(function (err, new_pokemon){
        if (err) return console.error(err);
        mongoose.deleteModel('Pokemon');
    });
    mainWindow.webContents.send('pokemon:add', pokemon_data);
});

ipcMain.on('pokemon:list', function(event, pokemon_data){
    pokemon.find(function (err, pokemons){
        if(err) return console.error(err);
        event.sender.send('pokemon:list', pokemons);
    })
});

//delete pokemon
ipcMain.on('pokemon:view-delete', function(event, id){
    viewDelete();
    pokemon.find({ id: id }, function(err, docs){
        viewDeleteWindow.webContents.send('pokemon:view-delete', docs);
        console.log(docs);
    });
});
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Pokemon',
                click(){
                    createWindow();
                }
            },
            {
                label: 'Clear List',
            }
        ]
    },
    {
        label:'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
            app.quit();
        }
    }
];

//if mac add empty object
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// add developer tools if not in production
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toogle Devtools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:  'reload'
            }
        ]
    })
}