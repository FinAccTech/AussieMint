<?php
/*
Name    : ClsTransactions (Adding, Editing, Updation Transactions Table)
Type    : Php Class
Date    : 28-11-2024 19:43:02
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsTransactions
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror =  "";

    public function insertRecord($data)
    {
        $TransSno             =   $data->TransSno;
        $Trans_No             =   $data->Trans_No;
        $Trans_Date           =   $data->Trans_Date;
        $VouTypeSno           =   $data->Series->VouType->VouTypeSno;
        $SeriesSno            =   $data->Series->SeriesSno;
        $Payment_Type         =   $data->Payment_Type;        
        $ClientSno            =   $data->Client->ClientSno;
        $Due_Date             =   $data->Due_Date;
        $RefSno               =   $data->RefSno;
        $BarCodeRefSno        =   $data->BarCodeRefSno;
        $TotAmount            =   $data->TotAmount;
        $TaxPer               =   $data->TaxPer;
        $TaxAmount            =   $data->TaxAmount;
        $RevAmount            =   $data->RevAmount;
        $NettAmount           =   $data->NettAmount;
        $Fixed_Price          =   $data->Fixed_Price;
        $Commision            =   $data->Commision;
        $Remarks              =   $data->Remarks;
        $Print_Remarks        =   $data->Print_Remarks;
        
        $Ref_Amount         =   $data->Ref_Amount;    
        $Doc_Balance_Amt      =   $data->Doc_Balance_Amt;   
        


        $Locked               =   $data->Locked;
        $CompSno              =   $data->CompSno;
        $UserSno              =   $data->UserSno;
        $VouSno               =   $data->VouSno;
        $ItemDetailXML        =   $data->ItemDetailXML;
        $ImageDetailXML       =   $data->ImageDetailXML;        
        $PaymentModesXML      =   $data->PaymentModesXML;

        $ret_Trans_No  = "";

        $sp_name = '{call Sp_Transactions(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}';

        $params = array(

                         array($TransSno,           SQLSRV_PARAM_IN),
                         array($Trans_No,           SQLSRV_PARAM_IN),
                         array($Trans_Date,         SQLSRV_PARAM_IN),
                         array($VouTypeSno,         SQLSRV_PARAM_IN),
                         array($SeriesSno,          SQLSRV_PARAM_IN),
                         array($Payment_Type,       SQLSRV_PARAM_IN),
                         array($ClientSno,          SQLSRV_PARAM_IN),
                         array($Due_Date,           SQLSRV_PARAM_IN),
                         array($RefSno,             SQLSRV_PARAM_IN),                         
                         array($BarCodeRefSno,      SQLSRV_PARAM_IN),
                         array($TotAmount,          SQLSRV_PARAM_IN),
                         array($TaxPer,             SQLSRV_PARAM_IN),
                         array($TaxAmount,          SQLSRV_PARAM_IN),
                         array($RevAmount,          SQLSRV_PARAM_IN),
                         array($NettAmount,         SQLSRV_PARAM_IN),
                         array($Fixed_Price,         SQLSRV_PARAM_IN),
                         array($Commision,         SQLSRV_PARAM_IN),
                         array($Remarks,            SQLSRV_PARAM_IN),
                         array($Print_Remarks,      SQLSRV_PARAM_IN),
                         array($Ref_Amount,               SQLSRV_PARAM_IN),     
                         array($Doc_Balance_Amt,           SQLSRV_PARAM_IN),     
                         array($Locked,             SQLSRV_PARAM_IN),
                         array($CompSno,            SQLSRV_PARAM_IN),
                         array($UserSno,            SQLSRV_PARAM_IN),
                         array($VouSno,             SQLSRV_PARAM_IN),
                         array($ItemDetailXML,      SQLSRV_PARAM_IN),
                         array($ImageDetailXML,     SQLSRV_PARAM_IN),
                         array($PaymentModesXML,    SQLSRV_PARAM_IN),
                         array(&$this->ret_sno,     SQLSRV_PARAM_INOUT),
                         array(&$ret_Trans_No,       SQLSRV_PARAM_INOUT)
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
            $fileSource    =   $data->ImageSource;      
            $folderPath    = "Images/";
            if (file_exists($folderPath ."/".$CompSno)) {} else 
            {  
              mkdir($folderPath ."/".$CompSno);                
            }

            if (file_exists($folderPath ."/".$CompSno."/Transactions")) {} else 
            {  
              mkdir($folderPath ."/".$CompSno."/Transactions");  
            }

            
          $folderPath    = "Images/".$CompSno."/Transactions/";

          if ($fileSource) 
          { 
            if (file_exists($folderPath ."/".$VouTypeSno)) {} else {  mkdir($folderPath ."/".$VouTypeSno);  }
            $folderPath    = "Images/".$CompSno."/Transactions/".$VouTypeSno;

            if (file_exists($folderPath ."/".$ret_Trans_No)) {} else {  mkdir($folderPath ."/".$ret_Trans_No);  }

            $folderPath    = "Images/".$CompSno."/Transactions/". $VouTypeSno ."/" . $ret_Trans_No."/";

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


    public function getVoucherNumber($data)
    {
        $SeriesSno  	    = $data->SeriesSno;        

        $query      = "SELECT ISNULL([dbo].[GenerateVoucherNo](".$SeriesSno."),'') as Vou_No";

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
        }
        Else
        {
          $row = sqlsrv_fetch_array($result);        
          $respData = array("queryStatus"=>1,"apiData"=>$row['Vou_No']);		            
        }
        print json_encode($respData);				
    }

    //Displaying one or multiple records using SQL Server Stored Procedure

    public function displayRecord($data)
    {
        $TransSno     = $data->TransSno;
        $VouTypeSno   = $data->VouTypeSno;
        $SeriesSno    = $data->SeriesSno;
        $CompSno      = $data->CompSno;
        $FromDate     = $data->FromDate;
        $ToDate       = $data->ToDate;

        // if ($FromDate === 0 || $ToDate === 0){
        //   if ($TransSno == 0){
        //     // $query      = "SELECT * FROM Udf_getTransactions(".$TransSno.",".$VouTypeSno.",".$SeriesSno.",".$CompSno. ") WHERE Trans_Date = (SELECT ISNULL(MAX(Trans_Date),0) FROM Transactions WHERE VouTypeSno=". $VouTypeSno ." AND CompSno=". $CompSno .") ORDER BY TransSno DESC";          
        //     $query      = "SELECT * FROM Udf_getTransactions(".$TransSno.",".$VouTypeSno.",".$SeriesSno.",".$CompSno. ") ORDER BY TransSno DESC";
        //   }
        //   else{
        //     $query      = "SELECT * FROM Udf_getTransactions(".$TransSno.",".$VouTypeSno.",".$SeriesSno.",".$CompSno. ")";          
        //   }
          
        // }
        // else {
        if ($TransSno == 0){
          $query      = "SELECT * FROM Udf_getTransactions(".$TransSno.",".$VouTypeSno.",".$SeriesSno.",".$CompSno. ") WHERE Trans_Date BETWEEN ".$FromDate ." AND " . $ToDate . " ORDER BY Trans_Date DESC";
        }
        else {
          $query      = "SELECT * FROM Udf_getTransactions(".$TransSno.",".$VouTypeSno.",".$SeriesSno.",".$CompSno. ")";          
        }
        // }

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
        }
        Else
        {
            $rows = array();
            while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }

            $query  = "SELECT ISNULL(MAX(Trans_Date),0) as Trans_Date FROM Transactions WHERE VouTypeSno=".$VouTypeSno." AND CompSno=".$CompSno;
            $result = sqlsrv_query($GLOBALS['$conn'],$query);
            $row = sqlsrv_fetch_array($result);

            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows), "ExtraData"=>$row['Trans_Date']);            
        }
        print json_encode($respData);
    }

    //Deleting the Record
    public function deleteRecord($data)
    {
        $TransSno  = $data->TransSno;

        $query  = 'Sp_Transaction_Delete '.$TransSno;
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

    public function mailDocument($data)
    {
      $TransSno   = $data->TransSno;
      $Email      = $data->Email;

      require 'SendEmail.php';

    }
}

?>

