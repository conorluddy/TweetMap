

/**
 *  Runs in a loop to update the map with tweets
 *
 *  @author Conor Luddy
 *  @version 0.1
 *
 *  10 June 2012
**/

(function( $ ){

	var last;
	var timeOut;
	var map;
	var circlesArray = [];
	var pointsArray = [];
	var markersArray = [];
	var expired = [];
	var totalExpired = 0;

  	var methods = {

	    init : function( options ) { 
		
		// Initialise the google map

		   	var stylesArray = [ { featureType: "administrative.locality", elementType: "labels", stylers: [ { visibility: "simplified" } ] },{ featureType: "road", stylers: [ { visibility: "simplified" }, { lightness: 83 }, { saturation: -74 } ] },{ featureType: "administrative.province", stylers: [ { visibility: "simplified" }, { lightness: 64 } ] },{ featureType: "administrative.country", stylers: [ { lightness: -4 }, { gamma: 1.09 }, { visibility: "off" } ] },{ featureType: "landscape.natural", stylers: [ { visibility: "on" }, { hue: "#00ff11" }, { saturation: -25 }, { lightness: 3 } ] },{ featureType: "water", stylers: [ { visibility: "on" }, { saturation: -68 }, { gamma: 0.8 } ] } ]
			var myOptions = {
			  center: new google.maps.LatLng(53.59,-9),
			  zoom: 7,
			  mapTypeId: google.maps.MapTypeId.ROADMAP,
			  styles: stylesArray
			};		
			map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

			//Start polling after the map is set up
			methods.poll();
	    },

	    poll : function( ) {

	    // Poll the database every x milliseconds to retrieve new tweets

	   		timeOut = setTimeout(methods.poll,500);
			
			methods.getTweets(last);
			methods.clearCircles();

			$('#tweetDebugInfo').html('TweetCount: ' + circlesArray.length + ' | New tweets: ' + totalExpired);

	    },

	    getTweets : function(id) {

	    // Called from the polling method - gets a JSON object back from server.php based on the ID of the last tweet
	    // in the previous batch, if one exists. Otherwise it gets the last 1000 tweets

	      	$.getJSON("collector/server.php?start="+id,
			function(data){
				$.each(data, function(count,item){
						methods.addNew(item);
						last = item.id;
				});
			});	
	    },

	    addNew : function(item) { 

		// Adds a new tweet to the map
		// Clears the speech bubble marker of the previous tweet but keeps it's heat area
		// Updates the text areas with the last tweet

			methods.clearMarkers();
			
			var latlng = new google.maps.LatLng(item['latitude'],item['longitude']);

			//Helps to build up a heat map effect
			var tweetRadial = new google.maps.Circle({
				strokeColor: "#FF2200",
				strokeOpacity: 0.02,
				strokeWeight: 30,
				fillColor: "#FF2200",
				fillOpacity: 0.015,
				map: map,
				center: latlng,
				radius: 1000
			});

			//Hovering over these will display the tweet
			var pointimage = 'img/marker.png';
			var tweetPoint = new google.maps.Marker({
				position: latlng,
			    map: map,
			    icon: pointimage,
				title: item['screen_name'] + ' : ' + item['text']
			});

			//This marker gets removed and replaced on each update
			var tweetimage = new google.maps.MarkerImage('img/tweet.png', new google.maps.Size(46, 39), new google.maps.Point(0,0), new google.maps.Point(34, 37));
			var marker = new google.maps.Marker({
			      position: latlng,
			      map: map,
				  animation: google.maps.Animation.DROP,
				  icon: tweetimage,
			      title: item['screen_name'] + ' : ' + item['text']
			});

			//The red circles and the markers are added to arrays here so they can be tracked and removed where necessary.
			//The points are left on the map even after their 'heat' circle is removed.
			circlesArray.push(tweetRadial);
			pointsArray.push(tweetPoint);
			markersArray.push(marker);

			$('#latestTweet').html(item['text'])
			$('#latestTweetAuthor').html('<a href=https://twitter.com/#!/' + item['screen_name'] + ' target=_blank >' + item['screen_name'] + '</a>');  
			$('#tweetDebugDatetime').html('[Added to DB: ' + item['created_at'] + ']')
	    },

	    clearMarkers : function() {

	    	// Remove twitter marker from the map (gets replaced with new one)

		    for (i in markersArray) {
		      markersArray[i].setMap(null);
		    };
		    markersArray.length = 0;
	    },

	    clearCircles : function() {

	    	// This makes sure we only have the latest 1000 heat circles on the map

			if (circlesArray.length > 1000)
			{
				//cut out anything older than the 1000th tweet and add it to the expired array
				expired = circlesArray.splice(0, (circlesArray.length - 1000));
				
				totalExpired += expired.length;

				//Sets any expired objects on the map to null and then dump the array contents
				for (i in expired) {
				    expired[i].setMap(null);
				};
				expired.length = 0;
			};
	    }
  };

  $.fn.tweetMap = function( method ) {

    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tweetMap' );
    }    
  
  };

})( jQuery );