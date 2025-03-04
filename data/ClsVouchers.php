<?php
/*
Name    : ClsVouchers (Adding, Editing, Updation Vouchers Table)
Type    : Php Class
Date    : 02-09-2023 13:31:21
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsVouchers
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $VouSno           =   $data->VouSno;
        $VouTypeSno       =   $data->VouTypeSno;
        $SeriesSno        =   $data->Series->SeriesSno;
        $Vou_No           =   $data->Vou_No;
        $Vou_Date         =   $data->Vou_Date;        
        $Narration        =   $data->Narration;
        $TrackSno         =   $data->TrackSno;
        $IsAuto           =   $data->IsAuto;
        $GenType          =   $data->GenType;
        $UserSno          =   $data->UserSno;
        $CompSno          =   $data->CompSno;
        $VouDetailXML     =   $data->VouDetailXML;
        
        $sp_name = "{call Sp_AccVouchers(?,?,?,?,?,?,?,?,?,?,?,?,?)}";

        $params = array(
                         array($VouSno,          SQLSRV_PARAM_IN),
                         array($VouTypeSno,        SQLSRV_PARAM_IN),
                         array($SeriesSno,        SQLSRV_PARAM_IN),
                         array($Vou_No,            SQLSRV_PARAM_IN),
                         array($Vou_Date,      SQLSRV_PARAM_IN),
                         array($Narration,        SQLSRV_PARAM_IN),
                         array($TrackSno,        SQLSRV_PARAM_IN),
                         array($IsAuto,        SQLSRV_PARAM_IN),
                         array($GenType,        SQLSRV_PARAM_IN),
                         array($UserSno,            SQLSRV_PARAM_IN),
                         array($CompSno,            SQLSRV_PARAM_IN),
                         array($VouDetailXML,            SQLSRV_PARAM_IN),
                         array(&$this->ret_sno,     SQLSRV_PARAM_INOUT)
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
              $this->qerror = $error["message"];
            }
          }
          $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
        }
        Else
        {
            $this->qstatus = 1;
            sqlsrv_next_result($stmt3);
            sqlsrv_free_stmt( $stmt3);
        }
        sqlsrv_close( $GLOBALS['$conn']);
        $respData = array("queryStatus"=>$this->qstatus,"RetSno"=>$this->ret_sno,"apiData"=>$this->qerror);
		    print json_encode($respData);				        
    }

    //Displaying one or multiple records using SQL Server Stored Procedure

    public function displayRecord($data)
    {
        $VouSno  	      = $data->VouSno;
        $FromDate       = $data->FromDate;
        $ToDate         = $data->ToDate;
        $VouTypeSno  	  = $data->VouTypeSno;
        $SeriesSno  	  = $data->SeriesSno;
        $Cancel_Status  = $data->Cancel_Status;
        $CompSno	      = $data->CompSno;

        if ($FromDate === 0 || $ToDate === 0){
            $query      = "SELECT * FROM Udf_getVouchers(".$VouSno."," . $VouTypeSno . "," . $SeriesSno ."," . $CompSno. "," . $Cancel_Status .") ORDER BY VouSno DESC, Vou_No ";
        }
        else if ($FromDate === 999 || $ToDate === 999){
            $query      = "SELECT * FROM Udf_getVouchers(".$VouSno."," . $VouTypeSno . "," . $SeriesSno ."," . $CompSno. "," . $Cancel_Status .") WHERE Vou_Date = (SELECT ISNULL(MAX(Vou_Date),0) FROM VW_VOUCHERS WHERE CompSno=". $CompSno .") ORDER BY VouSno DESC";
        }
        else{
            $query      = "SELECT * FROM Udf_getVouchers(".$VouSno."," . $VouTypeSno . "," . $SeriesSno ."," . $CompSno. "," . $Cancel_Status .") WHERE Vou_Date BETWEEN ".$FromDate ." AND " . $ToDate . " ORDER BY Vou_Date";
        }
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
            $rows = array();
        while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $query      = "SELECT ISNULL(MAX(Vou_Date),0) as Vou_Date FROM Vouchers WHERE CompSno=".$CompSno;
            $result = sqlsrv_query($GLOBALS['$conn'],$query);
            $row = sqlsrv_fetch_array($result);

            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows), "ExtraData"=>$row['Vou_Date']);			
        }
        print json_encode ($respData);	
    }

    //Deleting the Record

    public function deleteRecord($data)
    {
        $VouSno  = $data->VouSno;

        $query  = "Sp_Voucher_Delete ".$VouSno;
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
        }
        Else
        {
            $this->qstatus = 1;
        }
        $respData = array("queryStatus"=>$this->qstatus,"apiData"=>$this->qerror);
		    print json_encode($respData);		
    }

    public function getVoucherCode($data)
    {
        $BranchSno	    = $data->BranchSno;

        $query      = "SELECT VouTypeSno=TRIM(VoucherCode_Prefix)+CAST((VoucherCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=". $BranchSno ;

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
            $respData = array("queryStatus"=>1,"apiData"=> $row['VouTypeSno']);			
        }
        print json_encode($respData);				
    }







    public function insertVoucherGeneral($data)
    {
        $VouSno             =   $data->VouSno;
        $Vou_No             =   $data->Vou_No;
        $Vou_Date           =   $data->Vou_Date;
        $VouTypeSno         =   $data->VouTypeSno;
        $SeriesSno          =   $data->Series->SeriesSno;
        $LedgerSno          =   $data->Ledger->LedSno;
        $Amount             =   $data->Amount;
        $Narration          =   $data->Narration;
        $CompSno            =   $data->CompSno;
        $UserSno            =   $data->UserSno;
        $PaymentModesXML    =   $data->PaymentModesXML;
        $ImageDetailXML     =   $data->ImageDetailXML;

        $sp_name = '{call Sp_Voucher_General(?,?,?,?,?,?,?,?,?,?,?,?,?,?)}';

        $retVou_No = "";

        $params = array(

                         array($VouSno,          SQLSRV_PARAM_IN),
                         array($Vou_No,          SQLSRV_PARAM_IN),
                         array($Vou_Date,          SQLSRV_PARAM_IN),
                         array($VouTypeSno,          SQLSRV_PARAM_IN),
                         array($SeriesSno,          SQLSRV_PARAM_IN),
                         array($LedgerSno,          SQLSRV_PARAM_IN),
                         array($Amount,          SQLSRV_PARAM_IN),
                         array($Narration,          SQLSRV_PARAM_IN),
                         array($CompSno,          SQLSRV_PARAM_IN),
                         array($UserSno,          SQLSRV_PARAM_IN),
                         array($PaymentModesXML,          SQLSRV_PARAM_IN),
                         array($ImageDetailXML,          SQLSRV_PARAM_IN),
                         array(&$this->ret_sno,     SQLSRV_PARAM_INOUT),
                         array(&$retVou_No,     SQLSRV_PARAM_INOUT)
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
        }
        sqlsrv_close( $GLOBALS['$conn']);
        $respData = array('queryStatus'=>$this->qstatus,'RetSno'=>$this->ret_sno,'apiData'=>$this->qerror);
            print json_encode($respData);
    }

    public function displayVoucherGeneral($data)
    {
        $VouSno  	      = $data->VouSno;
        $FromDate       = $data->FromDate;
        $ToDate         = $data->ToDate;
        $VouTypeSno  	  = $data->VouTypeSno;
        $SeriesSno  	  = $data->SeriesSno;
        $Cancel_Status  = $data->Cancel_Status;
        $CompSno	      = $data->CompSno;

        if ($FromDate === 0 || $ToDate === 0){
            $query      = "SELECT * FROM Udf_getVoucher_General(".$VouSno."," . $CompSno. ") ORDER BY VouSno DESC, Vou_No ";
        }
        else if ($FromDate === 999 || $ToDate === 999){
            $query      = "SELECT * FROM Udf_getVoucher_General(".$VouSno."," . $CompSno. ") WHERE Vou_Date = (SELECT ISNULL(MAX(Vou_Date),0) FROM VW_VOUCHERS WHERE CompSno=". $CompSno .") ORDER BY VouSno DESC";
        }
        else{
            $query      = "SELECT * FROM Udf_getVoucher_General(".$VouSno."," . $CompSno. ") WHERE Vou_Date BETWEEN ".$FromDate ." AND " . $ToDate . " ORDER BY Vou_Date";
        }
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
            $rows = array();
        while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $query  = "SELECT ISNULL(MAX(Vou_Date),0) as Vou_Date FROM Vouchers WHERE IsAuto=0 AND CompSno=".$CompSno;
            $result = sqlsrv_query($GLOBALS['$conn'],$query);
            $row    = sqlsrv_fetch_array($result);

            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows), "ExtraData"=>$row['Vou_Date']);			
        }
        print json_encode ($respData);	
    }

}

?>
