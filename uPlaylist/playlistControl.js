// by the time this script is executed, there should be certain variables already stored in the session storage, such as:
// sessionStorage.playlistItems     the video ids
// sessionStorage.thumbnails        the URLs of the thumbnails
// sessionStorage.titles            the titles of the videos
// sessionStorage.runTimes          the run time of each video, in seconds
// sessionStorage.currentlyPlaying  if a song is currently playing, this will be the same value as the index

var videoIDs          = []; //an array of the video IDs
var thumbnails        = []; //an array of the sources for the thumbnails
var videoTitles       = []; //an array of the video titles
var counters          = []; //an array of indexes, this will change for the randomise function
var normaliseCounters = []; //an array of the standard indexes - just 0-x in order
var counter           = sessionStorage.currentlyPlaying - 1;
var skipPoints        = []; //an array of points where a video has been made private or deleted in the original playlist
var player;                 //the variable that holds the video player
var enlargedVideo     = false;

// create the youtube player to host the videos in the playlist
function onYouTubePlayerAPIReady() {
    // extracts the data from the session storage and initialises a few other useful variables
    extractData();
    skipPointsCheck();

    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: videoIDs[counter],
      playerVars: { 'controls': 0, 'modestbranding': 1, 'showinfo': 0, 'autoplay': 1 }, //change the autoplay thing here
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
}

// when the player is successfully loaded to the screen, start playing the first video
function onPlayerReady(event) {
    setupList(counter);

    // this has to be done because the jquery methods that i want to use will look at the html first and change their functionality
    // according to what i want to do. for instance i want to make certain elements draggable, but that first requires them to be on the page
    // so i have to therefore include the script AFTER these elements have been created in the list as follows:
    var script = document.createElement('script');
    script.src = "supplementaryJQuery.js";
    document.getElementsByTagName('head')[0].appendChild(script);
    changePosition(counter);
}

// a small function to extract the data from the session storage
function extractData(){
    var i = 0;
    var skipIndex;
    console.log(sessionStorage.playlistItems);

    videoIDs     = sessionStorage.playlistItems.split("%2C+");
    thumbnails   = sessionStorage.thumbnails.split(" ");
    videoTitles  = sessionStorage.titles.split(",,,");
    runTimes     = sessionStorage.runTimes.split(" ");
    skipPoints   = sessionStorage.skipPoints.split(" ");

    console.log(skipPoints);
    skipIndex = videoIDs.indexOf('skip');

    while(skipIndex != (-1)){
        videoIDs.splice(skipIndex, 1);
        thumbnails.splice(skipIndex, 1);
        videoTitles.splice(skipIndex, 1);
        skipIndex = videoIDs.indexOf('skip');
    }

    // creates an array of indexes
    for(i; i < (videoIDs.length - 1); i++){
        counters.push(i);
    }

    // if you just make one array equal to the other it acts as a reference, meaning that if you change the value of counters
    // you also change the value of normaliseCounters. using the slice function copies one array starting from the first index
    normaliseCounters = counters.slice();
}

// this little procedure is used to see if the counter is passed skipped or deleted videos. if it is, it pulls the counter back one for every video
// not actually in the playlist, the counter is after. this is needed because the index in the url passed in from youtube still includes private and deleted
// videos in the indexing system
function skipPointsCheck(){
    var i = 0;

    for(; i< skipPoints.length; i++){
        if(skipPoints[i] != ""){
            if(counter > parseInt(skipPoints[i])){
                counter--;
            }
        }
    }
}

// when video ends move to the next video in the playlist
function onPlayerStateChange(event) {
    // when a video ends
    if(event.data === 0) {
        if(counter != counters.length - 1){
            // change the colour of the text to be that of the next video in the list
            changeTextColour(counter, counter+1);
            // change the source of the video to be that of the next video in the list
            setSource(counters[counter]);
        } else {
            changeTextColour(counter, undefined);
        }
    }
    console.log("state is changing");
}

// takes in the old playing video and changes the title to black, and then changes the next title to blue
function changeTextColour(oldCounter, newCounter){

    // SET A MAX CHECK
    if(newCounter < 0){
        newCounter = 0;
    }
    // gets the span tags that contain the title of the video
    var element = document.getElementsByClassName('videoTitle');

    if(newCounter != undefined){
        // the logic of this program requires me to set the counter to be the new counter here
        counter = newCounter;
    } else {
        counter = 0;
    }

    // changes the old value back to black to signify that it's no longer playing
    element[oldCounter].style.color = 'black';

    // i will pass in undefined as the new counter when nothing should be black, i.e. the playlist ends
    if(newCounter != undefined){
        // changes the new span tag to be a new colour to signify that it's currently playing
        element[(newCounter)].style.color = '#0436ff';
    }
}

