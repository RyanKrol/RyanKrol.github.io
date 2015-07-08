//because of recursive calls to functions i need to store some variables globally
var returnBoolean = false;
var nextPageToken = undefined;
var requestURL = "";
var apiKey        = 'AIzaSyAILBP5kYFfluEpZReamdHDFM68dtLEWro';

var videoIDs          = []; //an array of the video IDs
var thumbnails        = []; //an array of the sources for the thumbnails
var videoTitles       = []; //an array of the video titles
var counters          = []; //an array of indexes, this will change for the randomise function
var normaliseCounters = []; //an array of the standard indexes - just 0-x in order
var counter           = 0;
var skipPoints        = []; //an array of points where a video has been made private or deleted in the original playlist
var player;                 //the variable that holds the video player
var enlargedVideo     = false;

$(document).ready(function(){
    var arrayOfBackgrounds = [["#F1F2B5","#135058"],["#7b4397","#dc2430"],["#8e9eab","#eef2f3"],["#136a8a","#267871"],["#00bf8f","#001510"],
                              ["#ffb347","#ffcc33"],["#43cea2","#185a9d"],["#D38312","#A83279"],["#73C8A9","#373B44"],["#83a4d4","#b6fbff"],
                              ["#52c234","#061700"],["#fe8c00","#f83600"],["#556270","#FF6B6B"],["#9D50BB","#6E48AA"],["#B3FFAB","#12FFF7"],
                              ["#DAD299","#B0DAB9"],["#215f00","#e4e4d9"],["#3D7EAA","#FFE47A"],["#1CD8D2","#93EDC7"],["#134E5E","#71B280"],
                              ["#2BC0E4","#EAECC6"],["#085078","#85D8CE"],["#1D976C","#93F9B9"],["#4CB8C4","#3CD3AD"],["#1A2980","#26D0CE"],
                              ["#F09819","#EDDE5D"],["#3CA55C","#B5AC49"],["#348F50","#56B4D3"]];



    var randomNumber = Math.round(Math.random()*(arrayOfBackgrounds.length-1));

    var firstColour  = arrayOfBackgrounds[randomNumber][0];
    var secondColour = arrayOfBackgrounds[randomNumber][1];
    var thirdColour  = "#" + parseInt((parseInt(firstColour.split('#')[1]) + parseInt(secondColour.split('#')[1]))/2);

    //according to http://stackoverflow.com/questions/17487716/does-css-automatically-add-vendor-prefixes
    //JQuery adds the vendor prefixes for you, so there's no need to add multiple different backgrounds
    var gradientBackground = "-webkit-gradient(linear, left top, right top, from("+firstColour+"), to("+secondColour+"))"
    $('body').css({
        "background" : gradientBackground
    });

    $('#loader').css("border-top-color", firstColour);
    $('#loader2').css("border-top-color", thirdColour);
    $('#loader3').css("border-top-color", secondColour);
});



