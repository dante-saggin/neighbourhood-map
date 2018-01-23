'use strict';
const APIKEYS = {};
APIKEYS.FOURSQUARE = {}; //Base data to invoke foursquare
APIKEYS.FOURSQUARE.CLIENTID = "CYD534EGHPK3TZ0RJWXIDEL4XSQGITKKYDY4HDY33HBZUT3J";
APIKEYS.FOURSQUARE.CLIENTSECRET = "FDB54U55UEIOTXB5AEMOAANVRJJMBUPGEPNJGQM3GHPCQP4G";
APIKEYS.FOURSQUARE.VERSION = "20170827";
var map; //future map


var placesToVisit = [{
    "place": "Colosseum",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Rome",
    "location": {
        "lat": 41.8902102,
        "lng": 12.4922309
    } //for more information about catID go to https://developer.foursquare.com/categorytree this is to help to filter the results
}, {
    "place": "Trevi Fountain",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Rome",
    "location": {
        "lat": 41.9009325,
        "lng": 12.483313
    }
}, {
    "place": "Roman Forum",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Rome",
    "location": {
        "lat": 41.8924623,
        "lng": 12.485325
    }
}, {
    "place": "St. Peter's Basilica",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Rome",
    "location": {
        "lat": 41.9021667,
        "lng": 12.4539367
    }
}, {
    "place": "Vatican Museums",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Vatican",
    "location": {
        "lat": 41.9065,
        "lng": 12.4536
    }
}, {
    "place": "Janiculum Terrace",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Vatican",
    "location": {
        "lat": 41.8916196,
        "lng": 12.4610393
    }
}, {
    "place": "Pantheon",
    "catId": "4d4b7104d754a06370d81259",
    "city": "Rome",
    "location": {
        "lat": 41.8986108,
        "lng": 12.4768729
    }
}];



var Locations = function(data) {
    var self = this;
    this.visible = ko.observable(true);
    this.place = data.place;
    this.catId = data.catId;
    this.city = data.city;
    this.URL = "";
    this.street = "";
    this.phone = "";
    this.obs = "";
    this.location = data.location;


    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?near=' + this.city + '&query=' + this.place + '&categoryId=' + this.catId +
        '&client_id=' + APIKEYS.FOURSQUARE.CLIENTID + '&client_secret=' + APIKEYS.FOURSQUARE.CLIENTSECRET + "&v=" + APIKEYS.FOURSQUARE.VERSION;

    var promisse = $.getJSON(foursquareURL); //I decide to use promise to handle the async call and organize the code

    promisse.done(function(data) {
        var results = data.response.venues[0];
        typeof results.url === 'undefined' ? self.URL = "" : self.URL = results.url;
        typeof results.location.formattedAddress[0] === 'undefined' ? self.street = "" : self.street = results.location.formattedAddress[0];
        typeof results.contact.formattedPhone === 'undefined' ? self.phone = "" : self.phone = results.contact.formattedPhone;
        typeof results.hereNow.summary === 'undefined' ? self.obs = "" : self.obs = results.hereNow.summary;
        self.contentString = '<address><strong>' + self.place + '</strong><br>' +
            self.street + '<br>' +
            self.city + '<br>' +
            '<abbr title="Number of Thephone avaliable on foursquare">Phone:</abbr>' + self.phone + '<br>' +
            '<a href="' + self.URL + '"">' + self.URL +
            '</a></address><br>' +
            '<p>' + self.obs + '</p>';
    });

    promisse.fail(function(data) {
        $('body').prepend('<p>Oh no, something went wrong! Please refresh the page</p>');
        console.log("API foursquare resulted in a error\n\n" + data.responseText);
    });


    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.location),
        animation: google.maps.Animation.DROP,
        map: map,
        title: data.place
    });

    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);


    this.marker.addListener('click', function() {
        map.infoWindow.setContent(self.contentString);
        map.infoWindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function ViewModel() {
    var self = this;
    this.searchTerm = ko.observable("");
    this.locationList = ko.observableArray([]);
    placesToVisit.forEach(function(locationItem) {
        self.locationList.push(new Locations(locationItem));
    });
    this.filteredList = ko.computed(function() {
        var filterString = self.searchTerm().toLowerCase();
        return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
            var placeNameLowerCase = locationItem.place.toLowerCase();
            var boleanResult = (placeNameLowerCase.search(filterString) >= 0);
            locationItem.visible(boleanResult);
            return boleanResult;
        });
    }, self);
}

function startApp() {
    map = new google.maps.Map(document.getElementById('mapDiv'), {
        zoom: 13,
        center: { lat: 41.9028, lng: 12.4964 },
        styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#d2d1cf" }] }, { "featureType": "landscape.man_made", "elementType": "labels.text", "stylers": [{ "color": "#e32525" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "poi.attraction", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }, { "visibility": "on" }] }, { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#fcfcfc" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "visibility": "on" }, { "color": "#606060" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#363535" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#c03535" }, { "visibility": "simplified" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#c72c1c" }] }, { "featureType": "road.highway.controlled_access", "elementType": "labels.text.fill", "stylers": [{ "color": "#c72c1c" }] }, { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [{ "visibility": "simplified" }, { "color": "#a12b2b" }] }, { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#e32b18" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }, { "color": "#fffdfd" }] }, { "featureType": "road.local", "elementType": "geometry.stroke", "stylers": [{ "visibility": "on" }, { "hue": "#6300ff" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#c72c1c" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{ "color": "#370783" }, { "visibility": "off" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "saturation": "55" }, { "lightness": "80" }] }, { "featureType": "transit.station.airport", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "transit.station.bus", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station.bus", "elementType": "geometry.fill", "stylers": [{ "color": "#a10000" }] }, { "featureType": "transit.station.rail", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#6eb8ff" }] }]
    });
    map.infoWindow = new google.maps.InfoWindow();
    document.getElementById('mapDiv').style.height = (window.innerHeight - 70) + "px";
    ko.applyBindings(new ViewModel());
}


function mapsErrorHandling () {
		$('body').prepend('<p>Oh no, google maops did not load! Please refresh the page</p>');
}