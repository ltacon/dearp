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
    var Storepages = function() {
      //this.shortenText();
      this.phoneNumberFormat();
    }
    window.Storepages = Storepages;
    
    Storepages.prototype.descriptionLength = 450;

    /**
    * Formats the phone number
    * to (888) 888 - 8888
    */
    Storepages.prototype.phoneNumberFormat = function() {
      $(".phone").text(function(i, text) {
        text = text.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, "($1) $2 - $3");
        return text;
      });  
    }

    /**
     * @constructor for just the
     * location template page
     */
    var LocationPage = function() {
      // Inherit Storepages
      this.prototype = new Storepages();

      this.shortenText();
      this.locationMap();
    };
    window.ResultsPage = ResultsPage;

    LocationPage.prototype = new Storepages();

    LocationPage = function() {
    }

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
    var ResultsPage = function() {
      // Inherit Storepages
      this.prototype = new Storepages();

      this.markers = [];

      this.resultsMarker();
      this.resultsMap();
    };
    window.ResultsPage = ResultsPage;

    ResultsPage.prototype.resultsMarker = function() {
      var getName = function(storeNumber){
        return $('#result-' + storeNumber + ' h1').html();
      };

      var getDialog = function(storeNumber){
        return $('#result-dialog-' + storeNumber).html();
      };  

      this.markers = [
        {
          point : new google.maps.LatLng(41.2197356,-73.71625540000002),
          storeName : getName("1"),
          storeInfo : getDialog("1")
        },
        {
          point : new google.maps.LatLng(41.1091065,-73.547011),
          storeName : getName("2"),
          storeInfo : getDialog("2")
        },
        {
          point : new google.maps.LatLng(41.031576,-73.76887799999997),
          storeName : getName("3"),
          storeInfo : getDialog("3")
        },
        {
          point : new google.maps.LatLng(41.031576,-73.76887799999997),
          storeName : getName("4"),
          storeInfo : getDialog("4")
        },
        {
          point : new google.maps.LatLng(41.3256673,-73.8056128),
          storeName : getName("5"),
          storeInfo : getDialog("5")
        }
      ];
    };

    /**
    * Displays a multi-marker map
    * uses the resultMarkers function 
    * to generate markers - uses 
    * latitude and longitude for 
    * the center point
    */
    ResultsPage.prototype.resultsMap = function() {
      var map,
          self = this;
      
      var myLatlng = new google.maps.LatLng(41.2197356,-73.71625540000002);

      function initialize() {
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
        google.maps.event.trigger(gmarkers[i], "click");
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

        gmarkers.push(this.marker);
      }

      initialize();
    };
})(window, document);