//so all of the validation looks fine at this point
function validateInput(input) {

    //checks to see if the browser supports storage
    if(typeof(Storage) != "undefined") {
        //if it does store the URL
        sessionStorage.playlistURL      = input.playlistURL.value;
        sessionStorage.currentlyPlaying = "";
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
        $('body').switchClass("loaded", "loading");
        $('input').css("z-index", "0");
        getPlaylistData(input);
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
    requestURL          = baseURL.concat(sessionStorage.playlistID).concat('&key=').concat(apiKey);

    //this is where i store certain bits of data for the next stage of the website
    sessionStorage.playlistItems      = "";
    sessionStorage.tempPlaylistItems  = "";
    sessionStorage.thumbnails         = "";
    sessionStorage.titles             = "";
    sessionStorage.runTimes           = "";
    sessionStorage.skipPoints         = "";

    //will store all of the playlist data in session storage
    var returnBoolean = apiInteraction();

    //i check here for the value of a boolean, if the previous API interaction was successful, the value will be true
    //elsewise it'll be false, and the following alert message will be shows, and the textbox will highlight all of what's in it

    //*** need to put some error checking in there ***

    /*if(!returnBoolean){
        alert("Sorry, the playlist you entered is not available on YouTube");
        highlightText(input.playlistURL);
    }*/

    //the boolean is sent back up the chain to tell the form whether to proceed or not
    //return returnBoolean;
}

function apiInteraction(){

    // the modified URL is used to include the page token, i save the base URL for subsequent calls
    var modifiedURL = requestURL;

    // if there is a next page token, append it to the end of the URL so that i can get the data
    if(nextPageToken != undefined){
        modifiedURL   = modifiedURL.concat("&pageToken=").concat(nextPageToken);
    }

    //i request the data from the API using an XMLHTTPRequest item that is handled using jquery's ajax method
    $.ajax({
        //stops the other events on the page from firing
        async    : true,
        //the URL is what we built up earlier
        url      : modifiedURL,
        // the method of ajax i'm using is get
        type     : 'GET',
        // the function that will be carried out on success
        success  : function(data) {
            parseAllTheData(data);
        }
    });
}

//a small function to highlight all of the text inside a text input field
function highlightText(textInput){
    textInput.setSelectionRange(0, textInput.value.length);
}

/* window.location.href = "http://www.google.com"; */

function parseAllTheData(data) {

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
        apiInteraction();
    } else {
        $('body').switchClass("loading", "loaded");
        console.log(sessionStorage.playlistItems);
        console.log(sessionStorage.thumbnails);
        console.log(sessionStorage.titles);
        console.log(sessionStorage.runTimes);
        console.log(sessionStorage.currentlyPlaying);
        console.log(sessionStorage.skipPoints);
        restylePage();
        extractData();
        setupList();

        // sessionStorage.playlistItems     the video ids
        // sessionStorage.thumbnails        the URLs of the thumbnails
        // sessionStorage.titles            the titles of the videos
        // sessionStorage.runTimes          the run time of each video, in seconds
        // sessionStorage.currentlyPlaying  if a song is currently playing, this will be the same value as the index

        //window.location.href = "playlistControl.html";
        //call something to say that we're done and moving on now
    }
}

function getRunTime(){
    var baseURL = 'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=';
    var requestURL = baseURL.concat(sessionStorage.tempPlaylistItems).concat('&key=').concat(apiKey);

    $.ajax({
        //stops the other events on the page from firing
        async    : true,
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

// a small function to extract the data from the session storage
function extractData(){
    var i = 0;
    var skipIndex;
    if(sessionStorage.currentlyPlaying != undefined)
        counter = parseInt(sessionStorage.currentlyPlaying);

    videoIDs     = sessionStorage.playlistItems.split("%2C+");
    thumbnails   = sessionStorage.thumbnails.split(" ");
    videoTitles  = sessionStorage.titles.split(",,,");
    runTimes     = sessionStorage.runTimes.split(" ");
    skipPoints   = sessionStorage.skipPoints.split(" ");

    { //this whole sequence is for the purpose of moving the currentlyPlaying index to where it should be
        //given the number of private or deleted videos in the playlist
        if(sessionStorage.currentlyPlaying != undefined)
            for(i = 0; i < skipPoints.length - 1; i++)
                if(skipPoints[i] < parseInt(sessionStorage.currentlyPlaying))
                    counter--;
    }

    { //this sequence is to remove the deleted or private videos from the list of videos we're going to work on
        skipIndex = videoIDs.indexOf('skip');
        while(skipIndex != (-1)){
            videoIDs.splice(skipIndex, 1);
            thumbnails.splice(skipIndex, 1);
            videoTitles.splice(skipIndex, 1);
            skipIndex = videoIDs.indexOf('skip');
        }
    }

    // creates an array of indexes
    for(i = 0; i < (videoIDs.length - 1); i++){
        counters.push(i);
    }

    // if you just make one array equal to the other it acts as a reference, meaning that if you change the value of counters
    // you also change the value of normaliseCounters. using the slice function copies one array starting from the first index
    normaliseCounters = counters.slice();
}

function restylePage(){
    $('.content').remove();

    var newDiv = document.createElement("div");
    newDiv.setAttribute("class", "listContainer");
    newDiv.setAttribute("id", "listContainer");
    $('body').after(newDiv);

    var ul = document.createElement("ul");
    ul.setAttribute("id", "videoList");
    document.getElementById('listContainer').appendChild(ul);

    newDiv = document.createElement("div");
    newDiv.setAttribute("id", "playerContainer");
    newDiv.setAttribute("style", "display: none;");
    $('body').after(newDiv);

    newDiv = document.createElement("div");
    newDiv.setAttribute("id", "player");
    document.getElementById('playerContainer').appendChild(newDiv);

}
