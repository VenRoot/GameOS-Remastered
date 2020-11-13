const CryptoJS = require('crypto-js');
const AES = require("crypto-js/aes");
const SHA256 = require("crypto-js/sha256");
const MD5 = require("crypto-js/md5");
const md5 = MD5;
const fs = require('fs');
const sys = require('sys');
const exec = require('child_process').exec;
const https = require('https');
const crypto = require('crypto');
const os = require('os');

const App = {
  Version: "1.0.0",
  Build: "010101"
}

async function validApp(version, build)
{
  return new Promise(async function(resolve, reject) {
    if(version == undefined && build == undefined)
    {
      version = App.Version;
      build = App.Build;
    }
    let uwu = await exec(`node.exe ./js/val.js ${version} ${build}`, function (err, stdout, stderr)
  {
    if(err) { throw err; }
    console.log(stdout);
    sessionStorage._TMPHASH = stdout;
  });

  uwu.on('exit', async function(code)
{
  if(code != 0)
  {
    let _log = {
      code: "INVALID_RUNTIME",
      release: os.release,
      memory: os.totalmem,
      memoryfree: os.freemem,
      cpu: os.cpus()[0].model,
      cpus: os.cpus().length
    }
    _log = await JSON.stringify(_log);
    await fs.writeFileSync('./error.log',_log);
    alert("ERROR! HASH INVALID! CLOSING PROGRAM!");
    process.exit(1);

  }
  console.log(code);
});
resolve(sessionStorage._TMPHASH-1);
  });
}

function getChecksum(path) {
  return new Promise(function (resolve, reject) {
    // crypto.createHash('sha1');
    // crypto.createHash('sha256');
    const hash = crypto.createHash('md5');
    const input = fs.createReadStream(path);

    input.on('error', reject);

    input.on('data', function (chunk) {
      hash.update(chunk);
    });

    input.on('close', function () {
      resolve(hash.digest('hex'));
    });
  });
}


async function getLocation()
{
  if(document.location.href.includes("Store"))
  {
    resolve("store");
  }
  else if(document.location.href.includes("index"))
  {
    resolve("menu");
  }
}

async function CheckLocalAnmeldung()
{
  return new Promise(async function(resolve, reject) {
    if(window.localStorage.keep == "true")
    {
      let locuser = window.localStorage.username;
      let lockey = window.localStorage.key_;
      let dbdata = await dat(`SELECT * FROM users WHERE username = '${locuser}'`);
      let dbkey = await md5(dbdata[0].username+dbdata[0].password).toString();
      console.log(dbdata[0].username, locuser, dbkey, lockey);
      if(dbdata[0].username == locuser && dbkey === lockey)
      {
        Anmelden(locuser, undefined, undefined, true);
        resolve(true);
      }
      else {
        alert("Konnte nicht anmelden! Falscher User oder Key");
        window.localStorage.key_ = null;
        window.localStorage.username = null;
        resolve(false);
      }
    }
    else {
      resolve(false);
    }
});
}

async function Abmelden()
{
  window.localStorage.key_ = null;
  window.localStorage.username = null;
  window.localStorage.keep = false;

  document.getElementById("AnmeldeButton").innerHTML = "Anmelden";
  document.getElementById("AnmeldeButton").setAttribute("onClick", "Abmelden();");
  document.getElementById("AnmeldeButton").setAttribute("onClick", "Anmelden(document.getElementById('username').value, document.getElementById('password').value);");
  document.getElementById("WelcomeUser").innerHTML = "";

}


async function CheckAnmelden(username, password, key)
{
  return new Promise(async function(resolve, reject) {
    let userdata = await dat("SELECT * FROM users WHERE username = 'ven'");
    password = await md5(password).toString();
    if(key != undefined)
    {
      let userkey = await md5(userdata[0].username+userdata[0].password).toString();
      if(lockey == userkey)
      {
        resolve(userkey);
      }
    }
    resolve(password == userdata[0].password);
  });
}


async function ReadFile()
{
  return new Promise(async function(resolve, reject)
  {
    //console.log("1");
    await fs.exists("./location", async function(exists) {
      if(exists)
      {
        //console.log("2");
        await fs.readFile("./location", "utf8", function(err, data)
        {
          //console.log("3");
          if(err) throw err;
          resolve(data);
        });
      }
      else {
        reject("No file");
      }
    });
  });
}


async function CheckStoreAnmeldung()
{
  return new Promise(async function(resolve, reject) {
    let username = window.localStorage.username;
    if(username == undefined || username == "null" || username == null)
    {
      alert("Es ist kein User angemeldet! Bitte melden Sie sich an!");
      GoTo("index");
    }
    let data = await dat(`SELECT * FROM users WHERE USERNAME = '${username}'`);
    let lockey = await md5(data[0].username+data[0].password);
    if(lockey == window.localStorage.key_ && username == data[0].username)
    {
      //alert(`Willkommen, ${username}`);
      document.getElementById("WelcomeUser").innerHTML = `Willkommen, ${username}`;
    }
    else {
      alert("Ungültiger Login");
    }

    //if(window.localStorage.username)
  });
}

