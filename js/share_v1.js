// ========== progress switching
function progressClear() {
    // clear all
    $("#pnlInfo").hide();
    $(".progress .info").removeClass("active");
    $("#pnlPrompts").hide();
    $(".progress .prompt").removeClass("active");
    $("#pnlRecord").hide();
    $(".progress .record").removeClass("active");
    $("#pnlReview").hide();
    $(".progress .review").removeClass("active");
}

function makePreview() {
    $("#previewStory .studentName").text($("#txtName").val() + " '" + $("#txtGradYear").val().substring(2));
    $("#previewStory .studentCollege").text($("#txtCollege").val());
    var prompt = $("#promptOptions input:checked").val();
    if (prompt == "Other") {
        prompt = $("#txtOtherPrompt").val();
    }
    $("#previewStory .studentPrompt").text(prompt);

    var photo = $("#upPhoto").get(0).files[0];

    if (photo){
        var reader = new FileReader();
        reader.onload = function(){
            $("#previewStory .story").css("background-image", "url(" + reader.result + ")");
        }
        reader.readAsDataURL(photo);
    }

    var story = $("#upStory").get(0).files[0];

    if (story){
        var audio = $("#reviewAudio")[0];
        var reader = new FileReader();
        reader.onload = function(){
            console.log(story); //TODO: Finish this
            $("#reviewOggSource").attr("src", reader.result);

        }
        reader.readAsDataURL(story);
        audio.load();
        audio.oncanplaythrough = audio.play();
    }
}

$(".progress .info").click(function(){
    progressClear();
    $("#pnlInfo").show();
    $(this).addClass("active");
});

$("#continueInfo").click(function(){
    progressClear();
    $("#pnlPrompts").show();
    $(".progress .prompt").addClass("active");
});

$(".progress .prompt").click(function(){
    progressClear();
    $("#pnlPrompts").show();
    $(this).addClass("active");
});

$("#continuePrompt").click(function(){
    progressClear();
    $("#pnlRecord").show();
    $(".progress .record").addClass("active");
});

$(".progress .record").click(function(){
    progressClear();
    $("#pnlRecord").show();
    $(this).addClass("active");
});

$("#continueRecord").click(function(){
    progressClear();
    makePreview();
    $("#pnlReview").show();
    $(".progress .review").addClass("active");
});

$(".progress .review").click(function(){
    progressClear();
    makePreview();
    $("#pnlReview").show();
    $(this).addClass("active");
});

// ========== file upload
$("#upPhoto").change(function(e){
    var allowedPhotoExtensions = /(\.jpg|\.jpeg|\.png)$/i;
    var fileName = e.target.files[0].name;
    if (!allowedPhotoExtensions.exec(fileName)) {
        $("#upPhoto").value = "";
        $("#upPhotoNameError").show();
        $("#upPhotoNameError").html("Invalid file type. Please choose a JPG, JPEG, or PNG file type.");
    } else {
        $("#upPhotoName").html("File Selected: " + fileName);
        $("#upPhotoNameError").hide();
        $("#upPhotoNameError").html("");
    }
});

$("#upStory").change(function(e){
    var allowedPhotoExtensions = /(\.mp3|\.ogg)$/i;
    var fileName = e.target.files[0].name;
    if (!allowedPhotoExtensions.exec(fileName)) {
        $("#upStory").value = "";
        $("#upStoryNameError").show();
        $("#upStoryNameError").html("Invalid file type. Please choose a MP3, or OGG file type.");
    } else {
        $("#upStoryName").html("File Selected: " + fileName);
        $("#upStoryNameError").hide();
        $("#upStoryNameError").html("");
    }
});

// ========== prompts
$("#promptOptions input").change(function(e){
    if (this.value == "Other") {
        $("#otherPromptField").show();
        $("#otherPromptField input").focus();
    } else {
        $("#otherPromptField").hide();
        $("#otherPromptField input").blur();
    }
});

$("#recordOrUpload input").change(function(){
    if (this.id == "recordAudio") {
        $(".recordStory").show();
        $(".uploadStory").hide();
    } else {
        $(".recordStory").hide();
        $(".uploadStory").show();
    }
});

// ========== record
$(document).ready(function() {
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream){
            mediaRecorder = new MediaRecorder(stream);

            // ensure the recording has data
            mediaRecorder.ondataavailable = function(e){
                if (e.data.size > 0) {
                    audioChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = function(){
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                $("#audioPreview").attr("src", URL.createObjectURL(audioBlob));
            };

            mediaRecorder.onstart = function(){
                isRecording = true;
                audioChunks = [];
            }
        })
        .catch(function(e){
            $(".recordError").show();
            console.log("Error accessing microphone: " + e);
            $("#btnRecord").addClass("disabled");
            $("#btnPlay").addClass("disabled");
        });

    $("#btnRecord").click(function(){
        if (!isRecording) {
            mediaRecorder.start();
            $("#btnRecord span").html("Stop");
            $("#btnRecord svg.recordIcon").hide();
            $("#btnRecord svg.stopIcon").show();
        } else {
            mediaRecorder.stop();
            $("#btnRecord span").html("Record");
            $("#btnRecord svg.recordIcon").show();
            $("#btnRecord svg.stopIcon").hide();
        }
    });
});