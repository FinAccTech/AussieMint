<?php
/*
Name    : ClsAppUsers (Adding, Editing, Updation App Users in FinAccSaas Database and Registered_Clients Table)
Type    : Php Class
Date    : 02-09-2023 13:31:21
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsAppUsers
{
    protected $ret_sno = 0;
    protected $comp_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function CheckUserandgetCompanies($data)
    {
      $UserName           = $data->UserName;
      $Password           = $data->Password;

      $query        = "SELECT    Usr.*,            
                                  ISNULL((SELECT * FROM User_Rights WHERE UserSno = Usr.UserSno FOR JSON PATH),'') as Rights_Json
                                  
                        FROM     Users  Usr  WHERE UserName='".$UserName."' AND Password='" . $Password ."'";
  
      $result = sqlsrv_query($GLOBALS['$conn'],$query);
      if ($result === false) { $respData = array("queryStatus"=>0,"apiData"=>"User Database Connection fail.."); goto end; }
      else{
        $UserinfoRows = [];
        while ($row = sqlsrv_fetch_array($result)) 
        { $UserinfoRows[] = $row; }
        if (count($UserinfoRows) !==1){
          $respData = array("queryStatus"=>0,"apiData"=>"Invalid Login Credentials"); 
          goto end;
        }
        else{              
          $UserSno = $UserinfoRows[0]['UserSno'];
          if ($UserSno == 1){
            $query        = "SELECT * FROM Companies";
          }
          else{
            $query        = "SELECT * FROM Companies WHERE CompSno IN(SELECT CompSno FROM Comp_Rights WHERE UserSno=".$UserSno." AND Comp_Right=1)";
          }
          
          $result = sqlsrv_query($GLOBALS['$conn'],$query);
          if ($result === false) { $respData = array("queryStatus"=>0,"apiData"=>"User Database Connection fail.."); goto end; }
          $CompinfoRows = [];
          while ($row = sqlsrv_fetch_array($result)) 
          { $CompinfoRows[] = $row; }

          $AppSetup = [];
          IF (count($CompinfoRows) >0 ){
            $query        = "SELECT * FROM Udf_getTransaction_Setup(0,". $CompinfoRows[0]['CompSno'] .")";
            $result = sqlsrv_query($GLOBALS['$conn'],$query);
            if ($result === false) { $respData = array("queryStatus"=>0,"apiData"=>"User Database Connection fail.."); goto end; }            
            while ($row = sqlsrv_fetch_array($result)) 
            { $AppSetup[] = $row; }
          }
          
          $respData = array("queryStatus"=>1,"apiData"=>array("UserInfo"=>$UserinfoRows, "CompInfo"=>$CompinfoRows,"AppSetup"=>$AppSetup ));
        }            
      }
        
                                                      
      
      end:
      print json_encode ($respData);
    }
  }
?>
