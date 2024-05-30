var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var isRecording = false;
var mediaRecorder;
var audioChunks = [];
var canDrag = false;
var droppedPhoto = false;
var droppedAudio = false;

var alumnus = {
    name: "",
    email: "",
    stakeholder: "Alumni",
    year: "",
    photo: "",
    photoUri: "",
    prompt: $("#prompts input").eq(0).val(),
    story: "",
    storyUri: ""
};

$(function(){
    // switching between panels

    var current, next;

    $(".continue").click(function(){
        current = $(this).parent().parent();
        next = $(this).parent().parent().next();

        $("#progress li").eq($(".shareYourStory").index(next)).addClass("active");

        current.slideUp();
        next.fadeIn();
    });

    $(".previous").click(function(){        
        current = $(this).parent().parent();
        previous = $(this).parent().parent().prev();

        $("#progress li").eq($(".shareYourStory").index(current)).removeClass("active");
        
        current.fadeOut();
        previous.slideDown("slow");
    });

    // feature detection
    canDrag = function(){
        var div = document.createElement("div");
        return(("draggable" in div) || ("ondragstart" in div && "ondrop" in div)) &&
            "FormData" in window && "FileReader" in window;
    }();

    // student's name
    $("#share_name").change(function(){ 
        if ($(this).val().trim() != "") { 
            alumnus.name = $(this).val().trim();
            $("#name").text(alumnus.name);
            $(this).siblings("#shareNameError").hide();
        }
    });

    // student's email
    $("#share_email").change(function(){ 
        let val = $(this).val().trim();
        if (val != "" && emailRegex.test(val)) { 
            alumnus.email = val;
            $(this).siblings("#shareEmailError").hide();
        } else {
            $(this).siblings("#shareEmailError").text("* Invalid email address").show();
        }
    });

    // student's Graduation Year
    $("#shareStakeholder input").change(function(){ 
        this.id == "share_stakeholder_alumni" ? $("#shareGradYear").show() : $("#shareGradYear").hide(); 
        alumnus.stakeholder = this.value;
        $("#stakeholder").text(alumnus.stakeholder);
    });

    $("#share_gradYear").keypress(function(e){ if (String.fromCharCode(e.keyCode).match(/[^0-9]/g)){ return false; } });
    $("#share_gradYear").change(function(){
        let val = $(this).val().trim();
        if (val != "" && val <= parseInt(new Date().getFullYear()) && val >= parseInt($("#share_gradYear").attr("min"))) {
            alumnus.year = val;
            $("#stakeholder").html(alumnus.stakeholder + " <span>- Class of " + alumnus.year);
            $(this).siblings("#shareGradYearError").hide();
        } else {
            $(this).siblings("#shareGradYearError").show();
        }
    });

    if (canDrag) {
        $("#photoFile")
            .on("drag dragstart dragend dragover dragenter dragleave drop", function(e){
                e.preventDefault();
                e.stopPropagation();
            })

            .on("dragenter focus hover", function () {
                $("#photoFile").addClass("active");
            })

            .on("dragleave blur drop", function () {
                $("#photoFile").removeClass("active");
            })

            .on("drop", function(e){
                if ($(this).find("#upPhoto").length > 0) {
                    doPhoto(e.originalEvent.dataTransfer.files[0]);
                } else {
                    doAudio(e.originalEvent.dataTransfer.files[0]);
                }
            });
    }

    $("#photoFile .deleteFile").on("click", function () {
        $("#upPhoto").val(null);
        $("#photoFile").removeClass("active");
        $(".dropMsg").text("or drop files here");
        $(".deleteFile").css("display", "none");
    });

    // student's photo
    $("#upPhoto").change(function(e){ doPhoto(e.target.files[0]); });

    // process photo
    function doPhoto(file) {
        var allowedPhotoExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        var fileName = file.name;

        if (!allowedPhotoExtensions.exec(fileName)) {
            $("#upPhoto").value = "";
            $("#photoFile").addClass("error");
            $("#upPhotoError").show();
            $("#upPhotoError").html("ONLY JPG, JPEG, or PNG formats");
        } else {
            $("#upPhotoName").html("File Selected: " + fileName);
            $("#upPhotoExt").text(fileName.substring(fileName.lastIndexOf(".")));
            $("#photoFile").removeClass("error");
            $("#photoFile .deleteFile").css("display", "block");
            $("#upPhotoError").hide();
            $("#upPhotoError").html("");
            alumnus.photo = file;
            let reader = new FileReader();
            reader.onload = function(f){
                $("#story").css("background-image", "url(" + f.target.result + ")");
            }
            reader.readAsDataURL(alumnus.photo);

            // create the uri
            let readerUri = new FileReader();
            readerUri.readAsBinaryString(alumnus.photo);
            readerUri.onload = function(f){
                alumnus.photoUri = "data:" + alumnus.photo.type + ";base64," + btoa(readerUri.result);
            }
        }
    }

    // prompts
    $("#prompt").text(alumnus.prompt); // default
    $("#prompts input").change(function(){
        if (this.id == "prompt_other") {
            $("#pnlPromptOther").show();
            $("#promptOther").focus();
        } else {
            $("#pnlPromptOther").hide();
            $("#promptOther").blur();
            $("#promptOther").val("");
            $("#promptOther").removeClass("error");
            alumnus.prompt = $(this).val();
            $("#prompt").text(alumnus.prompt);
        }
    });

    $("#promptOther").change(function(){
        let val = $(this).val().trim();
        if ($("#promptOther").is(":visible") && val != ""){
            if (!val.endsWith("...")) { val += "..."; }
            alumnus.prompt = val;
            $("#prompt").text(alumnus.prompt);
        }
    });

    // story
    $("#shareStoryType input").change(function(){
        if (this.id == "share_story_type_upload") {
            $("#pnlShareUpload").show();
            $("#pnlShareRecord").hide();
        } else {
            $("#pnlShareUpload").hide();
            $("#pnlShareRecord").show();
        }
    });

    // record story
    $("#btnRecord").click(function(){
        if (!$(this).hasClass("disabled")){
            if (!isRecording){ 
                mediaRecorder.start(); 
                $("#btnRecord span").text("Stop");
                $("#btnRecord #recordIcon").hide();
                $("#btnRecord #stopIcon").show();
                $("body").addClass("recording");
                $("#recordingWarning").addClass("active");
            } else {
                mediaRecorder.stop();
                isRecording = false;
                $("#btnRecord span").text("Record");
                $("#btnRecord #recordIcon").show();
                $("#btnRecord #stopIcon").hide();
                $("body").removeClass("recording");
                $("#recordingWarning").removeClass("active");
            }
        }
    });

    if (canDrag) {
        $("#storyFile")
            .on("drag dragstart dragend dragover dragenter dragleave drop", function(e){
                e.preventDefault();
                e.stopPropagation();
            })

            .on("dragenter focus hover", function () {
                $("#storyFile").addClass("active");
            })

            .on("dragleave blur drop", function () {
                $("#storyFile").removeClass("active");
            })

            .on("drop", function(e){
                if ($(this).find("#upStory").length > 0) {
                    doPhoto(e.originalEvent.dataTransfer.files[0]);
                } else {
                    doAudio(e.originalEvent.dataTransfer.files[0]);
                }
            });
    }

    $("#storyFile .deleteFile").on("click", function () {
        $("#upStory").val(null);
        $("#storyFile").removeClass("active");
        $(".dropMsg").text("or drop files here");
        $(".deleteFile").css("display", "none");
    });
    $("#upStory").change(function(e){ doAudio(e.target.files[0]); });

    function doAudio(file){
        var allowedStoryExtensions = /(\.mp3|\.ogg)$/i;
        var fileName = file.name;

        if (!allowedStoryExtensions.exec(fileName)){
            $("#upStory").value = "";
            $("#storyFile").addClass("error");
            $("#upStoryError").show();
            $("#upStoryError").html("ONLY MP3 or OGG formats");
        } else {
            $("#upStoryName").html("File Selected: " + fileName);
            $("#storyFile").removeClass("error");
            $("#upStoryExt").text(fileName.substring(fileName.lastIndexOf(".")));
            $("#upStoryError").hide();
            $("#upStoryError").html("");
            $("#storyFile .deleteFile").css("display", "block");
            alumnus.story = file;
            if ($("#upStoryExt").text() == ".ogg") { $("#oggSource").attr("src", URL.createObjectURL(alumnus.story)); }
            else { $("#mp3Source").attr("src", URL.createObjectURL(alumnus.story)); }
            
            $("#storyAudio").load();

            // create the uri
            let readerUri = new FileReader();
            readerUri.readAsBinaryString(alumnus.story);
            readerUri.onload = function(f){
                alumnus.storyUri = "data:" + alumnus.story.type + ";base64," + btoa(readerUri.result);
            }
        }
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream){
        canRecord = true;
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(e){
            if (e.data.size > 0){
                audioChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = function(){
            const audioBlob = new Blob(audioChunks, { type: "audio/ogg"});
            $("#audioPreviewSource").attr("src", URL.createObjectURL(audioBlob));
            
        };

        mediaRecorder.onstart = function(){
            isRecording = true;
            audioChunks = [];
        };
    })
    .catch(function(e){
        console.error("ERROR recording audio:", e);
        $("#recordError").show();
        $("#btnRecord").addClass("disabled");
        $("#btnPlay").addClass("disabled");
    });
});


// send email
function sendStory(){
    // validation
    if (!validateInfo()) { return; }
    if (!validatePrompt()) { return; }
    if (!validateStory()) { return; }
    
    $("#pnlReview").slideUp();
    $("#pnlSending").fadeIn();

    composedEmail = '<div style="box-sizing: border-box; width:100%; background:#FFFFFF; color:#333333; padding: 12px 16px;">' +
        '<h1 style="padding:24px 32px 6px 32px; color: #01426A; border-bottom: 1px solid #01426A; font-size:24px; font-weight:bold; font-variant:small-caps;font-family:Georgia, "Times New Roman", Times, serif">New Alumni Story</h1>' +
        '<p style="font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        'An alumnus has submitted their story from Canterbury! Here are the details (photo and audio should be attached):</p>' +
        '<table style="width:100%; border-collapse: collapse;"><tr>' +
        '<th style="width:160px; padding:6px 12px; font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Name:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        String(alumnus.name) + '</td></tr><tr style="background:#b1d3e7">' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Email:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        alumnus.email + '</td></tr><tr>' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Graduation Year:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        alumnus.year + '</td></tr><tr style="background:#b1d3e7">' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">College:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' + 
        alumnus.college + '</td></tr><tr>' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Prompt:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        alumnus.prompt + '</td></tr></table></div>'

    // send email
    Email.send({
        SecureToken: "1de502eb-206d-4f79-92ce-e5bf40023b6b",
        To: "canterburyalumnistories@gmail.com",
        From: "sfunderburk@canterburyfortmyers.org",
        Subject: "New Alumni Story from " + alumnus.name,
        Body: composedEmail,
        Attachments:[
            {
                name: alumnus.year + "_" + alumnus.name.replace(/\s/g, "_") + $("#upPhotoExt").text(),
                data: alumnus.photoUri
            },
            {
                name: alumnus.year + "_" + alumnus.name.replace(/\s/g, "_") + $("#upStoryExt").text(),
                data: alumnus.storyUri
            }
        ]
    })
    .then(function(message){
        if (message == "OK") {  // success
            $("#pnlSending").slideUp();
            $("#pnlSuccess").fadeIn();
            $("#successName").text(alumnus.name);
        } else {  // error
            $("#pnlSending").slideUp();
            $("#pnlError").fadeIn();
            $("#submitErrorMessage").text(message);
        }
    });
}

//#region Validation

function validateInfo(){
    $("#infoError").hide();
    var valid = true;

    if (alumnus.name == "")  { valid = false; $("#shareNameError").show(); }
    if (alumnus.email == "") { valid = false; $("#shareEmailError").show(); }
    if (alumnus.stakeholder == "Alumni" && alumnus.year == "")  { valid = false; $("#shareGradYearError").show(); }
    if (alumnus.photo == "") { valid = false; $("#sharePhotoError").show(); }

    if (!valid) { 
        progressClear();
        $("#pnlInfo").show();
        $("#progress").children().eq(0).addClass("active");
        return false;
    }

    return true;
}

function validatePrompt(){
    $("#promptOtherError").hide();
    var valid = true;

    if ($("#prompts input:checked").val() == "Other" && $("#promptOther").val().trim() == ""){
        valid = false;
        $("#promptOtherError").show();
    }

    if (!valid) { 
        progressClear();
        $("#pnlPrompts").show();
        $("#progress").children().eq(1).addClass("active");
        return false;
    }

    return true;
}

function validateStory(){ // TODO: This validation doesn't work!
    if (alumnus.story = ""){
        $("#storyError").show();
        $("#storyError").text("You must upload or record a story.");
        progressClear();
        $("#pnlStory").show();
        $(".progress .story").addClass("active");
        return false;
    }

    return true;
}

function progressClear() {
    // clear all
    $("#pnlInfo").hide();
    $("#pnlPrompts").hide();
    $("#pnlRecord").hide();
    $("#pnlReview").hide();
    $("#progress").children("li").each(function() { $(this).removeClass("active"); })
    $("#progress").children("li").eq(0).addClass("active");
}

//#endregion