const {app, BrowserWindow} = require ('electron');
const path = require('path');
const url = require('url');
let wohin = "./index.html";
const fs = require('fs');
const storage = require('electron-localstorage');

require('v8-compile-cache');

async function ReadFile()
{
  return new Promise(async function(resolve, reject)
  {
    console.log("1");
    await fs.exists("./location", async function(exists) {
      if(exists)
      {
        console.log("2");
        await fs.readFile("./location", "utf8", function(err, data)
        {
          console.log("3");
          if(err) throw err;
          resolve(data);
        });
      }
      else {
        await fs.writeFileSync('./location', './index.html');
        app.relaunch();
        app.exit();
      }
    });
  });
}

async function WhereToGo()
{
  return new Promise(async function(resolve, reject) {
    let loc = await ReadFile();
    switch (loc) {
      case "./Store.html": resolve("./Store.html");
        break;
      default: resolve("./index.html");

    }
  });
}

// async function WhereToGo(win)
// {
//   console.log("Bin hier");
//   return new Promise(async function(resolve, reject) {
//     let loc = await win.webContents.executeJavaScript('localStorage.getItem("wohin");', false);
//     console.log("Bin hier2");
//     if(loc === undefined)
//     {
//       await win.webContents.executeJavaScript("localStorage.setItem('wohin', './index.html');")
//       console.warn(loc)
//       loc = "./index.html";
//     }
//     console.log("Bin hier3");
//     console.log(loc);
//     resolve(loc);
//   });
// }

//WhereToGo();

if(handleSquirrelEvent(app))
{
  return;
}

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};


app.disableHardwareAcceleration();
app.allowRendererProcessReuse = true;
//init win
let win;

async function createWindow(){
  //BrowserFenster wird geöffnet
  win = new BrowserWindow({
    webPreferences: {
          nodeIntegration: true,
          devTools: true,
          enableRemoteModule: true
      },
      autoHideMenuBar: true,
    width: 1920, height: 1080, minWidth: 800, minHeight: 600});

    let wo = await WhereToGo(win);
    //Index.html wird geladen
    win.loadURL(url.format({
      pathname: path.join(__dirname, wo),
      protocol: 'file:',
      slashes: true
    }));

    //Dev-Tools öffnen
  //win.setMenu(null);
   win.webContents.openDevTools();
   win.maximize();

   win.on('closed', () => {
     console.log(storage.getStoragePath());
     //win = null;
   });
}

//Starte create window funktion
app.on('ready', createWindow);

//Verlasse, wenn alle Fenster geschlossen sind
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin'){
    app.quit();
  }
})
