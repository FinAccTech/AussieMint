<?php
/*
Name    : ClsClient (Adding, Editing, Updation Client Table)
Type    : Php Class
Date    : 16-11-2024 04:43:33
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsClient
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $ClientSno            =   $data->ClientSno;
        $Client_Code          =   $data->Client_Code;
        $Client_Name          =   $data->Client_Name;
        $Address              =   $data->Address;
        $City                 =   $data->City;
        $Pincode              =   $data->Pincode;
        $State                =   $data->State;
        $Mobile               =   $data->Mobile;
        $Client_Type          =   $data->Client_Type;
        $Client_Cat           =   $data->Client_Cat;
        $Sex                  =   $data->Sex;
        $Dob                  =   $data->Dob;
        $Create_Date          =   $data->Create_Date;
        $Issue_Date           =   $data->Issue_Date;
        $Expiry_Date          =   $data->Expiry_Date;
        $Email                =   $data->Email;
        $Id_Number            =   $data->Id_Number;
        $Gst_Number           =   $data->Gst_Number;
        $Director_Name        =   $data->Director_Name;
        $Remarks              =   $data->Remarks;
        $Commision            =   $data->Commision;        
        $AreaSno              =    0; //$data->Area->AreaSno;
        $Blocked              =   $data->Blocked;
        $UserSno              =   $data->UserSno;
        $CompSno              =   $data->CompSno;

        $ImageDetailXML    = $data->ImageDetailXML;

        $sp_name = '{call Sp_Client(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}';
        $ret_partycode = "";

        $params = array(

                         array($ClientSno,          SQLSRV_PARAM_IN),
                         array($Client_Code,          SQLSRV_PARAM_IN),
                         array($Client_Name,          SQLSRV_PARAM_IN),
                         array($Address,          SQLSRV_PARAM_IN),
                         array($City,          SQLSRV_PARAM_IN),
                         array($Pincode,          SQLSRV_PARAM_IN),
                         array($State,          SQLSRV_PARAM_IN),
                         array($Mobile,          SQLSRV_PARAM_IN),
                         array($Client_Type,          SQLSRV_PARAM_IN),
                         array($Client_Cat,          SQLSRV_PARAM_IN),
                         array($Sex,          SQLSRV_PARAM_IN),
                         array($Dob,          SQLSRV_PARAM_IN),
                         array($Create_Date,          SQLSRV_PARAM_IN),
                         array($Issue_Date,          SQLSRV_PARAM_IN),
                         array($Expiry_Date,          SQLSRV_PARAM_IN),
                         array($Email,          SQLSRV_PARAM_IN),
                         array($Id_Number,          SQLSRV_PARAM_IN),
                         array($Gst_Number,          SQLSRV_PARAM_IN),
                         array($Director_Name,          SQLSRV_PARAM_IN),
                         array($Remarks,          SQLSRV_PARAM_IN),
                         array($Commision,          SQLSRV_PARAM_IN),
                         array($AreaSno,          SQLSRV_PARAM_IN),
                         array($Blocked,          SQLSRV_PARAM_IN),
                         array($UserSno,          SQLSRV_PARAM_IN),
                         array($CompSno,          SQLSRV_PARAM_IN),
                         array($ImageDetailXML,     SQLSRV_PARAM_IN),
                         array(&$this->ret_sno,     SQLSRV_PARAM_INOUT),
                         array(&$ret_partycode,     SQLSRV_PARAM_INOUT)
                       );

        /* Execute the query. */
        $stmt3 = sqlsrv_query( $GLOBALS['$conn'], $sp_name, $params);
        if( $stmt3 === false )
        {
          $this->qstatus = 0;
          if( ($errors = sqlsrv_errors() ) != null)
          {
            foreach( $errors as $error )
            {
              $this->qerror = $error['message'];
            }
          }
          $this->qerror = substr($this->qerror, strpos($this->qerror, '[SQL Server]')+12,strlen($this->qerror));
        }
        Else
        {
            $this->qstatus = 1;
            sqlsrv_next_result($stmt3);
            sqlsrv_free_stmt( $stmt3);

            $fileSource    =   $data->ImagesSource;      
            $folderPath    = "Images/";
            if (file_exists($folderPath ."/".$CompSno)) {} else 
            {  
              mkdir($folderPath ."/".$CompSno);                
            }

            if (file_exists($folderPath ."/".$CompSno."/Clients")) {} else 
            {  
              mkdir($folderPath ."/".$CompSno."/Clients");  
            }

            $folderPath    = "Images/".$CompSno."/Clients/";

            if ($fileSource) 
            { 
              if (file_exists($folderPath ."/".$ret_partycode)) {} else {  mkdir($folderPath ."/".$ret_partycode);  }

              $folderPath    = "Images/".$CompSno."/Clients/".$ret_partycode."/";

              foreach ($fileSource as $key => $value)
              {             
                  if ($value->SrcType == 0)
                  {
                    $image_parts = explode(";base64,", $value->Image_File);                
                    $image_type_aux = explode("image/", $image_parts[0]);
                    $image_type = $image_type_aux[1];
                    $image_base64 = base64_decode($image_parts[1]);                               
                    $file = $folderPath . $value->Image_Name; //. '.'.$image_type;
                    file_put_contents($file, $image_base64);              
                  }
                  else if ($value->DelStatus == 1)
                  {
                    unlink($folderPath.$value->Image_Name);
                  }
                  
              }  
            }
        }
        sqlsrv_close( $GLOBALS['$conn']);
        $respData = array('queryStatus'=>$this->qstatus,'RetSno'=>$this->ret_sno,'apiData'=>$this->qerror);
            print json_encode($respData);
    }

    //Displaying one or multiple records using SQL Server Stored Procedure

    public function displayRecord($data)
    {
        $ClientSno     = $data->ClientSno;
        $CompSno         = $data->CompSno;

        $query      = "SELECT * FROM Udf_getClient(".$ClientSno.",'".$CompSno. "')";

        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null)
              {
                foreach( $errors as $error )
                {
                  $this->qerror = $error['message'];
                }
              }
            $this->qerror = substr($this->qerror, strpos($this->qerror, '[SQL Server]')+12,strlen($this->qerror));
            $respData = array('queryStatus'=>0,'apiData'=>$this->qerror);
            print json_encode ($respData);
        }
        Else
        {
            $rows = array();
        while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $respData = array('queryStatus'=>1,'apiData'=>json_encode($rows));
            print json_encode($respData);
        }
    }

    public function getClientImages($data)
    {
        $ClientSno       = $data->ClientSno;        
        $CompSno        = $data->CompSno;

        $query      = " SELECT    Id.Image_Name, '' as Image_File, 'https://www.xauag.au/data/' + Id.Image_Url as Image_Url, '1' as SrcType, 0 as DelStatus 
                        FROM      Image_Details id WHERE Image_Grp=1 AND TransSno=".$ClientSno." AND CompSno=".$CompSno;

        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null)
              {
                foreach( $errors as $error )
                {
                  $this->qerror = $error["message"];
                }
              }
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				
    		print json_encode ($respData);	
        }
        Else
        {
            $rows = array();
        while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));
			      print json_encode($respData);				
        }
    }


    //Deleting the Record
    public function deleteRecord($data)
    {
        $ClientSno  = $data->ClientSno;

        $query  = 'Sp_Client_Delete '.$ClientSno;
        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
            if( ($errors = sqlsrv_errors() ) != null)
              {
                foreach( $errors as $error )
                {
                  $this->qerror = $error['message'];
                }
              }
            $this->qerror = substr($this->qerror, strpos($this->qerror, '[SQL Server]')+12,strlen($this->qerror));
        }
        Else
        {
            $this->qstatus = 1;
        }
        $respData = array('queryStatus'=>$this->qstatus,'apiData'=>$this->qerror);
            print json_encode($respData);
    }

}

?>

