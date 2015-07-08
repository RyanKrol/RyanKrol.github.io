<?php

$array1 = array("#F1F2B5","#7b4397","#8e9eab","#136a8a","#00bf8f","#ffb347","#43cea2","#D38312","#73C8A9","#83a4d4","#52c234","#fe8c00","#556270","#9D50BB","#B3FFAB","#DAD299","#215f00","#3D7EAA",
                "#1CD8D2","#134E5E","#2BC0E4","#085078","#1D976C","#4CB8C4","#1A2980","#F09819","#3CA55C","#348F50");
$array2 = array("#135058","#dc2430","#eef2f3","#267871","#001510","#ffcc33","#185a9d","#A83279","#373B44","#b6fbff","#061700","#f83600","#FF6B6B","#6E48AA","#12FFF7","#B0DAB9","#e4e4d9","#FFE47A",
                "#93EDC7","#71B280","#EAECC6","#85D8CE","#93F9B9","#3CD3AD","#26D0CE","#EDDE5D","#B5AC49","#56B4D3");

$index  = rand(0, count($array1)-1);
$colour1 = $array1[$index];
$colour2 = $array2[$index];

echo "html {";
echo "    background: -moz-linear-gradient(45deg,  $colour1 0%, $colour2 100%); /* FF3.6+ */";
echo "    background-attachment: fixed;";
echo "}";

?>

html, body{
    width:100%;
    height:100%;
    margin:0;
}

#playlistID {
    /*position properties*/
    position:relative;

    left: 22.5%;
    width: 55%;
    height: 60px;

    /*border properties*/
    border: 1px solid #c4c4c4;
    text-align: center;

    /*padding properties*/
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 7px;
    padding-right: 7px;

    /*font properties*/
    font-family: "HelveticaNeue-Thin", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    font-size: 50px;

    /*giving the text box curved corners*/
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    border-radius: 20px;

    background-color:rgba(0, 0, 0, 0.35);
    -webkit-transition: all 0.3s ease-out;
            transition: all 0.3s ease-out;

    /*shadow properties*/
    outline: none;
    box-shadow: 0px 0px 00px #000000;
    -moz-box-shadow: 0px 0px 00px #000000;
    -webkit-box-shadow: 0px 0px 00px #000000;
}
#playlistID:focus {
        background-color:rgba(255,255,255,1);
        box-shadow: 0px 0px 10px #000000;
        -moz-box-shadow: 0px 0px 10px #000000;
        -webkit-box-shadow: 0px 0px 10px #000000;

        -webkit-transition: all 0.3s ease-out;
                transition: all 0.3s ease-out;
}
/*determines the properties of the placeholder*/
.playlistID::-webkit-input-placeholder {
    /*the placeholder is currently a grey colour*/
    text-align: center;
}


.content{
    position:absolute;
    width: 100%;
    height: 180px;
    top: 35%;
}

.slogan{
    position:relative;
    font-family: "HelveticaNeue-Thin", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    font-size: 35px;
    width:44%;
    top : 0%;
    left :28%;
    text-align: center;
    overflow: visible;
    white-space: nowrap;
}

input{
    position:absolute;
    z-index: 1005;
}

/* This all deals with the loading beginning and the black screen shutting */

.loading #loader-wrapper .loader-section.section-left {
    -webkit-transform: translateX(100%);  /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: translateX(100%);  /* IE 9 */
    transform: translateX(100%);  /* Firefox 16+, IE 10+, Opera */
}

.loading #loader-wrapper .loader-section.section-right {
    -webkit-transform: translateX(-100%);  /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: translateX(-100%);  /* IE 9 */
    transform: translateX(-100%);  /* Firefox 16+, IE 10+, Opera */
}

.loading #loader-wrapper .loader-section.section-right,
.loading #loader-wrapper .loader-section.section-left {

    -webkit-transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
                transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
}


