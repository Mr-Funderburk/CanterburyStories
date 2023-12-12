$(function(){ 
    $(".lazy").click(function(){
        $("#wrapper").addClass("overflow");

        $("#storyContainer").fadeIn("slow");
        $("#storyContainer .story").css("background-image", "url(img/stories/" + $(this).data("image") + ")");
        $("#storyContainer .studentName").text($(this).data("student") + " '" + $(this).data("classof").toString().substring(2));
        $("#storyContainer .studentCollege").text($(this).data("college"));
        $("#storyContainer .studentPrompt").text($(this).data("prompt"));

        // audio
        var audio = $("#storyAudio")[0];
        $("#storyAudio").prop("volume", 0.5);
        $("#storyAudio").show();
        $("#storyContainer .errorBox").hide();
        $("#storyContainer").fadeIn("slow");

        $("#storyAudio #oggSource").attr("src", "stories/" + $(this).data("story") + ".ogg");

        $("#oggSource").on("error", function(e) { 
            $("#storyAudio").hide();
            $("#storyContainer .errorBox").show();
            console.log("Error getting audio file: " + e)
            return;
        });

        audio.load();
        audio.oncanplaythrough = audio.play();
    });


    $("#closeStory").click(function(){
        var audio = $("#storyAudio")[0];
        if ($("#storyAudio").is(":visible")) { audio.pause(); }
        $("#wrapper").toggleClass("overflow");
        $("#storyContainer").fadeOut("slow");
    });

    $(".modalbg").click(function(){
        var audio = $("#storyAudio")[0];
        if ($("#storyAudio").is(":visible")) { audio.pause(); }
        $("#wrapper").toggleClass("overflow");
        $("#storyContainer").fadeOut("slow");
    });


    $(document).on("keydown", function(event) {
        if (event.key == "Escape") {
            if ($("#storyContainer").is(":visible")) {
                var audio = $("#storyAudio")[0];
                if ($("#storyAudio").is(":visible")) { audio.pause(); }
                $("#wrapper").toggleClass("overflow");
                $("#storyContainer").fadeOut("slow");
            } else if ($("#shareContainer").is(":visible")) {
                $("#shareContainer").fadeOut("slow");
                $("#wrapper").toggleClass("overflow");
            }
        }
    });
});