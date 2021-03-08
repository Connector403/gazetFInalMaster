<?php 

	// current weather data for any location on Earth including over 200,000 cities! 
	$curl = curl_init();

	curl_setopt_array($curl, array(

	// "api.openweathermap.org/data/2.5/onecall?units=imperial&lat=" .$_REQUEST['lat']. "&lon=" . $_REQUEST['lng']"&appid=7bcdbdded7c9b567dbd27c1307074be9"
		CURLOPT_URL => "https://newsapi.org/v2/top-headlines?country=". $_REQUEST['country_code']. "&apiKey=ec16d6b9844a4330b844f924bb4e532c",
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => "GET"
	));

	$response = curl_exec($curl);
	$err = curl_error($curl);

	curl_close($curl);

	if ($err) {
		echo "cURL Error #:" . $err;
	} else {
		echo $response;
	}