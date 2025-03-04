<?php
/*
Name    : ClsUom (Adding, Editing, Updation Uom Table)
Type    : Php Class
Date    : 15-11-2024 20:08:53
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsUom
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";



    public function insertRecord($data)
    {
        $UomSno             =   $data->UomSno;
        $Uom_Code           =   $data->Uom_Code;
        $Uom_Name           =   $data->Uom_Name;
        $BaseUomSno         =   $data->BaseUom->UomSno;
        $Base_Qty           =   $data->Base_Qty;
        $Active_Status      =   $data->Active_Status;
        $Remarks            =   $data->Remarks;
        $Create_Date        =   $data->Create_Date;
        $UserSno            =   $data->UserSno;
        $CompSno            =   $data->CompSno;

        $sp_name = '{call Sp_Uom(?,?,?,?,?,?,?,?,?,?,?)}';

        $params = array(

                         array($UomSno,          SQLSRV_PARAM_IN),
                         array($Uom_Code,          SQLSRV_PARAM_IN),
                         array($Uom_Name,          SQLSRV_PARAM_IN),
                         array($BaseUomSno,          SQLSRV_PARAM_IN),
                         array($Base_Qty,          SQLSRV_PARAM_IN),
                         array($Active_Status,          SQLSRV_PARAM_IN),
                         array($Remarks,          SQLSRV_PARAM_IN),
                         array($Create_Date,          SQLSRV_PARAM_IN),
                         array($UserSno,          SQLSRV_PARAM_IN),
                         array($CompSno,          SQLSRV_PARAM_IN),
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
        $UomSno     = $data->UomSno;
        $CompSno    = $data->CompSno;

        $query      = "SELECT * FROM Udf_getUom(".$UomSno.",'".$CompSno. "')";

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
            $row = sqlsrv_fetch_array($result);            
            $respData = array('queryStatus'=>1,'apiData'=>$row['Json_Result']);            
        }
        print json_encode($respData);
    }

    //Deleting the Record
    public function deleteRecord($data)
    {
        $UomSno  = $data->UomSno;

        $query  = 'Sp_Uom_Delete '.$UomSno;
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

    public function getStdUomByCode($data)
    {
        $CompSno  	= $data->CompSno;   
        $Uom_Code   = $data->Uom_Code;     

        $query      = "SELECT *, Uom_Name as Name, 'Code: '+ Uom_Code as Details FROM Uom WHERE Uom_Code='".$Uom_Code."' AND CompSno=".$CompSno;

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

