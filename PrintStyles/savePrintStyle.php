<?php
  header("Access-Control-Allow-Origin: *");

  header("Access-Control-Allow-Headers: X-Requested-With");
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD, DELETE');  
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');    // cache for 1 day

  $method   = $_SERVER['REQUEST_METHOD'];

  if ($method === "POST")
  {
  	$data = $_POST['data'];                 
  }
  else
  {
  	$data = $_GET['data'];         
  } 
    
  
  $data     = json_decode($data,false); 

  $StyleName = $data->StyleName;
  $JsonContent = $data->JsonContent;
  $savetype  = $data->savetype;

  if ($savetype == "new"){
    if (file_exists("./styleslist/".$StyleName)){
      $error = "Print Settings file already exists";
      goto end;
    }    
  }  

  $myfile = fopen("./styleslist/".$StyleName, "w") or die("Unable to open file!");  
  fwrite($myfile, $JsonContent);    
  fclose($myfile);


  $error = "File Uploded successfully";
  
  end:
  echo(json_encode($error));
  die();
  
  
  ?>