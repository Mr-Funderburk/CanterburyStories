var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var canRecord = true;

var alumnus = {
    name: "",
    email: "",
    year: "",
    college: "",
    photo: "",
    photoUri: "",
    prompt: "",
    story: "",
    storyUri: ""
};

$(document).ready(function() {
    // student's name
    $("#txtName").change(function(){ 
        if ($(this).val().trim() != "") { 
            alumnus.name = $(this).val().trim();
            $("#previewName").text(alumnus.name);
            $(this).parent().removeClass("error");
        } else {
            $(this).parent().addClass("error");
        }
    });

    // student's email
    $("#txtEmail").change(function(){ 
        let val = $(this).val().trim();
        if (val != "" && emailRegex.test(val)) { 
            alumnus.email = val;
            $(this).parent().removeClass("error");
        } else {
            $(this).parent().addClass("error");
        }
    });

    // student's Graduation Year
    $("#txtGradYear").keypress(function(e){ if (String.fromCharCode(e.keyCode).match(/[^0-9]/g)){ return false; } });
    $("#txtGradYear").change(function(){
        let val = $(this).val().trim();
        if (val != "" && val <= parseInt(new Date().getFullYear()) && val >= parseInt($("#txtGradYear").attr("min"))) {
            alumnus.year = val;
            $("#previewYear").text("'" + alumnus.year.substring(2));
            $(this).parent().removeClass("error");
        } else {
            $(this).parent().addClass("error");
        }
    });

    // student's college
    $("#txtCollege").change(function(){ 
        if ($(this).val().trim() != "") { 
            alumnus.college = $(this).val().trim();
            $("#previewStory .studentCollege").text(alumnus.college);
            $(this).parent().removeClass("error");
        } else {
            $(this).parent().addClass("error");
        }
    });

    // student's photo
    $("#upPhoto").change(function(e){
        var allowedPhotoExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        var fileName = e.target.files[0].name;

        if (!allowedPhotoExtensions.exec(fileName)) {
            $("#upPhoto").value = "";
            $("#upPhotoNameError").show();
            $("#upPhotoNameError").html("Invalid file type. Please choose a JPG, JPEG, or PNG file type.");
        } else {
            $("#upPhotoName").html("File Selected: " + fileName);
            $("#upPhotoExt").text(fileName.substring(fileName.lastIndexOf(".")));
            $("#upPhotoNameError").hide();
            $("#upPhotoNameError").html("");
            alumnus.photo = e.target.files[0];
            let reader = new FileReader();
            reader.onload = function(f){
                $("#previewStory .story").css("background-image", "url(" + f.target.result + ")");
            }
            reader.readAsDataURL(alumnus.photo);

            // create the uri
            let readerUri = new FileReader();
            readerUri.readAsBinaryString(alumnus.photo);
            readerUri.onload = function(f){
                alumnus.photoUri = "data:" + alumnus.photo.type + ";base64," + btoa(readerUri.result);
            }
        }
    });

    // student's prompt
    $("#promptOptions input").change(function(){
        if ($(this).val() == "Other"){
            $("#otherPromptField").show();
            $("#otherPromptField").focus();
        } else {
            $("#otherPromptField").hide();
            $("#otherPromptField").blur();
            $("#txtOtherPrompt").val("");
            $("#txtOtherPrompt").removeClass("error");
            alumnus.prompt = $(this).val();
            $("#previewStory .studentPrompt").text(alumnus.prompt);
        }
    });

    $("#txtOtherPrompt").change(function(){
        let val = $(this).val().trim();
        if ($("#txtOtherPrompt").is(":visible") && val != ""){
            if (!val.endsWith("...")){ val += "..."; }
            alumnus.prompt = val;
            $("#previewStory .studentPrompt").text(alumnus.prompt);
            $(this).parent().removeClass("error");
        } else {
            $(this).parent().addClass("error");
        }
    });

    // record
    $("#recordOrUpload input").change(function(){
        if (this.id == "recordAudio") {
            $(".recordStory").show();
            $(".uploadStory").hide();
        } else {
            $(".recordStory").hide();
            $(".uploadStory").show();
        }
        //TODO: Get the recording
        //TODO: Add the recording to the preview
        //TODO: Check if can record; show error if not.
    });

    $("#btnRecord").click(function(){
        if (canRecord){
            if ($("#btnRecord span").text() == "Record") {
                $("#btnRecord span").text("Stop");
                $("#btnRecord .recordIcon").hide();
                $("#btnRecord .stopIcon").show();
                $("#shareContainer").addClass("recording");
                $("#recordingWarning").show();
            } else {
                $("#btnRecord span").text("Record");
                $("#btnRecord .recordIcon").show();
                $("#btnRecord .stopIcon").hide();
                $("#shareContainer").removeClass("recording");
                $("#recordingWarning").hide();
            }
        }
    });

    $("#upStory").change(function(e){
        var allowedStoryExtensions = /(\.mp3|\.ogg)$/i;
        var fileName = e.target.files[0].name;

        if (!allowedStoryExtensions.exec(fileName)){
            $("#upStory").value = "";
            $("#upStoryNameError").show();
            $("#upStoryNameError").html("Invalid file type. Please choose a MP3, or OGG file type.");
        } else {
            $("#upStoryName").html("File Selected: " + fileName);
            $("#upStoryExt").text(fileName.substring(fileName.lastIndexOf(".")));
            $("#upStoryNameError").hide();
            $("#upStoryNameError").html("");
            alumnus.story = e.target.files[0];
            $("#reviewAudioSource").attr("src", URL.createObjectURL(alumnus.story))
            $("#reviewAudio").load();

            // create the uri
            let readerUri = new FileReader();
            readerUri.readAsBinaryString(alumnus.story);
            readerUri.onload = function(f){
                alumnus.storyUri = "data:" + alumnus.story.type + ";base64," + btoa(readerUri.result);
            }
        }
    });

    //#region Progress Switching
    // ========== progress switching
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
        $("#pnlReview").show();
        $(".progress .review").addClass("active");
    });
    
    $(".progress .review").click(function(){
        progressClear();
        $("#pnlReview").show();
        $(this).addClass("active");
    });
    //#endregion
});


