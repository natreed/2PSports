

var objectSocket = io.connect('http://localhost:8080/');
var customerId;
var customerName;
var customerEmail;
var currentSport = "tennis";

//map globals
var map;
var marker;
var lngurl;
var linkurl;
var lturl;
var baseurl = "http://augmenting.me/geo/report/?coordinates=";
var comma = ", ";

//Map Marker functions
var id;
var markers = {};
var addMarker = function (latLng, infoBoxText) {
    var image = {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
    };

    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP,
        icon: image
    });
    map.panTo(latLng);
    id = marker.__gm_id;
    markers[id] = marker;

    google.maps.event.addListener(marker, "rightclick", function (point) { id = this.__gm_id; delMarker(id) });

    var infowindow = new google.maps.InfoWindow({content: infoBoxText});

    marker.addListener('mouseover', function() {
        infowindow.open(map, marker);
    })

    $('#skillModal').modal('hide');
}

var delMarker = function (id) {
    marker = markers[id];
    marker.setMap(null);
}

jQuery('#navSignInBtn').on('click', function(e) {
    $('#loginModal').modal('show');
});

jQuery('#signupButton').on('click', function(e) {
    $('#loginModal').modal('hide');
});




//++++++++++++++++++++SIGNUP+++++++++++++++++++++++++
/**
 * Signup start button. Signup modal on click.
 */
$('#signupGetStartedButton').on('click', function(e) {
    $('#signupModal').modal('hide');
    var signupData = {
        name:$('#signupName').val(),
        email:$('#signupEmail').val(),
        gender:$('#signupGenderSelect :selected').val(),
        password:$('#signupPassword').val(),
        lattitude:null,
        longtitude:null
    }

    $('#loginModal').modal('show');
    objectSocket.emit('signup', signupData);
});

/**
 * login_start button. Login modal on click.
 */
$('#loginGetStartedButton').on('click', function(e) {
    customerName = $('#loginName').val();
    customerEmail =$('#loginEmail').val();
    $('#loginModal').modal('hide');
    if (customerName === "") {
        alert("The name input field is empty.");
        $('#loginModal').modal('show');
    }
    else if (customerEmail === "") {
        alert("The email field is empty.");
        $('#loginModal').modal('show');
    }
    else if ($('#loginPassword').val() === "") {
        alert("The password input field is empty.");
        $('#loginModal').modal('show');
    }
    else {

        var loginData = {name: customerName, email: customerEmail, password:$('#loginPassword').val()}
        objectSocket.emit('login', loginData);
    }
});


//++++++++++++++++++++++++Handlers++++++++++++++++++++++++++++++++

/**
 * Server Error handler
 */
objectSocket.on('dbErr', function(objectData) {
    if (objectData.clientError === "emailExists") {
        alert("Sorry, we already have someone with that email. Is it you?");
        $('#signupModal').modal('show');
    }
    else if (objectData.clientError === "noRecordLogin") {
        alert("No record found. Please sign up in first.");
        $('#loginModal').modal('hide');
        $('#signupModal').modal('show');
    }
    else if (objectData.clientError === "invalidPassword"){
         alert("invalid password for " + customerName);
    }
    else if (objectData.clientError === "unknown") {
        alert(objectData.clientError.msg);
        $('#loginModal').modal('hide');
    }
});

/**
 * On successful login.
 * Adds client name to header, changes sign in button to sign out button.
 */
objectSocket.on('loginSuccess', function(objectData) {
    $('#navWelcome').text("Welcome " + objectData.name);
    $('#navSignInButton').text("Sign out");
    $('#header').slideUp();
    customerId = objectData.id;
});

objectSocket.on('logout', function () {
    $('#navWelcome').text("welcome ");
    $('#navSignInButton').text("Sign in");
    $('#header').slideDown();
})


/**
 * Pin information for clients own pins
 */
objectSocket.on('pinContentResponse', function (objectData) {
    var contentString = "Name: " + objectData.name +
        "\nSport: " + objectData.sport +
        "\nGender: " + objectData.gender +
        "\nSkill: " + objectData.skill +
        "\nEmail: " + objectData.email;

    var myLatLng = {lat: lturl, lng: lngurl};
    addMarker(myLatLng, contentString)

    $('#skillModal').modal('hide');

})

/**
 * Load pins to map
 */
objectSocket.on('pinData', function (objectData) {

    for (var i=0; i <objectData.length; i++) {
        //Create Content
    }

})


//++++++++++++++++++++++++++Map Render++++++++++++++++++++++++++++++++++++++
//  Based on: https://gist.github.com/woodwardtw/186b8633df8583d86f36


$('#mapSubmitButton').on('click', function(e) {
    $('#skillModal').modal('show');
});

$('#skillSubmit').on('click', function(e) {
    objectSocket.emit("clientInfoRequest", {id: customerId, lat: lturl, long: lngurl, skill: $('#skillSelect :selected').val(), sport: currentSport});
});


//set map variables
function initialize() {
    var mapOptions = {
        zoom: 18
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);


    // Try HTML5 geolocation to get location
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);

            var marker = new google.maps.Marker({
                map: map,
                position: pos,
                title: 'We are watching you.',
                draggable: true,
                icon: {
                    path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                    scale: 10,
                    strokeColor: '#FF0000'
                },
            });

            //gets the pre-drag lat/long coordinates as a pair
            document.getElementById("latbox").innerHTML=marker.getPosition().lat();

            //gets the pre-drag latlong coordinate
            document.getElementById("latbox").innerHTML=marker.getPosition().lat();
            document.getElementById("longbox").innerHTML=marker.getPosition().lng();
            lturl=marker.getPosition().lat();
            lngurl=marker.getPosition().lng();
            linkurl=baseurl.concat(lturl,comma,lngurl);
            document.getElementById("linkurl").href=linkurl;

            //gets the new latlong if the marker is dragged
            google.maps.event.addListener(marker, "drag", function(){
                document.getElementById("latbox").innerHTML=marker.getPosition().lat();
                document.getElementById("longbox").innerHTML=marker.getPosition().lng();
                lturl=marker.getPosition().lat();
                lngurl=marker.getPosition().lng();
                linkurl=baseurl.concat(lturl,comma,lngurl);
                document.getElementById("linkurl").href=linkurl;
            });



            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

}

//if it all fails
function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
    };

    var marker = new google.maps.Marker(options);
    map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);






