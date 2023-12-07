// lazy loading
$(function(){ 
    $(".lazy").lazy({
        attribute: "data-image",
        removeAttribute: false,
        imageBase: "img/stories/",
        scrollDirection: "vertical",
        effect: "fadeIn",
        effectTime: 2000,
        threshold: 0,
        visibleOnly: true,
        afterLoad: function(e) {
            e.children("span.loading").hide();
        },
        onError: function(e) {
            console.log("Error loading " + e.data("a"));
        }
    });

    $("#shareYourStory").click(function(){
        $("#shareContainer").fadeIn("slow");
        $("#wrapper").toggleClass("overflow");
    });
    
    
    $("#closeShare").click(function(){
        $("#shareContainer").fadeOut("slow");
        $("#wrapper").toggleClass("overflow");
    });
    
    
    // copyright year (current year)
    $("#copyright_year").text(new Date().getFullYear());
});