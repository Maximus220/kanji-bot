var fs = require('fs');
const path = require('path');
global.fetch = require('node-fetch');
const { createCanvas, registerFont } = require('canvas');

const fontPath = path.join(__dirname, 'fonts/'); //Path to font folder
const credPath = path.join(__dirname, 'json/cred.json'); //Path to font folder
const commonWordsPath = path.join(__dirname, 'json/commonWords.json'); //Path to common words
const kanjiPath = './kanjis';
global.fonts = []; //List of fonts which will contain all the font families when loaded
global.cred = JSON.parse(fs.readFileSync(credPath, 'utf8'));

var commonWords = JSON.parse(fs.readFileSync(commonWordsPath, 'utf8')).commonWords;

const { tweetKanji } = require('./utils/twitter');
const Kanji = require('./utils/kanji');
const { getFromJisho } = require('./utils/getFromJisho');

const bgColors = [
    "#82cdcd",
    "#f0d859", //Ugly yellow
    "#82cda8",
    "#82a8cd",
    "#cd8282",

    "#b74b4b",
    "#4b81b7",
    "#93d3d3",
    "#4bb7b7",
    "#4bb781"
]

//DEBUG

const TWEET_IMAGE = true;
const COUNTDOWN = 1000 * 60 * 60; //each hour
const SAVE_IMAGE = true;
const LAUNCH_ON_START = true;
const FONT_NAME = "K_Gothic";

const K = 2; //Scaling (e.g. 2 -> 2000x2000)

//
//
//

var loadFont = new Promise((resolve, reject)=>{ //Promise that loads fonts (check if promise is really useful or if function'd be better in that specific case)
    fs.readdir(fontPath, function(err, files){
        if(err){
            console.log('Unable to load fonts '+ err);
        }else{
            files.forEach(element => { //Load fonts
                if(element.split('.')[1].includes('otf') || element.split('.')[1].includes("ttf")){ 
                    fonts.push(element.split('.').slice(0, -1).join('.'));
                    registerFont(fontPath + element, { family: element.split('.').slice(0, -1).join('.') });
                }
            });
            console.log(fonts);
        }
    });
    resolve('Fonts loaded!');
});

async function generateKanji(){
    let tempValue = true;
    do{
        let word = getRand(0, commonWords.length-1);
        console.log(commonWords[word]);
        let jpDictionary = await getFromJisho(commonWords[word]);

        if(jpDictionary.data.length>0){ //If no restart loops
            var kanji = new Kanji(jpDictionary.data[0]);
            console.log(kanji);

            tempValue = false; //Break loop
        }

    }while(tempValue)

    kanjiCanvas(kanji, FONT_NAME);
    //saveCanvas(kanji, kanjiImg);


}

if(LAUNCH_ON_START) generateKanji();
if(COUNTDOWN){
    setInterval(function(){
        generateKanji();
    }, COUNTDOWN);
}


async function kanjiCanvas(kanji, font){
    //Fonts
    if(fonts.length == 0) await loadFont;

    //Prepare image
    canvas = createCanvas(1000 * K, 1000 * K);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColors[getRand(0,bgColors.length-1)];
    ctx.fillRect(0,0,canvas.width, canvas.height);

    //Add texts
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';

    if(kanji.kanji){
        ctx.font = 'bold '+(175 * K)+'px ' + font;
        ctx.fillText(kanji.kanji, canvas.width/2, canvas.height/2 - 100 * K);

        ctx.font = 'bold '+(100 * K)+'px ' + font;
        ctx.fillStyle = '#f5f5f5';
        ctx.fillText(kanji.reading, canvas.width/2, canvas.height/2 + 50 * K);
    }else{
        ctx.font = 'bold '+(175 * K)+'px ' + font;
        ctx.fillText(kanji.reading, canvas.width/2, canvas.height/2 - 100 * K);
    }

    var lines = getLines(ctx, kanji.meaning.join(", "), 800 * K, font);
    lines[0].forEach((line,i) =>{
        ctx.fillText(line, canvas.width/2, 
            canvas.height/2 + 
            200 * K + 
            ((lines[1] + 10 * K)*i) //Line size + 10 * placing (line index)
        );
    });

    ctx.font = 'bold '+(75 * K)+'px ' + font;
    ctx.fillStyle = '#262626';
    ctx.fillText(kanji.type, canvas.width/2, canvas.height/2 - 375 * K);

    //Tweet kanji
    if(TWEET_IMAGE) tweetKanji(canvas);

    //Save image
    if(SAVE_IMAGE){
        if(!fs.existsSync(kanjiPath)){
            fs.mkdirSync(kanjiPath);
        }
        var buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(kanjiPath+"/"+kanji.meaning[0]+".png", buffer);
    }
}

function getLines(ctx, text, maxWidth, font) {
    ctx.font = 'bold '+(100 * K)+'px ' + font;
    let it=0;
    do{
        if(it!==0) ctx.font = 'bold '+(100 * K-(10 * K*it))+'px ' + font;
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        it++;
    }while(lines.length>3)
    return [lines, (100 * K-(10 * K*it))];
}

function getRand(min, max){ //Included
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



