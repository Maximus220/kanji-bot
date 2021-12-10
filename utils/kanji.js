
module.exports = class Kanji{
    constructor(data){
        this.kanji = data.japanese[0].word;
        this.reading = data.japanese[0].reading;
        this.jlpt = data.jlpt[0];
        this.meaning = data.senses[0].english_definitions;
        this.type = data.senses[0].parts_of_speech[0];
        this.is_common = data.is_common;
    }
}