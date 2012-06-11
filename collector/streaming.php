<?php

/**
 *	I leveraged Matt Harris's OAuth library here to take care of the connection to the Twitter Stream
 *	(https://github.com/themattharris/tmhOAuth)
 *
 *  @author Conor Luddy
 *  @version 0.1
 *
 *  10 June 2012
 */

	//Auth details
	require('../lib/netConfig.php');
	//OAuth libraries
	require '../lib/tmhOAuth.php';
	require '../lib/tmhUtilities.php';

	set_time_limit(0);//Run forever...

	//Database Connection 
	$db = mysql_connect($db_host, $username, $password);
	mysql_select_db($db_name, $db);

	//Auth keys
	$tmhOAuth = new tmhOAuth(array(
	  'consumer_key'    => $consumer_key,
	  'consumer_secret' => $consumer_secret,
	  'user_token'      => $user_token,
	  'user_secret'     => $user_secret,
	));


	//Connect to the streaming API using the filter method and only return Tweets within the specified coordinates
	$method = 'https://stream.twitter.com/1/statuses/filter.json';
	$params = array(
	  'locations' => '-10.78,51.28,-5.44,55.45' //Ireland!
	);


	//Start the stream
	$tmhOAuth->streaming_request('POST', $method, $params, 'save_to_db_callback');

	// output any response we get back AFTER the Stream has stopped -- or it errors
	tmhUtilities::pr($tmhOAuth);

	///////////////////////////////////////////////////////////////////////////////

	//This function is run repeatedly as the stream returns data
	function save_to_db_callback($data, $length, $metrics) {

		if(!($data)) {
			continue;
		}else{

			$tweet = json_decode($data);
			
			//Only save the tweet if it has coordinates set. It seems to return non geocoded tweets too, regardless of the coordinate filter on the request..
			if(isset($tweet->{'coordinates'}))
			{
				//..and only save if the coordinates are within our original filter, because a few seem to be in the UK! Better to filter this here..
				$coordinates = $tweet->{'coordinates'}->{'coordinates'};
				if(((float)$coordinates['0'] > -10.78) && ((float)$coordinates['0'] < -5.44) && ((float)$coordinates['1'] > 51.28) && ((float)$coordinates['1'] < 55.35))
				{

					//The tweet itself
					$text = mysql_real_escape_string($tweet->{'text'});
					//Twitter username
					$screen_name = mysql_real_escape_string($tweet->{'user'}->{'screen_name'});
					//Tweet Longitude & Latitude
					$longitude = mysql_real_escape_string((string)$coordinates['0']);
					$latitude = mysql_real_escape_string((string)$coordinates['1']);
					
					//Tweet is saved to database with a unique identity ID column and the current datetime
					$ok = mysql_query("INSERT INTO tweetstream (text ,screen_name, longitude, latitude ,created_at) VALUES ('$text', '$screen_name', '$longitude', '$latitude', NOW())");
					if (!$ok) {
						echo "Mysql Error: ".mysql_error();
					}
				}	
			}
			//Clear the buffer
			flush();
		}
		return file_exists(dirname(__FILE__) . '/STOP');
	}

?>

