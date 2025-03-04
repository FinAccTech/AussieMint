<?php
/*
Name    : ClsCompanies (Adding, Editing, Updation Companies Table)
Type    : Php Class
Date    : 02-09-2023 13:31:21
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsCompanies
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {        
        $CompSno            =   $data->CompSno;
        $Comp_Code          =   $data->Comp_Code;
        $Comp_Name          =   $data->Comp_Name;
        $Fin_From           =   $data->Fin_From;
        $Fin_To             =   $data->Fin_To;
        $Books_From         =   $data->Books_From;
        $Address1           =   $data->Address1;
        $Address2           =   $data->Address2;
        $Address3           =   $data->Address3;
        $City               =   $data->City;
        $State              =   $data->State;
        $Pincode            =   $data->Pincode;
        $Email              =   $data->Email;
        $Phone              =   $data->Phone;
        $License_No         =   $data->License_No;
        $Hide_Status        =   $data->Hide_Status;
        $App_Version        =   $data->App_Version;
        $Db_Version         =   $data->Db_Version;
        $Status             =   $data->Status;        
        $CommMasters        =   $data->CommMasters;
        
        $sp_name = "{call Sp_Companies(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}";

        $params = array(
                         array($CompSno,                SQLSRV_PARAM_IN),                         
                         array($Comp_Code,              SQLSRV_PARAM_IN),
                         array($Comp_Name,              SQLSRV_PARAM_IN),
                         array($Fin_From,               SQLSRV_PARAM_IN),
                         array($Fin_To,                 SQLSRV_PARAM_IN),
                         array($Books_From,             SQLSRV_PARAM_IN),
                         array($Address1,               SQLSRV_PARAM_IN),
                         array($Address2,               SQLSRV_PARAM_IN),
                         array($Address3,               SQLSRV_PARAM_IN),
                         array($City,                   SQLSRV_PARAM_IN),
                         array($State,                  SQLSRV_PARAM_IN),
                         array($Pincode,                SQLSRV_PARAM_IN),
                         array($Email,                  SQLSRV_PARAM_IN),                         
                         array($Phone,                  SQLSRV_PARAM_IN),                         
                         array($License_No,             SQLSRV_PARAM_IN),
                         array($Hide_Status,            SQLSRV_PARAM_IN),                         
                         array($App_Version,            SQLSRV_PARAM_IN),
                         array($Db_Version,             SQLSRV_PARAM_IN),
                         array($Status,                 SQLSRV_PARAM_IN),                         
                         array($CommMasters,            SQLSRV_PARAM_IN),
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
        $UserSno       = $data->UserSno;

        if ($UserSno == 1){
          $query      = "SELECT * FROM Companies";
        }
        else{
          $query        = "SELECT * FROM Companies WHERE CompSno IN(SELECT CompSno FROM Comp_Rights WHERE UserSno=".$UserSno." AND Comp_Right=1)";
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
        else
        {
            $rows = array();
        while ($row = sqlsrv_fetch_array($result))
            {
                $rows[] = $row;
            }
            $respData = array("queryStatus"=>1,"apiData"=>json_encode($rows));			
        }
        
        return json_encode($respData);				   
    }

    //Deleting the Record

    public function deleteRecord($data)
    {
        $CompSno  = $data->CompSno;

        $query  = "Sp_Company_Delete ".$CompSno;
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
}

?>
