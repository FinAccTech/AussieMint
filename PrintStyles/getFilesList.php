<?php
  header("Access-Control-Allow-Origin: *");

  header("Access-Control-Allow-Headers: X-Requested-With");
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD, DELETE');  
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');    // cache for 1 day

    $arrFiles = array();
    $dirPath = "./styleslist";


    // Using scandir()    
    $files = scandir($dirPath);
    $filesList = array();
    
    

    foreach ($files as $file) {
        $filePath = $dirPath . '/' . $file;
        if (is_file($filePath)) {
            $filesList[] = $file;
        }
    }
  echo json_encode($filesList);  
  ?>