/* this is where the black screens sit in the interim */
#loader-wrapper .loader-section {
    position: fixed;
    top: 0;
    width: 51%;
    height: 100%;
    background: #222222;
    z-index: 1000;
    -webkit-transform: translateX(0);  /* Chrome, Opera 15+, Safari 3.1+ */
    -ms-transform: translateX(0);  /* IE 9 */
    transform: translateX(0);  /* Firefox 16+, IE 10+, Opera */
}

#loader-wrapper .loader-section.section-left {
    left: -51%;
}

#loader-wrapper .loader-section.section-right {
    right: -51%;
}

/* once the website has done it's business the black screens will move out of the way */
.loaded #loader-wrapper .loader-section.section-left {
    -webkit-transform: translateX(-100%);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: translateX(-100%);  /* IE 9 */
            transform: translateX(-100%);  /* Firefox 16+, IE 10+, Opera */

    -webkit-transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
            transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
}

.loaded #loader-wrapper .loader-section.section-right {
    -webkit-transform: translateX(100%);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: translateX(100%);  /* IE 9 */
            transform: translateX(100%);  /* Firefox 16+, IE 10+, Opera */

-webkit-transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
    transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1.000);
}

/* when the webpage has done it's business, the loader will fade out, as well as the div holding all of the loading stuff moving */
.loaded #loader {
    opacity: 0;
    -webkit-transition: all 0.3s ease-out;
            transition: all 0.3s ease-out;
}
.loaded #loader-wrapper {
    visibility: hidden;

    -webkit-transform: translateY(-100%);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: translateY(-100%);  /* IE 9 */
            transform: translateY(-100%);  /* Firefox 16+, IE 10+, Opera */

    -webkit-transition: all 0.3s 1s ease-out;
            transition: all 0.3s 1s ease-out;
}

/* this is the declaration of all of the animation stuff */

@-webkit-keyframes spin {
    0%   {
        -webkit-transform: rotate(0deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(0deg);  /* IE 9 */
        transform: rotate(0deg);  /* Firefox 16+, IE 10+, Opera */
    }
    100% {
        -webkit-transform: rotate(360deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(360deg);  /* IE 9 */
        transform: rotate(360deg);  /* Firefox 16+, IE 10+, Opera */
    }
}
@keyframes spin {
    0%   {
        -webkit-transform: rotate(0deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(0deg);  /* IE 9 */
        transform: rotate(0deg);  /* Firefox 16+, IE 10+, Opera */
    }
    100% {
        -webkit-transform: rotate(360deg);  /* Chrome, Opera 15+, Safari 3.1+ */
        -ms-transform: rotate(360deg);  /* IE 9 */
        transform: rotate(360deg);  /* Firefox 16+, IE 10+, Opera */
    }
}

.loading #loader {
    opacity: 100;
    -webkit-transition: all 3s ease-out;
            transition: all 3s ease-out;
}

/* so i need to move the animation loading stuff out of the way for when it isn't being used */
#loader-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
}
#loader {
    display: block;
    position: relative;
    opacity: 0;
    left: 50%;
    top: 50%;
    width: 150px;
    height: 150px;
    margin: -75px 0 0 -75px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #3498db;

    -webkit-animation: spin 2s linear infinite; /* Chrome, Opera 15+, Safari 5+ */
    animation: spin 2s linear infinite; /* Chrome, Firefox 16+, IE 10+, Opera */

    z-index: 1001;
}

    #loader2 {
        content: "";
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #e74c3c;

        -webkit-animation: spin 3s linear infinite; /* Chrome, Opera 15+, Safari 5+ */
        animation: spin 3s linear infinite; /* Chrome, Firefox 16+, IE 10+, Opera */
        z-index: 1002;
    }

    #loader3 {
        content: "";
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #f9c922;

        -webkit-animation: spin 1.5s linear infinite; /* Chrome, Opera 15+, Safari 5+ */
          animation: spin 1.5s linear infinite; /* Chrome, Firefox 16+, IE 10+, Opera */
          z-index: 1002;
    }
