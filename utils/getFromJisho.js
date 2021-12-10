module.exports.getFromJisho = async function (word){
    var response = await fetch('https://jisho.org/api/v1/search/words?keyword='+word);
    var data = await response.json();

    return data;
}