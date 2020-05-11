var userID;

$( document ).ready(function() {
    signInAnon();
});

// ON AUTH STATE CHANGE
firebase.auth().onAuthStateChanged(function(user) {
if (user) {
    // Listener to automatically update the Universal Oreo Counter
    var universalEndpoint = firebase.database().ref('world/count');
    universalEndpoint.on("value", function(snapshot) {
        updateOreoCounter(snapshot.val().total);
    });
    // User info
    userID = user.uid;
    var isAnonymous = user.isAnonymous; // true if anon
} else {    // Not signed in
    // Log in ANON
    //signInAnon();
}
});

// Listener to automatically update the Universal Oreo Counter
var universalEndpoint = firebase.database().ref('world/count');
universalEndpoint.on("value", function(snapshot) {
    updateOreoCounter(snapshot.val().total);
});

// Event that triggers when user clicks the OREO BUTTON
function clickOreo(){  
    // If user has not reached daily limit - increment the universal counter
    incrementUserCount();
}

// Updates the universal count on button click
// Called in incrementUserCount()
function incrementUniversalCount(){
    // Universal endpoint  
    var universalEndpoint = firebase.database().ref('world/count');
    
    // Default world count
    var universalCount = 1;
    
    // Add oreo to the universal count
   universalEndpoint.once('value').then(function(snapshot) {
        if(snapshot.exists()) {
            universalCount = snapshot.val().total;
            universalCount += 1;
            
            universalEndpoint.set({
            total:universalCount 
            }); 
            } else {
                universalEndpoint.set({
                total:universalCount 
            });               
            }
        });  
}

// Updates the user/date/count endpoint
// Calls incrementUniversalCount() on callback
function incrementUserCount(){
    // Current userID 
    var user = firebase.auth().currentUser.uid;
    
    // Current date
    var currentDate = getDate();
    
    // User-date endpoint
    var userEndpoint = firebase.database().ref('user/' + user + '/' + currentDate);
    
    // Temp var to hold oreo count
    var currentCount = 1;
    
    // User daily limit
    var limit = 50;
    
    // Update the user/date/count endpoint
   userEndpoint.once('value').then(function(snapshot) {
        if(snapshot.exists()) {
            currentCount = snapshot.val().count;
            
            if(currentCount < limit) {  // Limit verification
                currentCount += 1;

                // Save new oreo count
                userEndpoint.set({
                count:currentCount 
                }).then(function(){
                    toggleLimitError(0);
                    incrementUniversalCount();
                });                   
            }
            else {  // User has reached limit
                toggleLimitError(1);
            };

        } else {    // First oreo of the day            
            // Save new oreo count
            userEndpoint.set({
            count:currentCount 
            }).then(function(){
                    toggleLimitError(0);
                    incrementUniversalCount();
                }); 
        }
        });    
}

// Visually updates the Universal Oreo Counter UI in real time
var updateOreoCounter = function(value) {
    $("#counter").text(value.toLocaleString());  // Updates the counter with commas
}

// Display or hide the limit error to user
function toggleLimitError(toggle){
    if(toggle == 0) $("#limit-container").css({"visibility":"hidden","height":"0","opacity":"0"});
    else $("#limit-container").css({"visibility":"visible","height":"auto","opacity":"1"});
}

// Retrieves & converts date to a string for easier/more readable storage
// @return current-date <MM/DD/YYYY>
function getDate(){
    var currentDate = new Date();
    
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    var year = currentDate.getFullYear();
    
    var returnedDate =  month + "-" + day + "-" + year;
        
    return returnedDate;
}

// Sign in user anononymously
function signInAnon() {
    firebase.auth().signInAnonymously().catch(function(error) {
    
    // Handle Errors 
    var errorCode = error.code;
    var errorMessage = error.message;
        
    console.log(errorMessage);
});
}