<?php
$url = (isset($_GET['url'])) ? $_GET['url'] : false;
if (!$url)
   exit;

$params = array('http' => array(
   'method' => 'POST',
   'content' => 'qName=horses-potential-overall&position=0&type=race&race=0'
));

$ctx = stream_context_create($params);
$fp = @fopen('https://' . $url . '/classements/suivant', 'rb', false, $ctx);
if (!$fp)
   throw new Exception("Problem with $sUrl, $php_errormsg");

$response = @stream_get_contents($fp);
if ($response === false)
   throw new Exception("Problem reading data from $sUrl, $php_errormsg");

$cleanResponse = str_replace("<img src", "<span imgdata", utf8_encode($response));

echo $cleanResponse;
?>