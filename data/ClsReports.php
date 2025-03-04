<?php

Class ClsReports
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function getRecentTransactions($data)
    {
        $RowCount  	= $data->RowCount;        
        $CompSno  	  = $data->CompSno;
        
        $query      = "SELECT TOP ".$RowCount." * FROM 
						                              ( SELECT	DISTINCT(VouTypeSno)
						                                FROM	  Transactions WHERE CompSno=".$CompSno." ) as sqq";

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }

    public function getPendingDocuments($data)
    {
        $VouTypeSno  	= $data->VouTypeSno;
        $ClientSno    = $data->ClientSno;
        $CompSno  	  = $data->CompSno;
        
        $query      = "SELECT * FROM Udf_getTransactions(0,".$VouTypeSno. ",0,".$CompSno.") WHERE Pending_Status=0 AND (ClientSno=".$ClientSno." OR ". $ClientSno ."=0)";

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }

    public function getStockReport($data)
    {
        $GrpSno  	  =   $data->GrpSno;
        $CompSno  	=   $data->CompSno;
        

        $query      = "SELECT * FROM Udf_getStockReport(".$GrpSno. ",".$CompSno.") ORDER BY Item_Name";

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }

    public function getBarCodeStock($data)
    {
        $CompSno  	=   $data->CompSno;
        
        $query      = "SELECT * FROM Udf_getBarCodeStock(".$CompSno.") ORDER BY BarCodeSno DESC";

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }

    public function getAssayRecords($data)
    {
        $RecordSno  	  = $data->RecordSno;
        $CompSno  	    = $data->CompSno;
        
        $query      = "SELECT * FROM VW_ASSAY_RECORDS WHERE (RecordSno=" . $RecordSno ." OR " . $RecordSno ."=0) AND CompSno=". $CompSno ;

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }

    public function getClientHistory($data)
    {
        $ClientSno  	  = $data->ClientSno;
        //$CompSno  	    = $data->CompSno;
        
        $query      = "SELECT Trans.*, Payment_TypeStr = (CASE WHEN Payment_Type = 0 THEN 'CASH' ELSE 'CREDIT' END) FROM VW_TRANSACTIONS Trans WHERE ClientSno=". $ClientSno ." ORDER BY Trans_Date DESC";

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }
    

    public function getWeeklyConsolidated($data)
    {
        $FromDate  	  = $data->FromDate;
        $ToDate  	  = $data->ToDate;
        $VouTypeSno  	  = $data->VouTypeSno;
        $CompSno  	    = $data->CompSno;
        
        $query      = "SELECT * FROM Udf_getWeeklyConsolidated(".$FromDate.",".$ToDate.",". $CompSno.") WHERE VouTypeSno=".$VouTypeSno;

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }
    

    public function getBarCodeHistory($data)
    {
        $BarCodeSno  	    = $data->BarCodeSno;
        
        $query      = "SELECT * FROM Udf_getBarCodeHistory(".$BarCodeSno.") ORDER BY Trans_Date DESC";

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
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));					
        }
        print json_encode($respData);		
    }

}

?>
