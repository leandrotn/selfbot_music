const Discord = require("discord.js-selfbot");
const client = new Discord.Client();
const fs = require('fs');
const Enmap = require('enmap');
const utils = require('./utils');

// trata erros
process.on('unhandledRejection', e => {});
process.on('uncaughtException', e => {});
process.on('uncaughtRejection', e => {});

if (!process.env.TOKEN){
  try{
    const config = require("./config.json");
    global.config = {'token': config.token, 'prefix': config.prefix};
  } catch (e){
    console.error("Nenhum arquivo de configuração encontrado, crie-o ou use variáveis ​​de ambiente.");
    process.exit(1);
  };
} else{
  if (!process.env.PREFIX) process.env.PREFIX="//";
  global.config = {'token': process.env.TOKEN, 'prefix': process.env.PREFIX};
}
if (!process.env.ALLOWED){
  try {global.config.allowed=require("./allowed.json").allowed}
  catch (e){
    global.config.allowed=[]
  }
} else{
  global.config.allowed=process.env.ALLOWED
}

client.login(config.token)

utils.log("Logging in...");

/* ----------------------------------------------- */

global.queue = new Map();
client.commands = new Enmap();

/* ----------------------------------------------- */

var loaded = {events: [], commands: []};

var promise = new Promise((resolve) => {
  fs.readdir('./events/', (err, files) => {
    if (err) return console.error;
    files.forEach(file => {
      if (!file.endsWith('.js')) return;
      const evt = require(`./events/${file}`);
      let evtName = file.split('.')[0];
      loaded.events.push(evtName)
      client.on(evtName, evt.bind(null, client));
    });
    resolve();
  });
});


fs.readdir('./commands/', async (err, files) => {
  if (err) return console.error;
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    let props = require(`./commands/${file}`);
    props.names.list.forEach(name => {
      client.commands.set(name, props);
    })
    let cmdName = file.split('.')[0];
    loaded.commands.push(cmdName)
  });
  promise.then(() => {utils.log(`Tabela de comandos e eventos :\n${utils.showTable(loaded)}`)});
});


/* ----------------------------------------------- */