//#region Send Email

function sendStory(){
    // validation
    if (!validateInfo()) { return; }
    if (!validatePrompt()) { return; }
    if (!validateStory()) { return; }

    $("#btnSubmit").addClass("disabled");
    $("#btnSubmit").prop("onclick", null).off("click");
    $("#btnSubmit").text("Submitting, Please Wait...")

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
            $("#shareForm").hide();
            $("#shareSuccess").show();
            $("#successName").text(alumnus.name);
        } else {  // error
            $("#shareForm").hide();
            $("#shareError").show();

            $("#shareErrorMessage").text(message);
            $("#shareErrorName").text(alumnus.name);
            $("#shareErrorEmail").text(alumnus.email);
            $("#shareErrorYear").text(alumnus.year);
            $("#shareErrorCollege").text(alumnus.college);
            $("#shareErrorPhoto").text(alumnus.photo);
            $("#shareErrorPrompt").text(alumnus.prompt);
            $("#shareErrorStory").text(alumnus.story);
        }
    });
}

//#endregion

//#region Validation

function validateInfo(){
    $("#infoError").hide();
    errorMsg = "<ul>";

    if ($("#txtName").val().trim() == "") { errorMsg += "<li>Your name is required.</li>"; }
    if ($("#txtEmail").val().trim() == "") { errorMsg += "<li>Your email is required.</li>"; }
    if ($("#txtGradYear").val().trim() == "") { errorMsg += "<li>Your graduation year is required.</li>"; }
    if ($("#txtCollege").val().trim() == "") { errorMsg += "<li>The college you attended/are attending is required.</li>"; }
    var photo = $("#upPhoto").get(0).files[0];
    if (!photo){ errorMsg += "<li>A photo of you is required.</li>"; }

    if (errorMsg != "<ul>") { 
        errorMsg += "</ul>"
        $("#infoError").show();
        $("#infoError").html(errorMsg);
        progressClear();
        $("#pnlInfo").show();
        $(".progress .info").addClass("active");
        return false;
    }

    return true;
}

function validatePrompt(){
    $("#promptError").hide();
    errorMsg = "<ul>";

    if ($("#promptOptions input:checked").val() == "Other" && $("#txtOtherPrompt").val().trim() == ""){
        errorMsg += "<li>You must specify a prompt if you choose 'Other'.</li>";
    }

    if (errorMsg != "<ul>") { 
        errorMsg += "</ul>"
        $("#promptError").show();
        $("#promptError").html(errorMsg);
        progressClear();
        $("#pnlPrompts").show();
        $(".progress .prompt").addClass("active");
        return false;
    }

    return true;
}

function validateStory(){ // TODO: This validation doesn't work!
    if (!$("#upStory").get(0).files[0] && $("#audioPreview").src == ""){
        $("#storyError").show();
        $("#storyError").text("You must upload or record a story.");
        progressClear();
        $("#pnlStory").show();
        $(".progress .story").addClass("active");
        return false;
    }

    return true;
}

//#endregion

//#region Progress Clear

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

//#endregion
