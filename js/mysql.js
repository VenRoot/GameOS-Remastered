const mysql = require('mysql2');
const {app, BrowserWindow} = require('electron').remote;

const con = mysql.createConnection({
  host: "ven.prow.li",
  user: "ven",
  password: "*****",
  database: "vendb",
  port: "3306"
});

con.on('error', function(err)
{
  console.warn(err);
});
con.on('err', function(err)
{
  console.warn(err);
});


con.connect(function(err) {
  if (err) throw err;
  console.log("MySQL: Connected to prow.li!");
  con.query("USE vendb;", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
});

async function reload()
{
  app.relaunch(true);
  app.exit();
}

function checkReload(e)
{
  console.log(e.keyCode);
  if(e.ctrlKey && e.keyCode == 82)
  {
    //alert("Wird neu geladen");
    app.relaunch();
    app.exit();
  }
  if(e.keyBode == 17 && e.keyCode == 82)
  {
    //alert("Wird neu geladen");
    app.relaunch();
    app.exit();
  }
}

async function dat4(Befehl) {
  console.log(Befehl);
  con.query(Befehl, async function (err, result) {
    await Sleep(100);
    if (err) throw err;
    return result;
  });

}



async function dat(Befehl) {

  return new Promise((resolve, reject) => {
    con.query(Befehl, async function (err, result) {
      if (err) throw err;
      resolve(result);
    });
  });
}

async function dat3(Befehl)
{
  return new Promise((resolve, reject) => {
    con.connect(function(err) {
      if (err) throw err;
      console.log("MySQL: Connected to server!");
      con.query("USE vendb;", function (err, result) {
        if (err) throw err;
        console.log(result);
        con.query(Befehl, async function (err, result) {
          if (err) throw err;
          con.end();
          resolve(result);
        });
      });
    });

  });
}
