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
