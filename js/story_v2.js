$(function(){
    // get querystring if exists
    const params = new Proxy(new URLSearchParams(window.location.search), { get: (searchParams, prop) => searchParams.get(prop) });
    var loc = window.location.href;
    var results = 0;
    if (loc.indexOf("?") == -1) {
        buildAll();
    } else {
        if (params.f != null) $("#filter").show();
        if (params.s != null) $("#search").show();
        
        if (params.n == null && params.co == null && params.sh == null && params.fp == null) buildAll();
        else filteredGallery();
    }


    function buildAll() { $.each(STORY_DATA, function(key, value){ buildOne(value); }); }

    function buildOne(info) {
        var datum = "<a href='javascript:void(0);' class='card' style='background-image: url(img/stories/";
        datum += info.image + ");' ";
        datum += "data-name='" + info.name + "' ";
        datum += "data-stakeholder='" + info.stakeholder + "' ";
        datum += "data-classof='" + info.classof + "' ";
        datum += "data-image='" + info.image + "' ";
        datum += "data-story='" + info.story + "' ";
        datum += "data-prompt='" + info.prompt + "'>"

        datum += "<div class='border'>";
        datum += "<h2>" + info.name + "<span>" + info.stakeholder;
        if (info.stakeholder == "Alumni")
            datum += " - Class of " + info.classof + "</span>";
        datum += "</h2>";

        // social icons?

        datum += "<p><span class='mobile'>Tap</span><span class='desktop'>Click</span> To Hear My Story</p></div></a>";

        if (params.sb != null) $("#stories").prepend(datum);
        else $("#stories").append(datum);
    }


    // filtering gallery
    function filteredGallery() {
        $.each(STORY_DATA, function(key, value) {
            if ((params.co != null && value.classof == params.co) ||
                (params.sh != null && value.stakeholder == params.sh) ||
                (params.fp != null && value.prompt == params.fp) ||
                (params.n != null && value.name.toLowerCase().indexOf(params.n.toLowerCase()) > -1)) { buildOne(value); results++; }
        });
        if (results == 0) {
            $("#stories").hide();
            $("#noResults").show();
            // show filter or search form
        }
    }



    // individual stories
    $(".card").click(function(){
        $("#story").css("background-image", "url(img/stories/" + $(this).data("image") + ")");
        $("#story #name").text($(this).data("name"));

        var stakeholder = $(this).data("stakeholder");
        if (stakeholder == "Alumni") {
            $("#story #stakeholder").html(stakeholder + " <span> - Class of " + $(this).data("classof") + "</span>");
        } else {
            $("#story #stakeholder").text(stakeholder);
        }

        $("#story #prompt").text($(this).data("prompt"));

        var audio = $("#storyAudio")[0];
        $("#storyAudio").prop("volume", 0.5);
        $("#story #storyError").hide();
        $("#story #storyPlay").show();
        $("#storyAudio #oggSource").attr("src", "stories/" + $(this).data("story") + ".ogg");
        $("#oggSource").on("error", function(e) {
            $("#story #storyError").text("Audio not found!");
            $("#story #storyPlay").hide();
            $("#story #storyError").show();
            console.log("Error getting audio file: " + e)
            return;
        });
        audio.load();
        audio.oncanplaythrough = audio.play();
        $("#storyPlay").addClass("pause");
        
        $("#story").addClass("open");
        $(".storyCover").addClass("open");
        $(".content").addClass("storyOpen");
    });

    $("#storyPlay").click(function(){
        var audio = $("#storyAudio")[0];
        if ($(this).hasClass("pause")) {
            audio.pause();
            $(this).removeClass("pause");
        } else {
            audio.play();
            $(this).addClass("pause");
        }
    });

    $("#closeStory").click(function(){
        var audio = $("#storyAudio")[0];
        audio.pause();
        $("#story").removeClass("open"); 
        $(".storyCover").removeClass("open"); 
        $(".content").removeClass("storyOpen");
    });

    $(document).on("keydown", function(event) {
        if (event.key == "Escape") {
            if ($("#story").is(":visible")) {
                var audio = $("#storyAudio")[0];
                audio.pause();
                $("#story").removeClass("open"); 
                $(".storyCover").removeClass("open"); 
                $(".content").removeClass("storyOpen");
            }
        }
    });


    $("#filterStakeholder input").change(function(){ this.id == "filter_stakeholder_alumni" ? $("#filterFromClassOf").show() : $("#filterFromClassOf").hide(); });
    $("#btnFilterStories").click(function(){
        var values = {};
        var qs = "?";
        var sh = $("#filterStakeholder input:checked").val();
        var fp = $("#filterPrompts input:checked").val();
        var sb = $("#filterSortby input:checked").val();
        
        if (sh != "Anyone") values["sh"] = sh;
        if (sh == "Alumni" && $("#filter_classof").val().trim() != "") values["co"] = $("#filter_classof").val().trim();
        if (fp != "Any prompt") values["fp"] = fp;
        if (sb == "Oldest") values["sb"] = "o";

        $.each(values, function(key, value){ qs += key + "=" + value + "&"; });
        qs = qs.substring(0, qs.length - 1);

        window.location.href = "index_v2.html" + qs;
    });

    $("#btnSearchStories").click(function(){
        var n = $("#search_name").val().trim();
        if (n == "") window.location.href = "index_v2.html"
        n = n.replaceAll(" ", "_");
        window.location.href = "index_v2.html?n=" + n;
    });
});