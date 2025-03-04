<?php  
  header("Access-Control-Allow-Origin: *");
  header("Access-Control-Allow-Headers: X-Requested-With");
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS, HEAD, DELETE');  
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Max-Age: 86400');    // cache for 1 day

  // error_reporting(E_ALL); 
  // ini_set('display_errors', 1);

  $request 	= explode("/", substr(@$_SERVER['PATH_INFO'], 1)); 	
  
  $method   = $_SERVER['REQUEST_METHOD']; 

  if ($method === "POST")
  {
  	$data = $_POST['data'];                 
  }
  else
  {
  	$data = $_GET['data'];         
  } 

	$data     = json_decode($data,false); 
  $qerror = "";
  $DbName = "";

  $GLOBALS['$serverName'] = ".\SQLNEW"; //serverName\instanceName
  $GLOBALS['$serverUsername'] = "sa";
  $GLOBALS['$serverPassword'] = "Finacc@2025";

  
  $GLOBALS['$connectionInfo'] = array( "Database"=>"AussieMint", "UID"=>$GLOBALS['$serverUsername'], "PWD"=>$GLOBALS['$serverPassword']);
  
  $GLOBALS['$conn'] = sqlsrv_connect( $GLOBALS['$serverName'], $GLOBALS['$connectionInfo']);  
  
  if(!$GLOBALS['$conn']) 
  {    
    $qerror = sqlsrv_errors();
    $respData = array("queryStatus"=>0,"apiData"=>$qerror);               
    print json_encode ($respData);                
    die();
  }

  switch ($request[1]) 
  {
    case 'CheckUserandgetCompanies':    
      require('ClsAppUsers.php');
      $action = new ClsAppUsers();
      echo ($action->CheckUserandgetCompanies($data));      
      break;     

    case 'getUsers':    
      require('ClsUsers.php');
      $action = new ClsUsers();
      echo ($action->displayRecord($data));      
      break;     
      
    case 'saveUser':    
      require('ClsUsers.php');
      $action = new ClsUsers();
      echo ($action->insertRecord($data));      
      break;     

    case 'getVoucherSeries':    
      require('ClsVoucherSeries.php');
      $action = new ClsVoucherSeries();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveVoucherSeries':    
      require('ClsVoucherSeries.php');
      $action = new ClsVoucherSeries();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteVoucherSeries':    
      require('ClsVoucherSeries.php');
      $action = new ClsVoucherSeries();
      echo ($action->deleteRecord($data));      
      break;     

    // case 'getVouchers':    
    //   require('ClsVoucherSeries.php');
    //   $action = new ClsVoucherSeries();
    //   echo ($action->displayRecord($data));      
    //   break;     

    case 'insertVoucherGeneral':    
      require('ClsVouchers.php');
      $action = new ClsVouchers();
      echo ($action->insertVoucherGeneral($data));      
      break; 
      
    case 'displayVoucherGeneral':    
      require('ClsVouchers.php');
      $action = new ClsVouchers();
      echo ($action->displayVoucherGeneral($data));      
      break; 

    case 'getVoucherTypes':    
      require('ClsVoucherSeries.php');
      $action = new ClsVoucherSeries();
      echo ($action->getVoucherTypes($data));      
      break;     

    case 'getCompanies':    
      require('ClsCompanies.php');
      $action = new ClsCompanies();
      echo ($action->displayRecord($data));      
      break; 

    case 'saveCompany':    
      require('ClsCompanies.php');
      $action = new ClsCompanies();
      echo ($action->insertRecord($data));      
      break; 

    case 'deleteCompany':    
      require('ClsCompanies.php');
      $action = new ClsCompanies();
      echo ($action->deleteRecord($data));      
      break; 

    case 'getAppSetup':    
      require('ClsTransaction_Setup.php');
      $action = new ClsTransaction_Setup();
      echo ($action->displayRecord($data));      
      break; 

    case 'saveAppSetup':    
      require('ClsTransaction_Setup.php');
      $action = new ClsTransaction_Setup();
      echo ($action->insertRecord($data));      
      break; 

    case 'getItemGroups':    
        require('ClsItem_Groups.php');
        $action = new ClsItem_Groups();
        echo ($action->displayRecord($data));      
        break;     

    case 'saveItemGroup':    
      require('ClsItem_Groups.php');
      $action = new ClsItem_Groups();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteItemGroup':    
      require('ClsItem_Groups.php');
      $action = new ClsItem_Groups();
      echo ($action->deleteRecord($data));      
      break;

    case 'getItems':    
      require('ClsItems.php');
      $action = new ClsItems();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveItem':    
      require('ClsItems.php');
      $action = new ClsItems();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteItem':    
      require('ClsItems.php');
      $action = new ClsItems();
      echo ($action->deleteRecord($data));      
      break;

    case 'getStdItemByCode':    
      require('ClsItems.php');
      $action = new ClsItems();
      echo ($action->getStdItemByCode($data));      
      break;     
      
    case 'getRefiningReceiptItems':    
      require('ClsItems.php');
      $action = new ClsItems();
      echo ($action->getRefiningReceiptItems($data));      
      break; 

    case 'getBarCodedItems':    
      require('ClsItems.php');
      $action = new ClsItems();
      echo ($action->getBarCodedItems($data));      
      break; 

    case 'getUoms':    
      require('ClsUom.php');
      $action = new ClsUom();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveUom':    
      require('ClsUom.php');
      $action = new ClsUom();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteUom':    
      require('ClsUom.php');
      $action = new ClsUom();
      echo ($action->deleteRecord($data));      
      break;

    case 'getStdUomByCode':    
      require('ClsUom.php');
      $action = new ClsUom();
      echo ($action->getStdUomByCode($data));      
      break;   

    case 'getClients':    
      require('ClsClient.php');
      $action = new ClsClient();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveClient':    
      require('ClsClient.php');
      $action = new ClsClient();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteClient':    
      require('ClsClient.php');
      $action = new ClsClient();
      echo ($action->deleteRecord($data));      
      break;
      
    case 'getClientImages':    
      require('ClsClient.php');
      $action = new ClsClient();
      echo ($action->getClientImages($data));      
      break;

    case 'getLedgerGroups':    
      require('ClsLedger_Groups.php');
      $action = new ClsLedger_Groups();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveLedgerGroup':    
      require('ClsLedger_Groups.php');
      $action = new ClsLedger_Groups();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteLedgerGroup':    
      require('ClsLedger_Groups.php');
      $action = new ClsLedger_Groups();
      echo ($action->deleteRecord($data));      
      break;

    case 'getLedgers':    
      require('ClsLedgers.php');
      $action = new ClsLedgers();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveLedger':    
      require('ClsLedgers.php');
      $action = new ClsLedgers();
      echo ($action->insertRecord($data));      
      break;     

    case 'getPaymentModes':    
      require('ClsLedgers.php');
      $action = new ClsLedgers();
      echo ($action->getPaymentModes($data));      
      break;  

    case 'deleteLedger':    
      require('ClsLedgers.php');
      $action = new ClsLedgers();
      echo ($action->deleteRecord($data));      
      break;

    case 'getTransactions':    
      require('ClsTransactions.php');
      $action = new ClsTransactions();
      echo ($action->displayRecord($data));      
      break;     

    case 'saveTransaction':    
      require('ClsTransactions.php');
      $action = new ClsTransactions();
      echo ($action->insertRecord($data));      
      break;     

    case 'deleteTransaction':    
      require('ClsTransactions.php');
      $action = new ClsTransactions();
      echo ($action->deleteRecord($data));      
      break;

    case 'getVoucherNumber':    
      require('ClsTransactions.php');
      $action = new ClsTransactions();
      echo ($action->getVoucherNumber($data));      
      break;     
    
    case 'getRecentTransactions':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getRecentTransactions($data));      
      break;     

    case 'getPendingDocuments':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getPendingDocuments($data));      
      break;     

    case 'getStockReport':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getStockReport($data));      
      break;  
      
    case 'getBarCodeStock':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getBarCodeStock($data));      
      break;  
      
    case 'getAssayRecords':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getAssayRecords($data));      
      break;  

    case 'getClientHistory':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getClientHistory($data));      
      break;  

    case 'getWeeklyConsolidated':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getWeeklyConsolidated($data));      
      break; 

    case 'getBarCodeHistory':    
      require('ClsReports.php');
      $action = new ClsReports();
      echo ($action->getBarCodeHistory($data));      
      break; 

      /*ACCOUNTS REPORTS FROM HERE */
    case 'getDayBook':    
      require('ClsAccReports.php');
      $action = new ClsAccReports();
      echo ($action->getDayBook($data));      
      break; 

    case 'getLedgerBook':    
      require('ClsAccReports.php');
      $action = new ClsAccReports();
      echo ($action->getLedgerBook($data));      
      break; 

    case 'mailDocument':    
      require('ClsTransactions.php');
      $action = new ClsTransactions();
      echo ($action->mailDocument($data));      
      break; 
  }

   

