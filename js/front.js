

var objectSocket = io.connect('http://localhost:8080/');
var customerId;
var customerName;
var customerEmail;
var currentSport = "tennis";
var skillLevel;

//map globals
var map;

var lngurl;
var linkurl;
var lturl;
var baseurl = "http://augmenting.me/geo/report/?coordinates=";
var comma = ", ";

//Map Marker functions
var customerMarkerId = 0;
var id = 0;
var markers = {};
var customerMarkers = {};
var addMarker = function (latLng, infoBoxText, markerGroup) {
    var image = {
        url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
    };

    var infowindow = new google.maps.InfoWindow({content: infoBoxText});

    //if customer marker allow delete marker with right click
    if (markerGroup === "customer") {
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            draggable: true,
            zIndex: google.maps.Marker.MAX_ZINDEX + 1,
            animation: google.maps.Animation.DROP,
            icon: image
        });

        map.panTo(latLng);

        customerMarkers[customerMarkerId] = marker;

        console.log(customerMarkers);

        //delete marker on right click
        google.maps.event.addListener(marker, "rightclick", function (point) {
            marker.setMap(null);
            for (var i=0; i < Object.keys(customerMarkers).length; i++) {
                if (customerMarkers[i].position.lat === marker.position.lat &&
                    customerMarkers[i].position.lng === marker.position.lng)
                {
                    delMarker(id, "customer");
                    console.log(customerMarkers);
                    customerMarkerId = customerMarkerId - 1;
                }
            }
        });

        customerMarkerId = customerMarkerId + 1;
    }
    else  {
        marker = new google.maps.Marker({
            position: latLng,
            map: map,
            animation: google.maps.Animation.DROP
        });

        map.panTo(latLng);

        markers[id] = marker;
        marker.addListener('click', function() {
            infowindow.open(map, marker);
        })

        id = id + 1;
    }
}

// Sets the map on all markers in the array.

//Only deletes customer markers
var delMarker = function (id, type) {
    if (type == "customer")
    {
        marker = customerMarkers[id];
        marker.setMap(null);
        console.log("before delete: " + customerMarkers);
        delete customerMarkers[id];
        console.log("after delete: " + customerMarkers);
    }
    else {
        marker.setMap(null);
        marker = markers[id];

    }
}

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

    //$('#loginModal').modal('show');
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

/**
 * Logout button refreshes page.
 */
$('#navSignOutButton').on('click', function(e) {
    if (e) {
        console.log(e.message);
    }

    //true reloads from the server. Default is from cache.
    location.reload(true);
});

//+++++++++++++++++++++++++Sport Option Buttons++++++++++++++++++++
$('#tennisImgButton').on('click', function(e) {
    if (e) {
        console.log(e.message);
    }
    if (customerId === undefined) {
        alert("Sign in or sign up to get started!")
    }
    else {
        currentSport = "tennis"
        var len = Object.keys(customerMarkers).length;
        if (len !== 0) {
            for (var i = 0; i < len; i++) {
                var marker = customerMarkers[i.toString()];
                marker.setMap(null);
                console.log("before delete: " + customerMarkers);
                delete customerMarkers[i.toString()];
                console.log("after delete: " + customerMarkers);
            }
            customerMarkerId = 0;
        }

        var mlen = Object.keys(markers).length;
        if (mlen  !== 0) {
            for (var i = 0; i < mlen; i++) {
                var marker = markers[i.toString()];
                marker.setMap(null);
                console.log("before delete: " + customerMarkers);
                delete markers[i.toString()];
                console.log("after delete: " + customerMarkers);
            }
            id = 0;
        }
        $('#skillModal').modal('show');
    }
});

$('#ping-pongImgButton').on('click', function(e) {
    if (e) {
        console.log(e.message);
    }
    if (customerId === undefined) {
        alert("Sign in or sign up to get started!")
    }
    else {
        currentSport = "ping-pong";
        var len = Object.keys(customerMarkers).length;
        if (len !== 0) {
            for (var i = 0; i < len; i++) {
                marker = customerMarkers[i.toString()];
                marker.setMap(null);
                console.log("before delete: " + customerMarkers);
                delete customerMarkers[i.toString()];
                console.log("after delete: " + customerMarkers);
            }
            customerMarkerId = 0;
        }

        var mlen = Object.keys(markers).length;
        if (mlen  !== 0) {
            for (var i = 0; i < mlen; i++) {
                var marker = markers[i.toString()];
                marker.setMap(null);
                console.log("before delete: " + customerMarkers);
                delete markers[i.toString()];
                console.log("after delete: " + customerMarkers);
            }
            id = 0;
        }
        $('#skillModal').modal('show');
    }

});

