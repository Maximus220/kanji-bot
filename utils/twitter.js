var Twit = require('twit');

var T = new Twit({ //Connect to Twitter API
    consumer_key: cred.twitter.consumer_key,
    consumer_secret: cred.twitter.consumer_secret,
    access_token: cred.twitter.access_token,
    access_token_secret: cred.twitter.access_token_secret
});


module.exports.tweetKanji = function (canvas){
    let temp = canvas.toBuffer().toString('base64');
    return new Promise(function(resolve, reject){
        T.post('media/upload', {media_data: temp}, function(err, data, response){
            if(err){
                console.log('I failded to upload - [Error] - ' + err);
                reject(1);
            }else{
                T.post('statuses/update', {media_ids: new Array( data.media_id_string )},function( err, data, response) {
                    if (err){
                        console.log( 'I failded to upload - [Error] - ', err );
                        reject(1);
                    }
                    else{
                        console.log('Posted a kanji!');
                        resolve(0);
                    }
                });
            }
        });
    });
}