// add a list argument in the below function, can pass in normalised or randomised indexes?
function setupList(blueCounter){

    // variables for the loop counter, and the outside <ul> tag
    var i     = 0;
    var list  = document.getElementById("videoList");

    // completely clears out any list items in the unordered list tag
    $("ul").empty();

    // the reason that this is based on the length - 1, is because the string is built up by appending and then adding a space,
    // and is then later split on the space. this means that the list is always 1 extra because of the last space being put in
    for(i; i < (videoIDs.length - 1); i++){

        // creates the div to contain the list element
        var elementContainer = createCustomElement('div',
        [['class', 'elementContainer'],
        ['style', 'position: relative; overflow-x: hidden; left: 0px; top: 0px;']]);

        // i make a new list element
        var listElement = createCustomElement('li',
            [['style', 'list-style-image: url('.concat(thumbnails[counters[i]]).concat('); list-style-position: inside;')],
            ['onclick', 'changeTextColour(counter, '.concat(i).concat('); setSource(').concat(counters[i]).concat('); changePosition('.concat(i).concat(');'))],
            ['class', 'listElement'],
            ['id', 'listItem'.concat(i)]]);

        // creating the span that holds the index of each video
        var spanIndex   = createCustomElement('span', [['class', 'index']]);

        // creating the span that holds the title of the video
        var spanTitle   = createCustomElement('span',
            [['class', 'videoTitle'],
            ['style', 'width: 580px'],
            ['id', 'titleID'.concat(counters[i])]]);

        // creating the span that holds the runtime
        var spanRuntime = createCustomElement('span', [['class', 'runTime']]);

        // creating the move icons on the right of the boxes, these will be used to move the videos around
        var moveIcon    = createCustomElement('i',
        [['class', 'fa fa-bars moveIcon'],
        ['onmousedown', 'this.style.cursor = "-webkit-grabbing"; this.style.cursor = "-moz-grabbing";'],
        ['onmouseup', 'this.style.cursor = "-webkit-grab"; this.style.cursor = "-moz-grab";'],
        ['onmouseover', 'this.style.cursor = "-webkit-grab"; this.style.cursor = "-moz-grab";']]);

        // i make 3 text nodes to go inside the above elements
        var indexText = document.createTextNode(i+1);
        var timeText  = document.createTextNode(formatTime(runTimes[counters[i]]));

        // the title node is a little more complex in that it has the added property of changing the current video when clicked
        // this means that i need an onclick event handler to first change the colour of the text when clicked, and to then change
        // the source of the video currently being played
        var titleNode = createCustomElement('a',
        [['style', 'cursor: pointer;']]);

        // the text of the video is then created from the array
        var titleText = document.createTextNode(videoTitles[counters[i]]);

        // the text is added to the anchor tag, which is then added to the span tag
        titleNode.appendChild(titleText);
        spanTitle.appendChild(titleNode);

        // the other two just require text being placed inside a span
        spanIndex.appendChild(indexText);
        spanRuntime.appendChild(timeText);

        // the new elements are then thrown together in this statement
        list.appendChild(elementContainer);
        elementContainer.appendChild(listElement);
        listElement.appendChild(spanIndex);
        listElement.appendChild(spanTitle);
        listElement.appendChild(spanRuntime);
        listElement.appendChild(moveIcon);
    }

    // when this list is first created i need to make sure that the first element is being changed - THIS IS WRONG
    if(blueCounter != undefined){
        changeTextColour(0, blueCounter);
    }
}

