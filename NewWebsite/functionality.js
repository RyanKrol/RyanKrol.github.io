//because of recursive calls to functions i need to store some variables globally
var returnBoolean = false;
var nextPageToken = undefined;
var apiKey        = 'AIzaSyAILBP5kYFfluEpZReamdHDFM68dtLEWro';

$(document).ready(function(){
    var arrayOfBackgrounds = [["#D1913C", "#FFD194"],
                              ["#136a8a", "#267871"],
                              ["#517fa4", "#243949"],
                              ["#43cea2", "#185a9d"],
                              ["#360033", "#0b8793"],
                              ["#D38312", "#A83279"],
                              ["#70e1f5", "#ffd194"],
                              ["#780206", "#061161"],
                              ["#ADD100", "#7B920A"]];

    var randomNumber = Math.round(Math.random()*(arrayOfBackgrounds.length-1));

    var firstColour  = arrayOfBackgrounds[randomNumber][0];
    var secondColour = arrayOfBackgrounds[randomNumber][1];
    var thirdColour  = "#" + parseInt((parseInt(firstColour.split('#')[1]) + parseInt(secondColour.split('#')[1]))/2);

    //according to http://stackoverflow.com/questions/17487716/does-css-automatically-add-vendor-prefixes
    //JQuery adds the vendor prefixes for you, so there's no need to add multiple different backgrounds
    var stringThing = "-webkit-gradient(linear, left top, right top, from("+firstColour+"), to("+secondColour+"))"
    $('body').css("background", stringThing);

    $('#loader').css("border-top-color", firstColour);
    $('#loader2').css("border-top-color", thirdColour);
    $('#loader3').css("border-top-color", secondColour);

    if(typeof(Storage) != "undefined") {
        sessionStorage.backgroundClass = 'body'+randomNumber;
    } else {
        alert("Sorry, session storage is not supported in your browser, try our website on Google Chrome!");
    }
});



//so all of the validation looks fine at this point
function validateInput(input) {

    //checks to see if the browser supports storage
    if(typeof(Storage) != "undefined") {
        //if it does store the URL
        sessionStorage.playlistURL = input.playlistURL.value;
    } else {
        //else alert the user and suggest a browser that will support it
        alert("Sorry, session storage is not supported in your browser, try our website on Google Chrome!");
        return false;
    }

    //checks that the URL is from youtube
    var youtubeCheck = sessionStorage.playlistURL.search('www.youtube.com/');
    //checks that the link is of a playlist
    var playlistCheck = sessionStorage.playlistURL.search('list=');
    //checks to see if the user was playing a video in the playlist when the link was copied
    var currentlyPlayingCheck = sessionStorage.playlistURL.search('watch');

    //if the search is invalid '-1' will be returned and the user should be alerted
    if( (youtubeCheck == (-1)) || (playlistCheck == (-1)) ){
        alert("The playlist must be from YouTube and have a playlist ID, i.e. this will not work on your history.\n An example URL would be: https://www.youtube.com/playlist?list=PLMNUXrGDzNpA_HRobzHdGpOfSb4O2OUlB");

        //highlights the text in the textbox
        highlightText(input.playlistURL);
        //stop the form from submitting
        return false;
    } else {
        //if they were playing a video, find the index of the video they were playing
        if(currentlyPlayingCheck != (-1)){
            var currentIndexCheck = sessionStorage.playlistURL.search('index');
            //if there is an index, parse which index the video is at
            if(currentIndexCheck != (-1)){
                sessionStorage.currentlyPlaying = parseInt(splitOnTwo(sessionStorage.playlistURL, "index=", "&"));
            }
        }
        sessionStorage.playlistID = splitOnTwo(sessionStorage.playlistURL, "list=", "&")
        $('body').switchClass("standard", "loading");
        return false;
        //doesn't currently get the playlist data, this will happen once i have a loading screen in there
    }
}

//i use this pattern a couple of times so i'm having a function for it
function splitOnTwo(string, first, second){
    return string.split(first)[1].split(second)[0];
}

//a function to get the information from YouTube's API. it takes in the form from the previous function, that it'll use later on to do some
//fancy highlighting
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

    //will store all of the playlist data in session storage
    var returnBoolean = apiInteraction(getRequestURL);

    //i check here for the value of a boolean, if the previous API interaction was successful, the value will be true
    //elsewise it'll be false, and the following alert message will be shows, and the textbox will highlight all of what's in it
    if(!returnBoolean){
        alert("Sorry, the playlist you entered is not available on YouTube");
        highlightText(input.playlistURL);
    }

    //the boolean is sent back up the chain to tell the form whether to proceed or not
    return returnBoolean;
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

//a small function to highlight all of the text inside a text input field
function highlightText(textInput){
    textInput.setSelectionRange(0, textInput.value.length);
}
