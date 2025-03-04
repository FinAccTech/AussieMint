<?php
/*
Name    : ClsItemGroups (Adding, Editing, Updation Item Groups Table)
Type    : Php Class
Date    : 02-09-2023 13:31:21
Author  : Srinivasan Ra (lesunindia@gmail.com)
*/
Class ClsVoucherSeries
{
    protected $ret_sno = 0;
    protected $qstatus = 0;
    protected $qerror = "";

    public function insertRecord($data)
    {
        $SeriesSno              =   $data->SeriesSno;
        $VouTypeSno             =   $data->VouTypeSno;
        $Series_Name            =   $data->Series_Name;        
        $Num_Method             =   $data->Num_Method;
        $Allow_Duplicate        =   $data->Allow_Duplicate;
        $Start_No               =   $data->Start_No;    
        $Current_No             =   $data->Current_No;
        $Prefix                 =   $data->Prefix;
        $Suffix                 =   $data->Suffix;
        $Width                  =   $data->Width;
        $Prefill                =   $data->Prefill;
        $Print_Voucher          =   $data->Print_Voucher;
        $Print_On_Save          =   $data->Print_On_Save;
        $Show_Preview           =   $data->Show_Preview;
        $Print_Style            =   $data->Print_Style;
        $IsStd                  =   $data->IsStd;
        $IsDefault              =   $data->IsDefault;
        $Active_Status          =   $data->Active_Status;
        $Create_Date            =   $data->Create_Date;
        $UserSno                =   $data->UserSno;   
        $CompSno                =   $data->CompSno;   
 
        $sp_name = "{call Sp_Voucher_Series(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)}";

        $params = array(
                         array($SeriesSno,              SQLSRV_PARAM_IN),
                         array($VouTypeSno,             SQLSRV_PARAM_IN),
                         array($Series_Name,            SQLSRV_PARAM_IN),                         
                         array($Num_Method,             SQLSRV_PARAM_IN),
                         array($Allow_Duplicate,        SQLSRV_PARAM_IN),                         
                         array($Start_No,               SQLSRV_PARAM_IN),                         
                         array($Current_No,             SQLSRV_PARAM_IN),                         
                         array($Prefix,                 SQLSRV_PARAM_IN),                         
                         array($Suffix,                 SQLSRV_PARAM_IN),                         
                         array($Width,                  SQLSRV_PARAM_IN),                         
                         array($Prefill,                SQLSRV_PARAM_IN),                         
                         array($Print_Voucher,          SQLSRV_PARAM_IN),                         
                         array($Print_On_Save,          SQLSRV_PARAM_IN),
                         array($Show_Preview,           SQLSRV_PARAM_IN),                                                  
                         array($Print_Style,            SQLSRV_PARAM_IN),                         
                         array($IsStd,                  SQLSRV_PARAM_IN),    
                         array($IsDefault,              SQLSRV_PARAM_IN),                         
                         array($Active_Status,          SQLSRV_PARAM_IN),                         
                         array($Create_Date,            SQLSRV_PARAM_IN),                         
                         array($UserSno,                SQLSRV_PARAM_IN),    
                         array($CompSno,                SQLSRV_PARAM_IN),                         
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
        $SeriesSno  	    = $data->SeriesSno;
        $VouTypeSno  	    = $data->VouTypeSno;
        $CompSno  	      = $data->CompSno;
        
        $query      = "SELECT * FROM Udf_getVoucherSeries(".$SeriesSno.",".$VouTypeSno .",".$CompSno.")";

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
        }
        return json_encode($respData);				
    }
    

    public function getVoucherTypes($data)
    {
        $VouTypeSno = $data->VouTypeSno;
        $query      = "SELECT * FROM Voucher_Types WHERE VouTypeSno=". $VouTypeSno . " OR " . $VouTypeSno ."=0";

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
        return json_encode($respData);				
    }

    //Deleting the Record

    public function deleteRecord($data)
    {
        $SeriesSno  = $data->SeriesSno;

        $query  = "Sp_Voucher_Series_Delete ".$SeriesSno;
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
