//because of recursive calls to functions i need to store some variables globally
var returnBoolean = false;
var nextPageToken = undefined;
var apiKey        = 'AIzaSyAILBP5kYFfluEpZReamdHDFM68dtLEWro';

// this function is what is used to validate what the user puts into the text box. first it checks to see if the URL is in the right format,
// and if it is, a call to the API is then sent to see if the playlist exists on YouTube's servers. if it does, it will then proceed to the next page
function validateInput(input) {

    //checks to see if the browser supports storage
    if(typeof(Storage) != "undefined") {
        //if it does store the URL
        sessionStorage.playlistURL = input.playlistURL.value;
        // has to be one because if the value changes so i'll need to take one away. so rather than checking if the bit is set, i just set it to 1
        sessionStorage.currentlyPlaying = 1;
    } else {
        //else alert the user and suggest a browser that will support it
        alert("Sorry, session storage is not supported in your browser, try our website on Google Chrome!");
        return false;
    }

    //validate the input by searching for a string that should be present
    var subreddit = sessionStorage.playlistURL.search('listentothis');
    var thing = sessionStorage.playlistURL.search('www.youtube.com/');
    var secondCheck = sessionStorage.playlistURL.search('list=');
    var currentlyPlayingCheck = sessionStorage.playlistURL.search('watch');
    if(currentlyPlayingCheck != (-1)){
        var currentIndexCheck = sessionStorage.playlistURL.search('index');
        if(currentIndexCheck != (-1)){
            sessionStorage.currentlyPlaying = parseInt(sessionStorage.playlistURL.split("index=")[1].split("&")[0]);
        }
    }
    //if the search is invalid '-1' will be returned and the user should be alerted
    if ( ( (thing == (-1)) || (secondCheck == (-1)) ) && (subreddit == (-1)) ){
        alert("The playlist must be from YouTube and have a playlist ID, i.e. this will not work on your history.\n An example URL would be: https://www.youtube.com/playlist?list=PLMNUXrGDzNpA_HRobzHdGpOfSb4O2OUlB");

        // highlights the text in the textbox
        highlightText(input.playlistURL);
        //stop the form from submitting
        return false;
    } else if (subreddit != (-1)){
        return subredditBuild();
    } else {
        // below i split the URL twice, once on the 'playlist?list=' to get the ID and anything else, then on the ampersand to get rid of any further arguments
        sessionStorage.playlistID = sessionStorage.playlistURL.split("list=")[1].split("&")[0];
        return getPlaylistData(input);
    }
}

// all temp shit
function subredditBuild(){
    var getRequestURL   = 'http://www.reddit.com/r/listentothis/hot.json'; //?limit = x

    //this is where i store certain bits of data for the next stage of the website
    sessionStorage.playlistItems      = "";
    sessionStorage.tempPlaylistItems  = "";
    sessionStorage.thumbnails         = "";
    sessionStorage.titles             = "";
    sessionStorage.runTimes           = "";
    sessionStorage.skipPoints         = "";

    var tempURLHolder = '';

    $.ajax({
        //stops the other events on the page from firing
        async    : false,
        //the URL is what we built up earlier
        url      : getRequestURL,
        // the method of ajax i'm using is get
        type     : 'GET',
        // the function that will be carried out on success
        success  : function(data) {
            console.log(data);
            $.each(data.data.children, function (key, val){
                console.log(val.data.url);
                tempURLHolder = val.data.url;
                var checkIfYoutubelink = tempURLHolder.search("youtube");
                var watchYoutubeCheck = tempURLHolder.search("watch\\?v");

                if( (checkIfYoutubelink != (-1)) && (watchYoutubeCheck != (-1)) ){
                    videoId = tempURLHolder.split('watch?v=')[1].split('&')[0];
                    console.log(videoId);
                    sessionStorage.playlistItems      = sessionStorage.playlistItems.concat(videoId).concat("%2C+");
                    sessionStorage.thumbnails         = sessionStorage.thumbnails.concat(" ");
                    sessionStorage.titles             = sessionStorage.titles.concat(val.data.title).concat(",,,");
                    console.log('a youtube thing');
                } else {
                    // if the video is private or deleted, the counters still need something to represent it, or the ordering get's dodgey
                    sessionStorage.playlistItems      = sessionStorage.playlistItems.concat('skip').concat("%2C+");
                    sessionStorage.thumbnails         = sessionStorage.thumbnails.concat('skip').concat(" ");
                    sessionStorage.titles             = sessionStorage.titles.concat('skip').concat(",,,");
                    console.log('not a youtube thing');
                }
            });
        }
    });
    console.log(sessionStorage.playlistItems);
    return true;

}

