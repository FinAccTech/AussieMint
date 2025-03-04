<?php
  header("Access-Control-Allow-Origin: *");

  header("Access-Control-Allow-Headers: X-Requested-With");
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD, DELETE');  
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');    // cache for 1 day

  $StyleName = $_GET['stylename'];

  echo json_encode(file_get_contents("./styleslist/".$StyleName));  
  ?>