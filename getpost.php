<?php
$url = (isset($_GET['url'])) ? $_GET['url'] : false;
if(!$url) exit;

$postdata = http_build_query(array('mode' => 'potential', 'race' => '0', 'cheval' => 0));

$opts = array('http' =>
   array('method'  => 'POST', 'header'  => 'Content-Type: application/x-www-form-urlencoded', 'content' => $postdata )
);

$context  = stream_context_create($opts);

$string = str_replace("<img src", "<span imgdata", utf8_encode(file_get_contents("https://" . $url, false, $context)));

$json = json_encode($string);
$callback = (isset($_GET['callback'])) ? $_GET['callback'] : false;
if($callback){
	$jsonp = "$callback($json)";
	header('Content-Type: application/javascript');
	echo $jsonp;
	exit;
}
echo $json;
?>