// this function shuffles a list of numbers, i then use these numbers to index into the video ids later on, it's much easier than
// shuffling the video ids because they're not stored in classes and thus i'd have to shuffle the thumbnails, ids and titles
function shuffleToggle() {

    // if the color of the symbol is black, the shuffled playlist is not on, meaning it needs to be shuffled if pressed
    if(document.getElementById('randomiseToggle').style.color != 'blue'){
        document.getElementById('randomiseToggle').style.color = 'blue';
        var loopCounter; //counts for the loop
        var randomIndex; //holds the random index in the list
        var placeHolder; //holds a list element and enables the swapping

        for(loopCounter = 0; loopCounter < counters.length; loopCounter++) {
            randomIndex = Math.floor(Math.random()*(1+loopCounter));  // choose j in [0..i]
            if (randomIndex != loopCounter) {
                placeHolder = counters[loopCounter];                  // swap list[i] and list[j]
                counters[loopCounter] = counters[randomIndex];
                counters[randomIndex] = placeHolder;
            }
        }

        // reset the loop counter for further use
        loopCounter = 0;

        // loop through the list of randomised counters looking for the index of the video that was playing before the random
        // button was pressed by the user
        while(counters[loopCounter] != counter){
            loopCounter++;
        }

        placeHolder = counters[loopCounter];
        counters.splice(loopCounter, 1);
        counters.unshift(placeHolder);

        // when it is found, setup the list, keeping the current song playing blue
        setupList(0);
        changePosition(0);

    // if it's blue then the user wants to get the list back to it's original state
    } else {
        // sets the randomise icon to be black again as the list is no longer random
        document.getElementById('randomiseToggle').style.color = 'white';
        // stores the original position of the song that's playing, so the original list can be setup properly again
        var newIndex = counters[counter];
        // resets the indexes to be the original
        counters = normaliseCounters.slice();

        // sets up the list using the song that's still playing and the original ordering
        setupList(newIndex);
        changePosition(newIndex);
    }
}

function setSource(index) {
    // changes the icon to be pause, because the website will start playing the video
    document.getElementById('pausePlay').className = 'fa fa-pause fa-stack-1x';
    // changePosition(index);
    player.loadVideoById(videoIDs[index], 0);
}

// a function that takes in the type of element you want to build as well as a two dimensional array of
// and their associated values
function createCustomElement(type, attributes){

    var i = 0;
    var customElement = document.createElement(type);
    var attribute;
    var attributeValue;
    var attributeNode;

    // goes through each index in the array, and assigns the attribute and it's associated value
    // to the element tag
    for(; i < attributes.length; i++){
        attribute = attributes[i][0];
        attributeValue = attributes[i][1];
        attributeNode = document.createAttribute(attribute);
        attributeNode.value = attributeValue;
        customElement.setAttributeNode(attributeNode);
    }
    return customElement;
}

// formats the time to be in the 00:00 format
function formatTime(seconds){
    // gets the minutes rounded down
    minutes = Math.floor(parseInt(seconds) / 60);
    // the seconds from the minutes
    leftoverSeconds = parseInt(seconds) % 60;

    // if the seconds are less than 10 then i want to format them as such that it looks like x:01 etc
    if(leftoverSeconds < 10){
        leftoverSeconds = '0'.concat(leftoverSeconds.toString());
    } else {
        leftoverSeconds = leftoverSeconds.toString();
    }

    // the string to be returned is created
    var timeString = minutes.toString().concat(':').concat(leftoverSeconds);

    return timeString;

}

// changes the size of the player
function setSize(player, width, height){
    player.width  = width;
    player.height = height;
}

// toggles whether the player is visible or not
function togglePlayer(){
    if(document.getElementById('playerContainer').style.visibility == 'visible'){
        // hides the player
        document.getElementById('playerToggle').style.color = 'white';
        document.getElementById('playerContainer').style.visibility = 'hidden';
        document.getElementById('playerContainer').style.display = 'none';
        document.getElementById('shader').style.visibility = 'hidden';
        document.getElementById('listContainer').style.pointerEvents = 'auto';
    } else {
        // shows the player
        document.getElementById('playerToggle').style.color = 'blue';
        document.getElementById('playerContainer').style.display = 'block';
        document.getElementById('playerContainer').style.visibility = 'visible';
        document.getElementById('shader').style.visibility = 'visible';
        document.getElementById('listContainer').style.pointerEvents = 'none';
    }
    if(enlargedVideo){
        enlargeToggle();
    }
}

function togglePlayPause(){
    if(document.getElementById('pausePlay').className == 'fa fa-pause fa-stack-1x'){
        document.getElementById('pausePlay').className = 'fa fa-play fa-stack-1x';
        player.pauseVideo();
    } else {
        document.getElementById('pausePlay').className = 'fa fa-pause fa-stack-1x';
        player.playVideo();
    }
}

