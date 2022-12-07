const AsciiTable = require("ascii-table/ascii-table");
const YouTube = require("youtube-sr").default;
const ytdl = require("ytdl-core");

module.exports = {

    isFloat: function(n) {
        return ((typeof n==='number')&&(n%1!==0));
    },
    log: function(content) {
        date_ob = new Date();
      
        date = date_ob.getDate().toString();
        month = date_ob.getMonth().toString();
        year = date_ob.getFullYear().toString();
      
        if(date.length === 1){date = "0" + date;};
        if(month.length === 1){month = "0" + month;};
        
        dmy = date + "/" + month + "/" + year;
      
       
        hms = date_ob.toLocaleTimeString();
      
        console.log(`[ ${dmy} | ${hms} ] ${content}`);
    },
    
    isURL: function (url) {
        if(!url) return false;
        var pattern = new RegExp('^(https?:\\/\\/)?'+
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
            '((\\d{1,3}\\.){3}\\d{1,3}))|' +
            'localhost' +
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
            '(\\?[;&a-z\\d%_.~+=-]*)?'+
            '(\\#[-a-z\\d_]*)?$', 'i');
        return pattern.test(url);
    },
    
    showTable: function(loaded){
        var table = new AsciiTable('Carregando......');
        table.setHeading("Commands","Events");
        for(let i=0; i<=Math.max(loaded.commands.length, loaded.events.length)-1; i++){
            table.addRow(loaded.commands[i], loaded.events[i]);
        };
        return table.render();
    },
    getUrl: async function (words){
        stringOfWords = words.join(" ");
        lookingOnYtb = new Promise(async (resolve) => {
            YouTube.search(stringOfWords, { limit: 1 })
                .then(result => {
                    resolve("https://www.youtube.com/watch?v=" + result[0].id);
                });
        });

        let link = await lookingOnYtb;
        return link;
    },
    play: function(song) {

        const utils = require("./utils");
        const serverQueue = queue.get("queue");

        if(!song){
            utils.log("Não há músicas na fila")
            serverQueue.voiceChannel.leave();
            return queue.delete("queue");
        }

        utils.log(`Começou a tocar a música: ${song.title}`)

        const dispatcher = serverQueue.connection.play(ytdl(song.url, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }));

        dispatcher.on('finish', () => {
            if(serverQueue.songs[0]) utils.log(`Terminei de tocar a música: ${serverQueue.songs[0].title}`);
            else utils.log(`Terminada a reprodução de todas as músicas, não há mais músicas na fila`);
            if(serverQueue.loop === false || serverQueue.skipped === true) serverQueue.songs.shift();
            if(serverQueue.skipped === true) serverQueue.skipped = false;
            utils.play(serverQueue.songs[0]);
        });

        dispatcher.on('error', error => {
            console.log(error)
        });

        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }
}