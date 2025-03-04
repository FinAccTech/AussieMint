<?php
/*
Name    : ClsLedger_Groups (Adding, Editing, Updation Ledger_Groups Table)
Type    : Php Class
Date    : 17-11-2024 04:44:32
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsLedger_Groups
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";



    public function insertRecord($data)
    {
        $GrpSno          =   $data->GrpSno;
        $Grp_Code          =   $data->Grp_Code;
        $Grp_Name          =   $data->Grp_Name;
        $Grp_Under          =   $data->Grp_Under;
        $Grp_Level          =   $data->Grp_Level;
        $Grp_Desc          =   $data->Grp_Desc;
        $Grp_Nature          =   $data->Grp_Nature;
        $Affect_Gp          =   $data->Affect_Gp;
        $Remarks          =   $data->Remarks;
        $IsStd          =   $data->IsStd;
        $Created_Date          =   $data->Created_Date;
        $sp_name = '{call Sp_Ledger_Groups(?,?,?,?,?,?,?,?,?,?,?,?)}';

        $params = array(

                         array($GrpSno,          SQLSRV_PARAM_IN),
                         array($Grp_Code,          SQLSRV_PARAM_IN),
                         array($Grp_Name,          SQLSRV_PARAM_IN),
                         array($Grp_Under,          SQLSRV_PARAM_IN),
                         array($Grp_Level,          SQLSRV_PARAM_IN),
                         array($Grp_Desc,          SQLSRV_PARAM_IN),
                         array($Grp_Nature,          SQLSRV_PARAM_IN),
                         array($Affect_Gp,          SQLSRV_PARAM_IN),
                         array($Remarks,          SQLSRV_PARAM_IN),
                         array($IsStd,          SQLSRV_PARAM_IN),
                         array($Created_Date,          SQLSRV_PARAM_IN),
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

        $query      = "SELECT * FROM Udf_getLedger_Groups(".$GrpSno.")";

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
        $GrpSno  = $data->GrpSno;

        $query  = 'Sp_Ledger_Groups_Delete '.$GrpSno;
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

