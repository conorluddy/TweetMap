<?php

/**
 * 	This is called repeatedly by the javascript on the map page.
 *  Returns a JSON object containing Tweets from the database which have been saved by streaming.php
 *
 *  @author Conor Luddy
 *  @version 0.1
 *
 *  10 June 2012
 */

	//Auth details
	require('../lib/netConfig.php');

	//Connect to database.
	$db = mysql_connect($db_host, $username, $password);
	mysql_select_db($db_name, $db);
	
	//Grab the querystring variable to find out which tweet ID to continue reading from.
	$start = mysql_real_escape_string($_GET['start']);
	
	//If there's no querystring 'start' variable, or if it's zero, get the last 1000 tweets in ascending order.
	//Else get up to 100 new tweets from the start ID onwards
	if(!isset($start)){
		$query = "SELECT * FROM (SELECT * FROM tweetstream ORDER BY id DESC LIMIT 0,1000) AS tweets ORDER BY id ASC";
	}else if($start == 0){
		$query = "SELECT * FROM (SELECT * FROM tweetstream ORDER BY id DESC LIMIT 0,1000) AS tweets ORDER BY id ASC";
	}else{
		$query = 'SELECT * FROM tweetstream WHERE id > ' . $start . ' ORDER BY id ASC LIMIT 0,100';
	}

	//Run the query and save the result dataset
	$result = mysql_query($query);
	
	$data = array();
    
    //Put each row (tweet) into an array
	while ($row = mysql_fetch_assoc($result)){
		array_push($data, $row);
	}
	
	//Close connection
	mysql_close($db);

	//Build a JSON object from the array and return it to the caller
	$json = json_encode($data);
	print $json;
	
?>