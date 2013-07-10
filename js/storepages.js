$(document).ready(function() {        
	

	
});
/**
 * @introduction JS file for the Static HTML Store Location Pages.
 * The google map, date/number formatter, 
 * text shorten with more link JS
 * is in this file. 
 * @author Jamie Arkin (jarkin@yext.com)
 */

(function(window, document, undefined) {

  /**
   * @constructor
   */
  var Storepages = function() {
    this.shortenText(450);
    this.phoneNumberFormat();
  }
  window.Storepages = Storepages;
  
  /**
   * Shows a zoomed in map based
   * off the locations lat & long
   */
  Storepages.prototype.locationMap = function(latitude, longitude) {
  function initialize() {
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
  }

  google.maps.event.addDomListener(window, "load", initialize);
 	
  };	
  /**
   * Shortens text based off 
   * characters and adds a more link
   * to show more text
   */
  Storepages.prototype.shortenText = function(characters) {
    $(".location-description").shorten({showChars: characters});
  };

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
  

})(window, document);