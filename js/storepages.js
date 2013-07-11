/**
 * @introduction JS file for the Static HTML Store Location Pages.
 * The google map, date/number formatter, 
 * text shorten with more link JS
 * is in this file. 
 * @author Jamie Arkin (jarkin@yext.com)
 */

(function(window, document, undefined) {
    /**
     * @constructor for all storepages
     * this include the search, 
     * location template and results page
     */
    var StorePages = function() {
      this.phoneNumberFormat();
    }
    window.StorePages = StorePages;

    /**
    * Formats the phone number
    * to (888) 888 - 8888
    */
    StorePages.prototype.phoneNumberFormat = function() {
      $(".phone").text(function(i, text) {
        text = text.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, "($1) $2 - $3");
        return text;
      });  
    }

    /**
     * @constructor for just the
     * location template page
     */
    var LocationPage = function(latitude, longitude) {
      // Inherit Storepages
      this.prototype = new StorePages();

      this.shortenText();
      this.locationMap(latitude, longitude);
    };
    window.LocationPage = LocationPage;

    LocationPage.prototype.descriptionLength = 450; 

    /**
     * Shortens text based off 
     * characters and adds a more link
     * to show more text
     */
    LocationPage.prototype.shortenText = function() {
      $(".location-description").shorten({ showChars: this.descriptionLength });
    };

    /**
     * Shows a zoomed in map based
     * off the locations lat & long
     */
    LocationPage.prototype.locationMap = function(latitude, longitude) {
      var myLatlng = new google.maps.LatLng(latitude, longitude);
      var mapOptions = {
        zoom: 15,
        center: myLatlng,
        scrollwheel: false,
        navigationControl: false,
        mapTypeControl: false,
        scaleControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      var map = new google.maps.Map(document.getElementById("location-map"), mapOptions);

      var marker = new google.maps.Marker({
          position: myLatlng,
          map: map
      });
    }; 

 
    /**
     * @constructor for just the
     * results page
     */
    var ResultsPage = function(markers) {
      // Inherit Storepages
      this.prototype = new StorePages();

      this.markers = markers || []; 
      this.initializeMap();
      this.Scrollbar();
    };
    window.ResultsPage = ResultsPage;

    /**
    * Displays a multi-marker map
    * uses the resultMarkers function 
    * to generate markers - uses 
    * latitude and longitude for 
    * the center point
    */
    ResultsPage.prototype.initializeMap = function() {
      var map,
          self = this;
      
      function initialize() {
        var myLatlng = new google.maps.LatLng(41.2197356,-73.71625540000002);

        var myOptions = {
          zoom: 9,
          center: myLatlng,
          mapTypeControl: true,
          mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
          navigationControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        map = new google.maps.Map(document.getElementById("results-map"), myOptions);
       
        google.maps.event.addListener(map, 'click', function() {
          infowindow.close();
        });

       for (i = 0; i < self.markers.length; i++) {
          createMarker(self.markers[i].point, self.markers[i].storeName, self.markers[i].storeInfo);
        }
      }
     
      var infowindow = new google.maps.InfoWindow({ 
        size: new google.maps.Size(150,50)
      });
        
      function myClick(i) {
        google.maps.event.trigger(this.markers[i], "click");
      }

      function createMarker(latlng, name, html) {
        var contentString = html;
        var marker = new google.maps.Marker({
          position: latlng,
          map: map,
          zIndex: Math.round(latlng.lat()*-100000)<<5
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(contentString); 
          infowindow.open(map, marker);
        });
      }

      initialize();
    };

    /**
    * Creates a scrollbar for
    * the results page
    */
    ResultsPage.prototype.Scrollbar = function() {
      $('.results-sidebar-content').perfectScrollbar({
        wheelSpeed: 20,
        wheelPropagation: false
      });
    }

    /**
     * @constructor for just the
     * search page
     */
    var SeachPage = function() {
      // Inherit Storepages
      this.prototype = new StorePages();

      this.findNearbyStores();
    };
    window.SearchPage = SearchPage;

    // Check to see if this browser supports geolocation.

    SearchPage.prototype.findNearbyStores = function() {
      function populateNearbyStores(nearbyStoreJson) {
        parentDiv = document.getElementById("sears-nearby-content");
        for (var ii=0; ii < nearbyStoreJson.length; ii++) {
          store = nearbyStoreJson[ii];
          newDiv = document.createElement('div');
          newDiv.setAttribute('class', 'sears-store sears-store-'+ii);

          // Create and store store name as header/link
          storeNameHeader = document.createElement('h1');
          storeNameLink = document.createElement('a');
          storeNameLink.setAttribute('href',store.pageUrl);
          storeNameLink.setAttribute('class', 'sears-store-type');
          storeNameLink.innerHTML = store.name;
          storeNameHeader.appendChild(storeNameLink);

          newDiv.appendChild(storeNameHeader);

          // Add address information
          newDiv.appendChild(document.createElement("br"));
          newDiv.appendChild(document.createTextNode(store.address));
          newDiv.appendChild(document.createElement("br"));
          newDiv.appendChild(document.createTextNode("\n" + store.city + ", " + store.state + " " + store.postalCode));
          newDiv.appendChild(document.createElement('br'));
          newDiv.appendChild(document.createTextNode("\n" + store.mainPhone));
          newDiv.appendChild(document.createElement("br"));
          newDiv.appendChild(document.createElement("br"));
          newDiv.appendChild(document.createTextNode("\n" + store.distance + " miles away"));
          newDiv.appendChild(document.createElement("br"));
          
          parentDiv.appendChild(newDiv);
        }
      }

      function nearbyStoresError(jqXHR, textStatus, error) {
        console.log("Something went wrong: ", error);
      }

      function geolocationSuccess(position){
        $.ajax({
          url: "/searchJson/",
          type: "GET",
          data: "lat=" + position.coords.latitude + "&lng=" + position.coords.longitude
        }).done(populateNearbyStores)
        .fail(nearbyStoresError);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          geolocationSuccess,
          nearbyStoresError,
          {
            timeout: (5 * 1000),
            maximumAge: (1000 * 60 * 15),
            enableHighAccuracy: true
          }
        );
      }
    };
})(window, document);