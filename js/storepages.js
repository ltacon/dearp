/**
 * @introduction JS file for the Static HTML Store Location Pages.
 * The google map, date/number formatter, 
 * text shorten with more link JS
 * is in this file. 
 * @author Jamie Arkin (jarkin@yext.com)
 */

(function(window, document, undefined) {    
    /**
    * Converts military time to 
    * a standard time format - 
    * the class "time" is found in 
    * file and replaced
    */
    var timeFormat = function() { 
      //The actual function that converts military time
      //to standard tme 
      var militaryToStandard = function(time) {
        time = parseInt(time);
        hours = parseInt(time / 100);
        minutes = time % 100;
        xm = "";
        if (hours > 11) {
          xm = "pm";
          hours = hours - 12;
        } else {
          xm = "am";
        }
        if (hours==0) {
          hours = 12;
        }
        if (("" + hours).length < 2) {hours = " " + hours;} else { hours = hours + "";}
        if (("" + minutes).length < 2) {minutes = "0" + minutes;} else { minutes = minutes + "";}
        return hours + ":" + minutes + " " + xm;
      };
      
      //Replaces the span class time with standard time format
      $(".time").each(function() {
        var militaryTime = $(this).text();
        var standardTime = militaryToStandard(militaryTime);
        militaryTime = militaryTime.replace(militaryTime, standardTime);
        $(this).text(militaryTime);
      });
    };

    /**
    * Formats the phone number
    * to (888) 888 - 8888
    */
    var phoneNumberFormat = function() {
      $(".phone").text(function(i, text) {
        text = text.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, "($1) $2-$3");
        return text;
      });
    }

    /**
    * Changes search link and zipcode
    * in # stores near "zip code"
    * based off the value entered 
    * in the input box
    */
    var searchLink = function() {
      function displayVals() {
        var location = $(".zip-city-state").val();
        $(".search-link").attr("href", "search/?query=" + location);   

        var zipcode = window.location.href.substring(window.location.href.lastIndexOf('=') + 1);
        $(".search-zip-code").html(zipcode);
      }
   
      $("input.zip-city-state").change(displayVals);
      displayVals();
    }

    /**
     * @constructor for all storepages
     * this include the search, 
     * location template and results page
     */
    var StorePages = function() {
      while (!this.checkForPassword()) {}
      phoneNumberFormat();
      timeFormat();
      searchLink();
    }
    window.StorePages = StorePages;

    /**
    * Check cookie for password to restrict
    * access to things in a rudimentary way
    */
    StorePages.prototype.checkForPassword = function() {
      var authCookie = $.cookie("auth");
      if (authCookie && authCookie == "iamtomdixon") {
        return true;
      } else {
        var password = prompt("Please enter your password:");
        if (password == "iamtomdixon") {
          $.cookie("auth", "iamtomdixon");
          return true;
	}
      }
      return false;
    };

    /**
     * @constructor for just the
     * location template page
     */
    var LocationPage = function(latitude, longitude) {
      // Inherit Storepages
      LocationPage.prototype = new StorePages();
      this.shortenText();
      this.locationMap(latitude, longitude);
    };
    window.LocationPage = LocationPage;

    /**
     * Shortens text based off 
     * characters and adds a more link
     * to show more text
     */
    LocationPage.prototype.shortenText = function() {
      $(".location-description").shorten({ showChars: 450 });
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
    var ResultsPage = function(latitude, longitude, markers) {
      // Inherit Storepages
      ResultsPage.prototype = new StorePages();
      this.markers = markers || []; 
      this.gmarkers = [];
      this.initializeMap(latitude, longitude);
      this.Scrollbar();
      this.bindLocationSelection();
    };
    window.ResultsPage = ResultsPage;

    /**
    * Displays a multi-marker map
    * uses the resultMarkers function 
    * to generate markers - uses 
    * latitude and longitude for 
    * the center point
    */
    ResultsPage.prototype.initializeMap = function(latitude, longitude, markers) {
      var map,
          self = this;

      function initialize() {
        var myLatlng = new google.maps.LatLng(latitude, longitude);
        var myOptions = {
          zoom: 11,
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
        
      function createMarker(latlng, name, html) {
        var contentString = html;
        var newMarker = new google.maps.Marker({
          position: latlng,
          map: map,
          zIndex: Math.round(latlng.lat()*-100000)<<5
        });

        google.maps.event.addListener(newMarker, 'click', function() {
          infowindow.setContent(contentString); 
          infowindow.open(map, newMarker);
          phoneNumberFormat();
          timeFormat();
        });
        
        self.gmarkers.push(newMarker);
      }

      initialize();
    };

    ResultsPage.prototype.showMarkerInfo = function(locationIndex) {
      google.maps.event.trigger(this.gmarkers[locationIndex], "click");
    };

    ResultsPage.prototype.bindLocationSelection = function() {
      var self = this;

      $('.js-show-location').click(function() {
        self.showMarkerInfo($(this).data('location-id'));
      });
    };

    /**
    * Creates a scrollbar for
    * the results page and sets
    * a height for the sidebar
    * based off browser height
    */
    ResultsPage.prototype.Scrollbar = function() {
      var height = $(window).height(),
          height = height - 260;
      $(".results-sidebar-content").css("height", height);

      $(window).resize(function() {
        var newHeight = $(window).height(),
            newHeight = newHeight - 260;
        $(".results-sidebar-content").css("height", newHeight);
        $(".results-sidebar-content").perfectScrollbar("update");
      });

      $(".results-sidebar-content").perfectScrollbar({
        wheelSpeed: 20,
        wheelPropagation: false
      });
    }

    /**
     * @constructor for just the
     * search page
     */
    var SearchPage = function() {
      this.findNearbyStores();
      this.backgroundSlider();
    };
    window.SearchPage = SearchPage;

    // Inherit Storepages
    SearchPage.prototype = new StorePages();

    /** 
     * This is for the search page
     * background photo slider
     */
    SearchPage.prototype.backgroundSlider = function() {
      /* For search slider */
      $('#search-content-body').bjqs({
        animtype      : 'fade',
        height        : 411,
        width         : 980,
        responsive    : true,
        randomstart   : true,
        showcontrols  : false,
        showmarkers   : false
      });
    };

    /**
    * Finds user location
    * and populates search page
    * with closest store locations
    */ 
    SearchPage.prototype.findNearbyStores = function() {
      function populateNearbyStores(nearbyStoreJson) {
        parentDiv = document.getElementById("sears-nearby-content");
        for (var ii=0; ii < nearbyStoreJson.length && ii < 6; ii++) {
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
          phoneNumber = document.createElement('span');
          phoneNumber.setAttribute('class', 'phone');

          var numberFormat = function(number) {
            return number.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, "($1) $2-$3");
          }

          var phoneNumberFormat = numberFormat(store.mainPhone);
          phoneNumber.innerHTML = phoneNumberFormat; 

          newDiv.appendChild(phoneNumber);
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

      function locationSuccess( position ){
        console.log(position.latitude);
        console.log(position.longitude);
        $.ajax({
          url: "/searchJson/",
          type: "GET",
          data: "lat=" + position.latitude + "&lng=" + position.longitude
        }).done(populateNearbyStores)
        .fail(nearbyStoresError);
      }

      function ipSuccess(data) {
        $.ajax({
          url: "http://freegeoip.net/json/" + data.ip
        }).done(locationSuccess)
        .fail(nearbyStoresError);
      }

      $.ajax({
        url: "http://smart-ip.net/geoip-json?callback=?"
      }).done(ipSuccess)
      .fail(nearbyStoresError);
    };
})(window, document);