<?php

// If not passed a '?url=' die
if(!isset($_GET['url'])) { die(); }

// Stop any sort of caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Get the url passed and request it
$url = urldecode($_GET['url']);
$url = 'http://' . str_replace('http://', '', $url); // Avoid accessing the file system
echo file_get_contents($url);

?>