function nextVideo(){

    if(counter != counters.length - 1){
        // changes the colour of the text and increases the counter in that function
        changeTextColour(counter, (counter+1));
        setSource(counters[counter]);
        changePosition(counter);
    }
}

function previousVideo(){
    // changes the colour of the text and decreases the counter in that function
    changeTextColour(counter, (counter-1));
    // sets the source of the next video
    setSource(counters[counter]);
    changePosition(counter);
}

function itemMoved(newPosition, oldPosition){

    var oldIntPosition = Math.floor(oldPosition / 100);
    var newIntPosition = Math.floor(newPosition / 100);

    // i need to know what video is currently playing later on, because the setupList changes the current counter, so that is no longer reliable
    var toFind = counters[counter];

    // if the person drags the element too far up
    if(newIntPosition < -1){
        newIntPosition = -1;
    }

    if(newPosition < oldPosition){
        //the element was moved up
        // the int position has to be increased when things are moved up because the person drops the div on a position higher than the position itself
        newIntPosition = newIntPosition + 1;

        // putting the element in the list in the new position
        counters.splice(newIntPosition, 0, counters[oldIntPosition]);
        // splicing out the old element, this needs to be +1 because the array is now bigger than it should be
        counters.splice(oldIntPosition+1, 1);

    } else {
        //the element has been moved down
        // the element will be put in a place 1 greater than it needs to because the element before it then needs to be moved up
        counters.splice(newIntPosition+1, 0, counters[oldIntPosition]);
        // splicing out the old element
        counters.splice(oldIntPosition, 1);

    }

    var loopCounter = 0;

    // finding the video that is currently playing
    while(counters[loopCounter] != toFind){
        loopCounter++;
    }
    setupList(loopCounter);
}

function changePosition(index){
    // this bit of functionality requires the window to wait for a small amount of time before jumping to the currently playing song
    // it's basically for moving the window when the user presses the random button
    setTimeout(function(){window.location = ('#listItem' + index)}, 50);
}

function volumeUp(){
    // volume is a number between 0-100, so it is increased in 10ths. The youtube API takes care of exceeding 100
    player.setVolume(player.getVolume() + 10);
}

function volumeDown(){
    // volume is a number between 0-100, so it is decreased in 10ths. The youtube API takes care of going below 0
    player.setVolume(player.getVolume() - 10);
}

// a function that toggles whether or not the volume is muted
function toggleVolume(){
    if(document.getElementById('volumeToggle').style.color == 'white'){
        document.getElementById('volumeToggle').style.color = 'red';
        player.mute();
    } else {
        document.getElementById('volumeToggle').style.color = 'white';
        player.unMute();
    }
}

function enlargeToggle(){
    if(!enlargedVideo){
        if(document.getElementById('playerContainer').style.visibility == 'visible'){
            var videoWidth = window.innerWidth - 150;
            var marginCorrectionX = ((videoWidth) * (-0.5)) + ('px');
            document.getElementById('playerContainer').style.width = videoWidth;
            document.getElementById('playerContainer').style.marginLeft = marginCorrectionX;

            var videoHeight = ((videoWidth / 16) * 9);
            var marginCorrectionY = ((videoHeight) * (-0.5)) + ('px');
            document.getElementById('playerContainer').style.height = videoHeight;
            document.getElementById('playerContainer').style.marginTop = marginCorrectionY;

            player.setSize(videoWidth, videoHeight);

            document.getElementById('playerSize').className = "fa fa-compress fa-stack-1x";
            document.getElementById('buttonDiv').style.right = '96%';
            document.getElementById('buttonDiv').style.marginRight = '';
            enlargedVideo = true;
        }
    } else {
        var videoWidth = 640;
        var marginCorrectionX = ((videoWidth) * (-0.5)) + ('px');
        document.getElementById('playerContainer').style.width = 640;
        document.getElementById('playerContainer').style.marginLeft = marginCorrectionX;

        var videoHeight = 390;
        var marginCorrectionY = ((videoHeight) * (-0.5)) + ('px');
        document.getElementById('playerContainer').style.height = 390;
        document.getElementById('playerContainer').style.marginTop = marginCorrectionY;

        player.setSize(640, 390);

        document.getElementById('playerSize').className = "fa fa-expand fa-stack-1x";
        document.getElementById('buttonDiv').style.right = '83%';
        document.getElementById('buttonDiv').style.marginRight = 'calc(-63.5px * 0.17);';
        enlargedVideo = false;
    }
}
