<?php
/*
Name    : ClsItem_Groups (Adding, Editing, Updation Item_Groups Table)
Type    : Php Class
Date    : 13-11-2024 20:30:18
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsItem_Groups
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $GrpSno          =   $data->GrpSno;
        $Grp_Code          =   $data->Grp_Code;
        $Grp_Name          =   $data->Grp_Name;
        $Market_Rate          =   $data->Market_Rate;
        $Remarks          =   $data->Remarks;
        $Active_Status          =   $data->Active_Status;
        $Create_Date          =   $data->Create_Date;
        $UserSno          =   $data->UserSno;
        $CompSno          =   $data->CompSno;

        $sp_name = '{call Sp_Item_Groups(?,?,?,?,?,?,?,?,?,?)}';

        $params = array(
                         array($GrpSno,          SQLSRV_PARAM_IN),
                         array($Grp_Code,          SQLSRV_PARAM_IN),
                         array($Grp_Name,          SQLSRV_PARAM_IN),
                         array($Market_Rate,          SQLSRV_PARAM_IN),
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
        $GrpSno     = $data->GrpSno;
        $CompSno         = $data->CompSno;

        $query      = "SELECT * FROM Udf_getItem_Groups(".$GrpSno.",'".$CompSno. "')";

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
        $GrpSno  = $data->GrpSno;

        $query  = 'Sp_Item_Groups_Delete '.$GrpSno;
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

