<?php

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://coronavirus-smartable.p.rapidapi.com/stats/v1/".$_REQUEST['country_code']."/",
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_FOLLOWLOCATION => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"x-rapidapi-host: coronavirus-smartable.p.rapidapi.com",
		"x-rapidapi-key: 3ef266e559mshbfb9069b50fa54ep1b4120jsnd2344d3341a5"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	echo $response;
}