function utf8ize($d) {
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string ($d)) {
        return utf8_encode($d);
    }
    return $d;
}

function utf8_chr($cp) {

  if (!is_int($cp)) {
      exit("$cp is not integer\n");
  }

  // UTF-8 prohibits characters between U+D800 and U+DFFF
  // https://tools.ietf.org/html/rfc3629#section-3
  //
  // Q: Are there any 16-bit values that are invalid?
  // http://unicode.org/faq/utf_bom.html#utf16-7

  if ($cp < 0 || (0xD7FF < $cp && $cp < 0xE000) || 0x10FFFF < $cp) {
      exit("$cp is out of range\n");
  }

  if ($cp < 0x10000) {
      return json_decode('"\u'.bin2hex(pack('n', $cp)).'"');
  }

  // Q: Isn’t there a simpler way to do this?
  // http://unicode.org/faq/utf_bom.html#utf16-4
  $lead = 0xD800 - (0x10000 >> 10) + ($cp >> 10);
  $trail = 0xDC00 + ($cp & 0x3FF);

  return json_decode('"\u'.bin2hex(pack('n', $lead)).'\u'.bin2hex(pack('n', $trail)).'"');
}

function CheckSession()
{
  if (isset($_SESSION['IsLogged']) && ($_SESSION['IsLogged'] == true))
  {
   echo ($_SESSION['IsLogged']);

      if ((isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > 1800)) )
      {
        // last request was more than 30 minutes ago
        session_unset();     // unset $_SESSION variable for the run-time 
        session_destroy();   // destroy session data in storage
        $respData = array("queryStatus"=>0,"apiData"=>"Session Timeout");  
        print json_encode ($respData);                
        die();   
      }  
  }
  else
  {
    session_unset();     // unset $_SESSION variable for the run-time 
    session_destroy();   // destroy session data in storage
    $respData = array("queryStatus"=>0,"apiData"=>"Not Logged in");  
    print json_encode ($respData);                
    die();   
  }
}

?>