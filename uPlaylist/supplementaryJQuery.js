$(function() {
    // the following makes the list 'videoList' sortable using jquery's ui api
    $( "#videoList" ).sortable({
        // the handle means you can only move the list from a certain point, i.e. the 3 lines in the list element
        handle: ".moveIcon",
        // this doesn't actually create a clone, but it does make moving the bottom element actually work, so it's here.
        helper: "clone",

        scrollSpeed: 10,
        scrollSensitivity: 75,
        // the axis means you can only move the list elements up and down
        axis:   "y",
        // when the position of any of the elements changes as a result of moving them, execute the following function
        update: function(event, ui){
            itemMoved(ui.position.top, ui.originalPosition.top);
        }
    });
});
