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


function sendStory(){
    // validation
    if (!validateInfo()) { return; }
    if (!validatePrompt()) { return; }
    if (!validateStory()) { return; }

    composedEmail = '<div style="box-sizing: border-box; width:100%; background:#FFFFFF; color:#333333; padding: 12px 16px;">' +
        '<h1 style="padding:24px 32px 6px 32px; color: #01426A; border-bottom: 1px solid #01426A; font-size:24px; font-weight:bold; font-variant:small-caps;font-family:Georgia, "Times New Roman", Times, serif">New Alumni Story</h1>' +
        '<p style="font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        'An alumnus has submitted their story from Canterbury! Here\'s the details (photo and audio should be attached):</p>' +
        '<table style="width:100%; border-collapse: collapse;"><tr>' +
        '<th style="width:160px; padding:6px 12px; font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Name:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        $("#txtName") + '</td></tr><tr style="background:#b1d3e7">' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Email:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        $("#txtEmail") + '</td></tr><tr>' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Graduation Year:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' +
        $("#txtGradYear") + '</td></tr><tr style="background:#b1d3e7">' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">College:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">' + 
        $("#txtCollege") + '</td></tr><tr>' +
        '<th style="width:160px;padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt; text-align:right;">Prompt:</th>' +
        '<td style="padding:6px 12px;font-family:Verdana, Geneva, Tahoma, sans-serif; font-size:12pt;">'
        
    var prompt = $("#promptOptions input:checked").val();
    if (prompt == "Other") { prompt = $("#txtOtherPrompt").val(); }
        
    composedEmail += prompt + '</td></tr></table></div>'

    // send email
    Email.send({
        SecureToken: "1de502eb-206d-4f79-92ce-e5bf40023b6b",
        To: "canterburyalumnistories@gmail.com",
        From: "sfunderburk@canterburyfortmyers.org",
        Subject: "New Alumni Story",
        Body: composedEmail
    })
    .then(function(message){
        if (message == "OK") {  // success
            $("#shareForm").hide();
            $("#shareSuccess").show();
            $("#successName").text($("#txtName").val());
        } else {  // error
            $("#shareForm").hide();
            $("#shareError").show();

            $("#shareErrorMessage").text(message);
            $("#shareErrorName").text($("#txtName").val());
            $("#shareErrorEmail").text($("#txtEmail").val());
            $("#shareErrorYear").text($("#txtGradYear").val());
            $("#shareErrorCollege").text($("#txtCollege").val());
            $("#shareErrorPhoto").text($("#upPhoto").get(0).files[0]);
            var prompt = $("#promptOptions input:checked").val();
            if (prompt == "Other") { prompt = $("#txtOtherPrompt").val(); }
            $("#shareErrorPrompt").text(prompt);
            var story = $("#upStory").get(0).files[0];
            if (story){ $("#shareErrorStory").text(story); }
            else { $("#shareErrorStory").text("Recorded on site"); }
        }
    });
}