async function getAllItems()
{
  return new Promise(async function(resolve, reject) {
    let av_games = await dat("SELECT * FROM GAMES");
    for (var i = 0; i < av_games.length; i++) {
      addGameToList(av_games[i].GAME, av_games[i].VERSION, av_games[i].VERFÜGBAR, av_games[i].DESCRIPTION, av_games[i].DOWNLOADS);
    }
  });
}

async function addGameToList(GAME, VERSION, VERFÜGBAR, DESCRIPTION, DOWNLOADS)
{
  alert(`${GAME}\n${VERSION}\n${VERFÜGBAR}\n${DESCRIPTION}\n${DOWNLOADS}`);
}

async function GoTo(location)
{
  await UpdateLocation(location).then(function() {
    reload();
  });
}

async function UpdateLocation(location)
{

  return new Promise(async function(resolve, reject) {
    if(await fs.existsSync("location"))
    {
      await fs.promises.unlink("location");
    }

    if(location.includes("html"))
    {
      await fs.writeFileSync("location", `./${location}`, { encoding: "utf8" });
    }
    else {
      await fs.writeFileSync("location", `./${location}.html`, { encoding: "utf8" });
    }

    resolve(true);
  });
}



async function Anmelden(username, password, key, keychecked)
{
  return new Promise(async function(resolve, reject) {
    console.warn(password);
    if(!keychecked)
    {
      if(await CheckAnmelden(username, password))
      {
        window.localStorage.username = username;
        window.localStorage.key_ = await md5(username+await md5(password));
        window.localStorage.keep = document.getElementById("keepLogin").checked;

        document.getElementById("AnmeldeButton").innerHTML = "Abmelden";
        document.getElementById("AnmeldeButton").setAttribute("onClick", "Abmelden();");
        document.getElementById("password").value = "";

        document.getElementById("username").value = username;
        document.getElementById("WelcomeUser").innerHTML = `Willkommen, ${username}`;
        //alert(`Willkommen, ${username}`);
        resolve(true);
      }
      else {
        alert("Konnte nicht anmelden! Benutzername oder Passwort falsch");
        resolve(false);
      }
    }
    else {
      document.getElementById("AnmeldeButton").innerHTML = "Abmelden";
      document.getElementById("AnmeldeButton").setAttribute("onClick", "Abmelden();");
      document.getElementById("password").value = "";
      document.getElementById("username").value = username;
      document.getElementById("WelcomeUser").innerHTML = `Willkommen, ${username}`;
      //alert(`Willkommen, ${username}`);
      resolve(true);
    }

  });
}
_getBuild();

async function _getBuild()
{
  App.Build = await getBuild();
}

// async function getBuild()
// {
//     return new Promise(async function(resolve, reject) {
//       let tmp = new Date();
//       let tmp_Build;
//       let tmp_Date = tmp.getUTCFullYear().toString().slice(2, 4);
//
//       if(tmp.getUTCMonth() <=9)
//       {
//         tmp_Date+="0";
//       }
//       tmp_Date+=tmp.getUTCMonth()+1;
//       if(tmp.getUTCDate() <=9)
//       {
//         tmp_Date+="0";
//       }
//       tmp_Date+=tmp.getUTCDate();
//
//       if(tmp.getUTCMinutes() > 45)
//       {
//         tmp_Build=tmp_Date+tmp.getUTCHours()+2;
//       }
//       else {
//         tmp_Build=tmp_Date+tmp.getUTCHours()+1;
//       }
//       resolve(tmp_Date, tmp_Build);
//     });
// }
async function getBuild()
{
      let tmp = new Date();
      let tmp_Build;
      let tmp_Date = tmp.getUTCFullYear().toString().slice(2, 4);

      if(tmp.getUTCMonth() <=9)
      {
        tmp_Date+="0";
      }
      tmp_Date+=tmp.getUTCMonth()+1;
      if(tmp.getUTCDate() <=9)
      {
        tmp_Date+="0";
      }
      tmp_Date+=tmp.getUTCDate();

      if(tmp.getUTCMinutes() >= 45)
      {
        tmp_Build= tmp_Date+tmp.getUTCHours()-(tmp.getTimezoneOffset()/60)+1;
      }
      else {
        tmp_Build= tmp_Date+tmp.getUTCHours()-(tmp.getTimezoneOffset()/60);
      }
      return([tmp_Date, tmp_Build]);
}
