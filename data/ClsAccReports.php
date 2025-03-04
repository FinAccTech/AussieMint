<?php

Class ClsAccReports
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function getDayBook($data)
    {
        $FromDate    = $data->FromDate;
        $ToDate  	 = $data->ToDate;
        $CompSno  	 = $data->CompSno;
                
        if ($FromDate == 999 || $ToDate == 999){
            $query      = "SELECT ISNULL(MAX(Vou_Date),0) as Vou_Date FROM VW_VOUCHERDETAILS WHERE CompSno=".$CompSno;    
            $result = sqlsrv_query($GLOBALS['$conn'],$query);
            if ($result === false)
            {
                $this->qstatus = 0;
                if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
                $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
                $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
                goto end;
            }
            $row = sqlsrv_fetch_array($result);
            $FromDate   = $row['Vou_Date'];
            $ToDate     = $row['Vou_Date'];
        }

        $query      = "SELECT * FROM Udf_VoucherDisplay( ".$FromDate.",".$ToDate.",0,0,''," .$CompSno.") ORDER BY Vou_Date,VouSno";
        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $rows = array();
            while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $daybooklist = json_encode($rows);            
        }

        $query      = " SELECT      ISNULL(SUM(Credit)-SUM(Debit),0) as OpenBal
                        FROM        VW_VOUCHERDETAILS
                        WHERE       (CompSno=".$CompSno.")                   
                                    AND  GrpSno= 22 AND Vou_Date < ".$FromDate;

        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $row = sqlsrv_fetch_array($result);
            $OpenBal = $row['OpenBal'];
        }

        $query      = " SELECT      ISNULL(SUM(Credit)-SUM(Debit),0) as CloseBal
                        FROM        VW_VOUCHERDETAILS
                        WHERE       (CompSno=".$CompSno.")
                                    AND GrpSno= 22 AND Vou_Date <=".$ToDate;

        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $row = sqlsrv_fetch_array($result);
            $CloseBal = $row['CloseBal'];           
        }

        $respData = array("queryStatus"=>1,"apiData"=> array("daybooklist"=>json_encode($rows), "FromDate"=>$FromDate, "ToDate"=>$ToDate, "OpenBal"=>$OpenBal, "CloseBal"=>$CloseBal ));					
    end:
        print json_encode($respData);		
    }

    public function getLedgerBook($data)
    {
        $LedSno      = $data->LedSno;
        $FromDate    = $data->FromDate;
        $ToDate  	 = $data->ToDate;
        $CompSno  	 = $data->CompSno;
                
        if ($FromDate == 999 || $ToDate == 999){
            $query      = "SELECT ISNULL(MAX(Vou_Date),0) as Vou_Date FROM VW_VOUCHERDETAILS WHERE LedSno=". $LedSno ." AND CompSno=".$CompSno;    
            $result = sqlsrv_query($GLOBALS['$conn'],$query);
            if ($result === false)
            {
                $this->qstatus = 0;
                if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
                $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
                $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
                goto end;
            }
            $row = sqlsrv_fetch_array($result);
            $FromDate   = $row['Vou_Date'];
            $ToDate     = $row['Vou_Date'];
        }

        $query      = "SELECT * FROM Udf_LedgerBook( ". $LedSno ."," . $FromDate.",".$ToDate.",0,0," .$CompSno.") ORDER BY Vou_Date,VouSno";
        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $rows = array();
            while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $daybooklist = json_encode($rows);            
        }

        // SELECT      @OutOpnBal = [dbo].GetLedBalance(@Sno,@FromDt-1,@YearFrom,@BranchSno,@AccType)
        // SELECT      @OutCloBal  = [dbo].GetLedBalance(@Sno,@ToDt,@YearFrom,@BranchSno,@AccType)

        $query      = " SELECT      OpenBal = [dbo].Udf_GetLedBalance(".$LedSno.",".$FromDate."-1,0,0,".$CompSno.")";

        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $row = sqlsrv_fetch_array($result);
            $OpenBal = $row['OpenBal'];
        }

        $query      = " SELECT      CloseBal = [dbo].Udf_GetLedBalance(".$LedSno.",".$ToDate.",0,0,".$CompSno.")";

        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $row = sqlsrv_fetch_array($result);
            $CloseBal = $row['CloseBal'];           
        }

        $respData = array("queryStatus"=>1,"apiData"=> array("ledgerbook"=>json_encode($rows), "FromDate"=>$FromDate, "ToDate"=>$ToDate, "OpenBal"=>$OpenBal, "CloseBal"=>$CloseBal ));					
    end:
        print json_encode($respData);		
    }

    public function getTrialBalance($data)
    {
        $GrpSno         = $data->GrpSno;
        $FromDate       = $data->FromDate;
        $ToDate  	    = $data->ToDate;
        $GrpType  	    = $data->GrpType;
        $DetType  	    = $data->DetType;
        $BranchSno      = $data->BranchSno;
        $CompSno  	    = $data->CompSno;
                
        if ($DetType == 1){
            $query      = "EXEC SP_TrialBalance_Detailed " . $GrpSno . "," . $FromDate . "," . $ToDate . "," . $BranchSno . "," . $CompSno  ;
        }
        else if ($GrpType == 1){
            $query      = "EXEC SP_TrialBalance_LedWise " . $GrpSno . "," . $FromDate . "," . $ToDate . "," . $BranchSno . "," . $CompSno  ;
        }
        else{
            $query      = "EXEC SP_TrialBalance  " . $GrpSno . "," . $FromDate . "," . $ToDate . "," . $BranchSno . "," . $CompSno  ;
        }
        
        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $rows = array();
            while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }            
            $respData = array("queryStatus"=>1,"apiData"=> json_encode($rows));					
        }
    end:
        print json_encode($respData);		
    }

    public function getBalanceSheet($data)
    {        
        $FromDate       = $data->FromDate;
        $ToDate  	    = $data->ToDate;
        $GrpType  	    = $data->GrpType;
        $Valuation_Method  	    = $data->Valuation_Method;
        $BranchSno      = $data->BranchSno;
        $CompSno  	    = $data->CompSno;
                
        $query      = "SELECT * FROM Udf_GetBalanceSheet(".$FromDate.",".$ToDate.",".$GrpType.",".$Valuation_Method.",".$BranchSno.",".$CompSno.")";
        
        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $rows = array();
            while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }            
            $respData = array("queryStatus"=>1,"apiData"=> json_encode($rows));					
        }
    end:
        print json_encode($respData);		
    }

    public function getProfitandLoss($data)
    {        
        $FromDate       = $data->FromDate;
        $ToDate  	    = $data->ToDate;
        $GrpType  	    = $data->GrpType;        
        $BranchSno      = $data->BranchSno;
        $CompSno  	    = $data->CompSno;
                
        $query      = "EXEC SP_ProfitAndLoss ".$FromDate.",".$ToDate.",".$GrpType.",".$BranchSno.",".$CompSno;
        
        $result = sqlsrv_query($GLOBALS['$conn'],$query);
        if ($result === false)
        {
            $this->qstatus = 0;
              if( ($errors = sqlsrv_errors() ) != null) { foreach( $errors as $error ) { $this->qerror = $error["message"];}}
            $this->qerror = substr($this->qerror, strpos($this->qerror, "[SQL Server]")+12,strlen($this->qerror));
            $respData = array("queryStatus"=>0,"apiData"=>$this->qerror);				    		
            goto end;
        }
        Else
        {
            $rows = array();
            while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }            
            $respData = array("queryStatus"=>1,"apiData"=> json_encode($rows));					
        }
    end:
        print json_encode($respData);		
    }
}

?>
