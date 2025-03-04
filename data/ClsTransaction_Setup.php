<?php
/*
Name    : ClsTransaction_Setup (Adding, Editing, Updation Transaction_Setup Table)
Type    : Php Class
Date    : 15-11-2024 16:55:04
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsTransaction_Setup
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $SetupSno               =   $data->SetupSno;
        $CompSno                =   $data->CompSno;
        $AreaCode_AutoGen       =   $data->AreaCode_AutoGen;
        $AreaCode_Prefix        =   $data->AreaCode_Prefix;
        $AreaCode_CurrentNo     =   $data->AreaCode_CurrentNo;
        $PartyCode_AutoGen      =   $data->PartyCode_AutoGen;
        $PartyCode_Prefix       =   $data->PartyCode_Prefix;
        $PartyCode_CurrentNo    =   $data->PartyCode_CurrentNo;
        $GrpCode_AutoGen        =   $data->GrpCode_AutoGen;
        $GrpCode_Prefix         =   $data->GrpCode_Prefix;
        $GrpCode_CurrentNo      =   $data->GrpCode_CurrentNo;
        $ItemCode_AutoGen       =   $data->ItemCode_AutoGen;
        $ItemCode_Prefix        =   $data->ItemCode_Prefix;
        $ItemCode_CurrentNo     =   $data->ItemCode_CurrentNo;
        $UomCode_AutoGen        =   $data->Uomode_AutoGen;
        $UomCode_Prefix         =   $data->UomCode_Prefix;
        $UomCode_CurrentNo      =   $data->UomCode_CurrentNo;
        $Images_Mandatory       =   $data->Images_Mandatory;
        $Allow_DuplicateItems   =   $data->Allow_DuplicateItems;
        $Disable_AddLess        =   $data->Disable_AddLess;
        $Entries_LockedUpto     =   $data->Entries_LockedUpto;
        $Enable_Authentication  =   $data->Enable_Authentication;
        $Enable_OldEntries      =   $data->Enable_OldEntries;
        $MobileNumberMandatory  =   $data->MobileNumberMandatory;

        $sp_name = '{call Sp_Transaction_Setup(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}';

        $params = array(

                         array($SetupSno,               SQLSRV_PARAM_IN),
                         array($CompSno,                SQLSRV_PARAM_IN),
                         array($AreaCode_AutoGen,       SQLSRV_PARAM_IN),
                         array($AreaCode_Prefix,        SQLSRV_PARAM_IN),
                         array($AreaCode_CurrentNo,     SQLSRV_PARAM_IN),
                         array($PartyCode_AutoGen,      SQLSRV_PARAM_IN),
                         array($PartyCode_Prefix,       SQLSRV_PARAM_IN),
                         array($PartyCode_CurrentNo,    SQLSRV_PARAM_IN),
                         array($GrpCode_AutoGen,        SQLSRV_PARAM_IN),
                         array($GrpCode_Prefix,         SQLSRV_PARAM_IN),
                         array($GrpCode_CurrentNo,      SQLSRV_PARAM_IN),
                         array($ItemCode_AutoGen,       SQLSRV_PARAM_IN),
                         array($ItemCode_Prefix,        SQLSRV_PARAM_IN),
                         array($ItemCode_CurrentNo,     SQLSRV_PARAM_IN),
                         array($UomCode_AutoGen,        SQLSRV_PARAM_IN),
                         array($UomCode_Prefix,         SQLSRV_PARAM_IN),
                         array($UomCode_CurrentNo,      SQLSRV_PARAM_IN),
                         array($Images_Mandatory,       SQLSRV_PARAM_IN),
                         array($Allow_DuplicateItems,   SQLSRV_PARAM_IN),
                         array($Disable_AddLess,        SQLSRV_PARAM_IN),
                         array($Entries_LockedUpto,     SQLSRV_PARAM_IN),
                         array($Enable_Authentication,  SQLSRV_PARAM_IN),
                         array($Enable_OldEntries,      SQLSRV_PARAM_IN),
                         array($MobileNumberMandatory,  SQLSRV_PARAM_IN),
                         array(&$this->ret_sno,         SQLSRV_PARAM_INOUT)
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
        $SetupSno     = $data->SetupSno;
        $CompSno      = $data->CompSno;

        $query      = "SELECT * FROM Udf_getTransaction_Setup(".$SetupSno.",'".$CompSno. "')";

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
        $SetupSno  = $data->SetupSno;

        $query  = 'Sp_Transaction_Setup_Delete '.$SetupSno;
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

