function sendStory(){
    Email.send({
        //Host: "smtp.elasticemail.com",
        //Username: "canterburyalumnistories@gmail.com",
        //Password: "C47A250401567F18975BE105A819D15A7826",
        SecureToken: "1de502eb-206d-4f79-92ce-e5bf40023b6b",
        To: "canterburyalumnistories@gmail.com",
        From: "canterburyalumnistories@gmail.com",
        Subject: "New Alumni Story",
        Body: "This is a plain text test."
    })
    .then(
        message => alert(message)
    );
}