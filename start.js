const {app, BrowserWindow, Notification, dialog, autoUpdater } = require ('electron');
const path = require('path');
const url = require('url');
let wohin = "./index.html";
const fs = require('fs');
const storage = require('electron-localstorage');
const spawnObj = require('child_process').spawn

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


//------------------------UPDATE-----------------------------------

// const server = 'https://ven.prow.li';
// const url = `${server}/GameOSR/${process.platform}/${app.getVersion()}`;
//
// autoUpdater.setFeedURL({url});
// setInterval(() => {
//   autoUpdater.checkForUpdates()
// }, 60000);
//
// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//  const dialogOpts = {
//    type: 'info',
//    buttons: ['Neustarten', 'Später'],
//    title: 'GameOS Update',
//    message: process.platform === 'win32' ? releaseNotes : releaseName,
//    detail: 'Eine neue Version wurde heruntergladen. Starte die Anwendung neu, um die Updates anzuwenden.'
//   }
//
//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall()
//   })
// });
//
// autoUpdater.on('error', message => {
//  console.error('Beim Update ist ein Fehler aufgetreten!');
//  console.error(message);
// });

//---------------------END-UPDATE-------------------------
//Starte create window funktion
app.on('ready', createWindow);

async function getErrorLog()
{
  return new Promise(async function(resolve, reject) {
    await fs.readFile("./error.log", "utf8", function(err, data) {
      if(err) throw err;
      resolve(data);
    });
  });
}

app.setAppUserModelId(process.execPath) //Um Benachrichtigungen anzeigen zu können

app.on('render-process-gone', async (details) =>
{
  console.error("PROCESS DIED");
  let message = "";
  let top = "";
  let e_log = await getErrorLog();
  //console.log(e_log);
  e_log = await JSON.parse(e_log);
  //console.log("SWITCH");

  switch (e_log.code) {
    case "INVALID_RUNTIME": top = "Code check failed!"; message = "The Code Checksum is invalid! Either the code got corrupted or modified!\nPlease make sure that: \n\n1. The process has access to the runtime folder\n2. The app is up to date\n\nIf you encounter this problem many times, please run the Recovery Tool or reinstall the newest version from the official GitHub page"; break;

  }
  //console.log("SHOW BOX");
  dialog.showErrorBox(top, message);
  new Notification({title: "Crash", body: "Process crashed! Please view error log. "}).show();
  app.exit();
  //console.log("OWOWOOWOWOWO");
})

//Verlasse, wenn alle Fenster geschlossen sind
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin'){
    app.quit();
  }
})