// a function to get the information from YouTube's API. it takes in the form from the previous function, that it'll use later on to do some
// fancy highlighting
function getPlaylistData(input){
    //this is how i build up the URL that then enables me to request data from the youtube API. the base URL is just how the URL begins
    //the API key is specific to this website, and it's just some security to check who the data is going to
    //the getRequestURL is then the whole thing together with the playlistID that the user should have provided
    var baseURL         = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=49&playlistId=';
    var getRequestURL   = baseURL.concat(sessionStorage.playlistID).concat('&key=').concat(apiKey);

    //this is where i store certain bits of data for the next stage of the website
    sessionStorage.playlistItems      = "";
    sessionStorage.tempPlaylistItems  = "";
    sessionStorage.thumbnails         = "";
    sessionStorage.titles             = "";
    sessionStorage.runTimes           = "";
    sessionStorage.skipPoints         = "";

    // will store all of the playlist data in session storage
    apiInteraction(getRequestURL);

    // i check here for the value of a boolean, if the previous API interaction was successful, the value will be true
    // elsewise it'll be false, and the following alert message will be shows, and the textbox will highlight all of what's in it
    if(!returnBoolean){
        alert("Sorry, the playlist you entered is not available on YouTube");
        highlightText(input.playlistURL);
    }

    // the boolean is sent back up the chain to tell the form whether to proceed or not
    return returnBoolean;
}

// a small function to highlight all of the text inside a text input field
function highlightText(textInput){
    textInput.setSelectionRange(0, textInput.value.length);
}

function apiInteraction(requestURL){

    // the modified URL is used to include the page token, i save the base URL for subsequent calls
    var modifiedURL = requestURL;

    // if there is a next page token, append it to the end of the URL so that i can get the data
    if(nextPageToken != undefined){
        modifiedURL   = modifiedURL.concat("&pageToken=").concat(nextPageToken);
    }

    //i request the data from the API using an XMLHTTPRequest item that is handled using jquery's ajax method
    $.ajax({
        //stops the other events on the page from firing
        async    : false,
        //the URL is what we built up earlier
        url      : modifiedURL,
        // the method of ajax i'm using is get
        type     : 'GET',
        // the function that will be carried out on success
        success  : function(data) {

            // sets the global variable to the next page token in the returned data
            nextPageToken = data.nextPageToken;

            //i go through each of the items in the JSON response and build up a string of video ID's and thumbnails
            $.each(data.items, function (key, val){
                //the following if statement will stop the errors occuring when the video is made private
                if((val.snippet.title != "Private video") && (val.snippet.title != "Deleted video")){
                    sessionStorage.tempPlaylistItems  = sessionStorage.tempPlaylistItems.concat(val.snippet.resourceId.videoId).concat("%2C+");
                    sessionStorage.thumbnails         = sessionStorage.thumbnails.concat(val.snippet.thumbnails.default.url).concat(" ");
                    sessionStorage.titles             = sessionStorage.titles.concat(val.snippet.title).concat(",,,");
                } else {
                    // if the video is private or deleted, the counters still need something to represent it, or the ordering get's dodgey
                    sessionStorage.tempPlaylistItems  = sessionStorage.tempPlaylistItems.concat('skip').concat("%2C+");
                    sessionStorage.thumbnails         = sessionStorage.thumbnails.concat('skip').concat(" ");
                    sessionStorage.titles             = sessionStorage.titles.concat('skip').concat(",,,");
                    sessionStorage.skipPoints         = sessionStorage.skipPoints.concat(val.snippet.position).concat(' ');
                }
            });

            // uses the list of video ids instead of individual ids to get the runtime in an array, this call can only take 49 items however
            // so i use a temporary array to store the video ids, which then get put in the final array. the temporary array is then cleared
            // for any follow up calls
            getRunTime();

            // appending the temporary array onto the final and resetting the temporary array
            sessionStorage.playlistItems     = sessionStorage.playlistItems.concat(sessionStorage.tempPlaylistItems);
            sessionStorage.tempPlaylistItems = "";

            // if there is a next page token in the returned data, then call this function with the base url, the token
            // will be stored in the global variable of this file
            if(nextPageToken != undefined){
                apiInteraction(requestURL);
            }

            // ensures that the form can then submit from this point
            returnBoolean = true;
        }
    });

}

function getRunTime(){
    var baseURL = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=';
    var requestURL = baseURL.concat(sessionStorage.tempPlaylistItems).concat('&key=').concat(apiKey);

    $.ajax({
        //stops the other events on the page from firing
        async    : false,
        //the URL is what we built up earlier
        url      : requestURL,
        // the method of ajax i'm using is get
        type     : 'GET',
        // the function that will be carried out on success
        success  : function(data) {

            // gets the time from the youtube api, splits it all up according to the format, and then converts the minutes
            // to seconds, adds that to the seconds, and then stores it in sessionStorage

            $.each(data.items, function(key, val){
                var seconds      = 0;
                var minutes      = 0;
                var timeReturned = val.contentDetails.duration;

                if(timeReturned.search('M') != -1){
                    minutes      = (parseInt(timeReturned.split("PT")[1].split('M')[0])*60);

                    if(timeReturned.search('S') != -1){
                        seconds      = parseInt(timeReturned.split("M")[1].split('S')[0]);
                    }

                } else {
                    seconds      = parseInt(timeReturned.split("PT")[1].split('S')[0]);
                }
                var time         = minutes + seconds;

                sessionStorage.runTimes = sessionStorage.runTimes.concat(time).concat(" ");
            });
        }
    });
}