$('#squashImgButton').on('click', function(e) {
    if (e) {
        console.log(e.message);
    }
    if (customerId === undefined) {
        alert("Sign in or sign up to get started!")
    }
    else {
        currentSport = "squash";
        var len = Object.keys(customerMarkers).length;
        if (len !== 0) {
            for (var i = 0; i < len; i++) {
                marker = customerMarkers[i.toString()];
                marker.setMap(null);
                console.log("before delete: " + customerMarkers);
                delete customerMarkers[i.toString()];
                console.log("after delete: " + customerMarkers);
            }
            customerMarkerId = 0;
        }

        var mlen = Object.keys(markers).length;
        if (mlen  !== 0) {
            for (var i = 0; i < mlen; i++) {
                var marker = markers[i.toString()];
                marker.setMap(null);
                console.log("before delete: " + customerMarkers);
                delete markers[i.toString()];
                console.log("after delete: " + customerMarkers);
            }
            id = 0;
        }
        $('#skillModal').modal('show');
    }
});


//++++++++++++++++++++++++Handlers++++++++++++++++++++++++++++++++

/**
 * Server Error handler
 */
objectSocket.on('dbErr', function(objectData) {
    if (objectData.clientError === "emailExists") {
        alert("Sorry, we already have someone with that email. Is it you?");
    }
    else if (objectData.clientError === "noRecordLogin") {
        alert("No record found. Please sign up in first.");
        $('#signupModal').modal('show');
    }
    else if (objectData.clientError === "invalidPassword"){
         alert("invalid password for " + customerName);
    }
    else if (objectData.clientError === "unknown") {
        alert(objectData.clientError.msg);
    }
});

/**
 * On successful login.
 * Adds client name to header, changes sign in button to sign out button.
 */
objectSocket.on('loginSuccess', function(objectData) {
    $('#navWelcome').text("Welcome " + objectData.name);
    $('#navSignOutButton').prop('disabled', false);
    $('#header').slideUp();
    customerId = objectData.id;
    $('#mapSubmitButton').prop('disabled', false);
});

objectSocket.on('logout', function () {
    // $('#navWelcome').text("welcome ");
    //     // //$('#navSignOutButton').prop('disabled', true);
    //     // $('#header').slideDown();
    //window.location.reload();
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


    addMarker(myLatLng, contentString, "customer");

    $('#skillModal').modal('hide');

})

/**
 * Load pins to map
 */
objectSocket.on('pinData', function (objectData) {
    while (objectData.length > 0) {
        var pin = objectData.pop();

        var pinLatLng = {lat:pin.lat, lng:pin.lng};

        //TODO: This should be on id can't get query to work from the map_load function
        if (pin.name !== customerName) {
            //Update div infoWindow from index.html

            var divContent = "<div>" +
                "  <h2>" + pin.name + "</h2>" +
                "  <br>" +
                "  <br>" +
                "  <p>" + "Skill Level: " + pin.skill + "</p>" +
                "  <br>" +
                "  <br>" +
                "  <p>" + "Gender: " + pin.gender + "</p>" +
                "  <br>" +
                "  <br>" +
                "  <p>" + "Contact Email: " +  pin.email + "</p>" +
                "  <br>" +
                "  <br>" +
                "  <p></p>\n" +
                "\n" +
                "\n" +
                "</div>";

                console.log(divContent);
            addMarker(pinLatLng, divContent, "");
        }
    }
})


//++++++++++++++++++++++++++Map Render++++++++++++++++++++++++++++++++++++++
//  Based on: https://gist.github.com/woodwardtw/186b8633df8583d86f36

/**
 * Submits pins for customers sport of choice
 */
$('#mapSubmitButton').on('click', function(e) {
    var latLngs = [];
    for (var i = 0; i < Object.keys(customerMarkers).length; i ++) {
        marker =  marker = customerMarkers[i.toString()];
        latLngs.push(marker.position);
    }

    objectSocket.emit("clientInfoRequest", {id: customerId, latLngs: latLngs, skill: skillLevel, sport: currentSport});

    objectSocket.emit('map_load', {sport: currentSport});
});

$('#skillSubmit').on('click', function(e) {
    skillLevel = $('#skillSelect :selected').val();
    $('#skillModal').modal('hide');

    //TODO: Add other filters so that customer can select opponenent
    //Clear pins before reloading map.


   //
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

            google.maps.event.addListener(marker, "dblclick", function() {
                lturl = marker.getPosition().lat();
                lngurl = marker.getPosition().lng();
                linkurl = baseurl.concat(lturl, comma, lngurl);
                document.getElementById("linkurl").href=linkurl;

                //get pin info from server but only if skill level is defined (i.e. sport has been selected)
                if (skillLevel !== undefined) {
                    if (Object.keys(customerMarkers).length > 2) {
                        alert("3 markers is all you get for one sport")
                    }
                    else {
                        var latLng = {lat: lturl, lng: lngurl}
                        // objectSocket.emit("clientInfoRequest",
                        //     {id: customerId, lat: lturl, lng: lngurl, skill: skillLevel, sport: currentSport});
                        addMarker(latLng, "", "customer")
                    }

                }
                else {
                    alert("Select sport to get started.")
                }
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






