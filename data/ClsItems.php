<?php
/*
Name    : ClsItem (Adding, Editing, Updation Item Table)
Type    : Php Class
Date    : 15-11-2024 19:16:00
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsItems
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $ItemSno            =   $data->ItemSno;
        $Item_Code          =   $data->Item_Code;
        $Item_Name          =   $data->Item_Name;
        $GrpSno             =   $data->IGroup->GrpSno;
        $Require_LabTest    =   $data->Require_LabTest;
        $Remarks            =   $data->Remarks;
        $Active_Status      =   $data->Active_Status;
        $Create_Date        =   $data->Create_Date;
        $UserSno            =   $data->UserSno;
        $CompSno            =   $data->CompSno;

        $sp_name = '{call Sp_Items(?,?,?,?,?,?,?,?,?,?,?)}';

        $params = array(
                         array($ItemSno,            SQLSRV_PARAM_IN),
                         array($Item_Code,          SQLSRV_PARAM_IN),
                         array($Item_Name,          SQLSRV_PARAM_IN),
                         array($GrpSno,             SQLSRV_PARAM_IN),
                         array($Require_LabTest,    SQLSRV_PARAM_IN),
                         array($Remarks,            SQLSRV_PARAM_IN),
                         array($Active_Status,      SQLSRV_PARAM_IN),
                         array($Create_Date,        SQLSRV_PARAM_IN),
                         array($UserSno,            SQLSRV_PARAM_IN),
                         array($CompSno,            SQLSRV_PARAM_IN),
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

    //Displaying one or multiple records using SQL Server Stored Procedure

    public function displayRecord($data)
    {
        $ItemSno      = $data->ItemSno;
        $GrpSno       = $data->GrpSno;
        $CompSno      = $data->CompSno;

        $query      = "SELECT * FROM Udf_getItems(".$ItemSno.",". $GrpSno .",". $CompSno. ")";

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
            $row = sqlsrv_fetch_array($result);            
            $respData = array('queryStatus'=>1,'apiData'=>$row['Json_Result']);
            print json_encode($respData);
        }
    }

    //Deleting the Record
    public function deleteRecord($data)
    {
        $ItemSno  = $data->ItemSno;

        $query  = 'Sp_Items_Delete '.$ItemSno;
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
    

    public function getStdItemByCode($data)
    {
        $CompSno  	    = $data->CompSno;   
        $Item_Code = $data->Item_Code;     

        $query      = "SELECT *, Item_Name as Name, 'Code: ' + Item_Code as Details FROM Items WHERE Item_Code='".$Item_Code."' AND CompSno=".$CompSno;

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
    
    public function getRefiningReceiptItems($data)
    {
        $CompSno  	    = $data->CompSno;        

        $query      = "SELECT *, Item_Name as Name, 'Code: ' + Item_Code as Details FROM Items WHERE Item_Code IN ('RG', 'UG', 'AUAGCL', 'AGS', 'REG' ) AND CompSno=".$CompSno;

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
    
    public function getBarCodedItems($data)
    {        
        $CompSno      =   $data->CompSno;        

        $query      = " SELECT  Bi.*, BarCode_No as 'Name', BarCode_No as 'Details'
                        FROM    Barcoded_Items Bi
                                INNER JOIN Transactions Trans ON Trans.TransSno = Bi.TransSno
                        WHERE   Trans.CompSno = ". $CompSno . "ORDER BY BarCode_No";

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

