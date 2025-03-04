<?php
/*
Name    : ClsArea (Adding, Editing, Updation Area Table)
Type    : Php Class
Date    : 15-11-2024 07:56:49
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsArea
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";



    public function insertRecord($data)
    {
        $AreaSno            =   $data->AreaSno;
        $Area_Code          =   $data->Area_Code;
        $Area_Name          =   $data->Area_Name;
        $Remarks            =   $data->Remarks;
        $Active_Status      =   $data->Active_Status;
        $Create_Date        =   $data->Create_Date;
        $UserSno            =   $data->UserSno;
        $CompSno            =   $data->CompSno;
        $sp_name = '{call Sp_Area(?,?,?,?,?,?,?,?,?)}';

        $params = array(
                         array($AreaSno,          SQLSRV_PARAM_IN),
                         array($Area_Code,          SQLSRV_PARAM_IN),
                         array($Area_Name,          SQLSRV_PARAM_IN),
                         array($Remarks,          SQLSRV_PARAM_IN),
                         array($Active_Status,          SQLSRV_PARAM_IN),
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
        $AreaSno     = $data->AreaSno;
        $CompSno         = $data->CompSno;

        $query      = "SELECT * FROM Udf_getArea(".$AreaSno.",'".$CompSno. "')";

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

    //Deleting the Record
    public function deleteRecord($data)
    {
        $AreaSno  = $data->AreaSno;

        $query  = 'Sp_Area_Delete '.$AreaSno;
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

