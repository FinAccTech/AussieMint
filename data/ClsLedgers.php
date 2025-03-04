<?php
/*
Name    : ClsLeds (Adding, Editing, Updation Leds Table)
Type    : Php Class
Date    : 02-09-2023 13:31:21
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsLedgers
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $LedSno             =   $data->LedSno;
        $Led_Code           =   $data->Led_Code;
        $Led_Name           =   $data->Led_Name;
        $GrpSno             =   $data->Group->GrpSno;        
        $OpenSno            =   $data->OpenSno;        
        $Opening_Balance    =   $data->Opening_Balance;        
        $AcType             =   $data->AcType;        
        $Created_Date        =   $data->Created_Date;
        $CompSno            =   $data->CompSno;        
        $UserSno            =   $data->UserSno;        
        
        
        $sp_name = "{call SSp_AccLedger_Master(?,?,?,?,?,?,?,?,?,?,?)}";

        $params = array(
                         array($LedSno,          SQLSRV_PARAM_IN),
                         array($Led_Code,        SQLSRV_PARAM_IN),
                         array($Led_Name,        SQLSRV_PARAM_IN),
                         array($GrpSno,            SQLSRV_PARAM_IN),
                         array($OpenSno,      SQLSRV_PARAM_IN),
                         array($Opening_Balance,        SQLSRV_PARAM_IN),
                         array($AcType,        SQLSRV_PARAM_IN),                         
                         array($Created_Date,            SQLSRV_PARAM_IN),                         
                         array($CompSno,        SQLSRV_PARAM_IN),
                         array($UserSno,        SQLSRV_PARAM_IN),
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
        $LedSno  	 = $data->LedSno;
        $GrpSno  	 = $data->GrpSno;
        $CompSno  	 = $data->CompSno;
        $ExcludeGrpSno  	 = $data->ExcludeGrpSno;
        
        $query      = "SELECT * FROM Udf_getLedgers(".$LedSno. "," . $GrpSno ."," . $CompSno . "," . $ExcludeGrpSno .")";

        
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
            $respData = array("queryStatus"=>1,"apiData"=>$row['Json_Result']);			     
            print json_encode ($respData);
            die();

        }
        print json_encode($respData);				
    }

    //Deleting the Record

    public function deleteRecord($data)
    {
        $LedSno  = $data->LedSno;

        $query  = "Sp_Ledger_Delete ".$LedSno;
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

    public function getPaymentModes($data)
    {
        $CompSno  	 = $data->CompSno;
                
        $query      = "SELECT (
                                SELECT  Led.*, Led.Led_Name as 'Name', Grp.Grp_Name as 'Details'  
                                FROM    Ledgers Led 
                                        INNER JOIN Ledger_Groups Grp ON Grp.GrpSno = Led.GrpSno
                                WHERE   Led.GrpSno IN (22,23) AND Led.CompSno=".$CompSno." ORDER BY Led.LedSno FOR JSON PATH
                              ) as Json_Result";

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
            $row = sqlsrv_fetch_array($result);            
            $respData = array("queryStatus"=>1,"apiData"=>$row['Json_Result']);
			      print json_encode($respData);				
        }
    }

    public function getStandardLedgers($data)
    {
        $CompSno  	 = $data->CompSno;
                
        $query      = "SELECT * FROM Ledgers WHERE IsStd=1 AND CompSno=".$CompSno;

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
        print json_encode ($respData);	
    }
}


