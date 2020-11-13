const md5 = require('md5');
const process = require('process');
const https = require('https');

let url = "https://ven.prow.li/val.json";

async function getList()
{
  return new Promise(function(resolve, reject) {
    https.get(url,(res) => {
        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
              let json = JSON.parse(body);
              //console.log(json);
              resolve(json);
            } catch (error) {
                console.error(error.message);
                reject();
            };
        });

    }).on("error", (error) => {
        console.error(error.message);
        reject();
    });

  });
}

async function getHash(version, build)
{
  return new Promise(async function(resolve, reject) {
    let obj = await getList().catch(function(){
      resolve("Error");
    });

    for (var i = 0; i < obj.length; i++){
      // look for the entry with a matching `code` value
      if (obj[i].version == version && obj[i].build == build){
         resolve(obj[i]);
      }
    }
    reject("Nichts gefunden");
  });
}

async function main(version, build)
{
  return new Promise(async function(resolve, reject) {
    let x = await getHash(version, build).catch(function (){
      console.error("Ungültig");
      process.exit(1);
    });
      console.log(x.hash);
      process.exit(0);
    });

}

main(process.argv[2], process.argv[3]);
