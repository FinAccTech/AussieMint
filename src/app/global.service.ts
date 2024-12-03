import { Injectable, numberAttribute} from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { AutoUnsubscribe } from './auto-unsubscribe.decorator';
import { MatDialog } from '@angular/material/dialog';
import { MsgboxComponent } from './GlobalWidgets/msgbox/msgbox.component';
import { SnackbarComponent } from './GlobalWidgets/snackbar/snackbar.component';
import { TypeUserRights } from './Types/TypeUser';

@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class GlobalsService 
{
  AppName: string = "FinAcc";
  AppLogoPath: string = "assets/images/logo.png";
  ServerImagePath: string = "https://finaccsaas.com/AussieMint/data/";

  constructor(private dialog: MatDialog){      
  }
  
    //Party Types
    PartyCatCustomers:   number = 1;    
    PartyCatJobWorkers:   number = 2;

    //Voucher Types    
    VTypOpening:          number = 1;
    VTypReceipt:          number = 2;
    VTypPayment:          number = 3;
    VTypJournal:          number = 4;
    VTypContra:           number = 5;
    VTypMemorandum:       number = 6;
    VTypCreditNote:       number = 7;
    VTypDebitNote:        number = 8;
    VTypChequeRETURN:     number = 9;
    VTypPurchaseOrder:    number = 10;
    VTypBuyingContract:   number = 11;
    VTypRCTI:             number = 12;
    VTypSalesOrder:       number = 13;  
    VTypDeliveryDoc:      number = 14;
    VTypSalesInvoice:     number = 15;
    VTypMeltingIssue:     number = 16;
    VTypMeltingReceipt:   number = 17;
    VTypRefiningIssue:    number = 18;
    VTypRefiningReceipt:  number = 19;
    VTypCastingIssue:     number = 20;
    VTypCastingReceipt:   number = 21;
    VTypJobworkInward:    number = 22;
    VTypJobworkDelivery:  number = 23;

    //Dialog Types    
    DialogTypeProgress  = 0; 
    DialogTypeInfo      = 1;
    DialogTypeQuestion  = 2;
    DialogTypeError     = 3;
    
    //General Status Types    
    StatusAll: number = 0;
    StatusFalse: number = 1;    
    StatusTrue: number  = 2;
    
    CancelStatusAll = 0;
    CancelStatusNotCancelled = 1;
    CancelStatusCancelled = 2

    // Standard and Constant Ledger Snos
    StdLedgerCashAc = 2;
    StdLedgerProfitandLoss = 3;	
    StdLedgerInterestIncome = 4;
    StdLedgerDocumentIncome = 5;
    StdLedgerDefaultIncome = 6;
    StdLedgerAddLess = 7;
    StdLedgerOtherIncome = 8;
    StdLedgerShortageExcess = 9;
    StdLedgerInterestPaid = 10;
    StdLedgerBankCharges = 11;

    //Form/Component Ids
     FormIdLoans = 1;
     FormIdReceipts = 2;
     FormIdRedemptions = 3;
     FormIdAuctions = 4;
     FormIdReLoan = 5;
     FormIdOpeningLoan = 6;
     FormIdOpeningReceipt = 7;

     FormIdItemGroups = 8;
     FormIdItems = 9;
     FormIdCustomers  = 10;
     FormIdSuppliers = 11;
     FormIdPurity = 12;
     FormIdAreas = 13;
     FormIdSchemes = 14;
     FormIdLocations = 15;

     FormIdRepledge = 16;
     FormIdRpPayments = 17;
     FormIdRpRedemption = 18;

     FormIdLoanSummary = 19;          
     FormIdPartyHistory = 20;
     FormIdLoanHistory = 21;
     FormIdAuctionHistory =22;
     FormIdPendingReport = 23;

     FormIdLedgerGroups = 24;
     FormIdLedgers = 25;
     FormIdVouchers = 26;

     FormIdDayBook = 27;
     FormIdGroupSummary = 28;
     FormIdTrialBalance = 29;
     FormIdProfitandLoss = 30;
     FormIdBalanceSheet = 31;

     FormIdDayHistory = 32;
     FormIdSupplierHistory = 33;
     FormIdAgeAnalysis = 34;

     
    //UserRight Types
      UserRightView       = 1;
      UserRightCreate     = 2;
      UserRightEdit       = 3;
      UserRightDelete     = 4;
      UserRightPrint      = 5;;  
      UserRightDateAccess = 6;
      UserRightSearchAccess = 7;

    GetVouTypeName(VouTypeSno: number){      
      switch (VouTypeSno) {
        case 10:
          return "Purchase Order"
          break;
        case 11:
          return "Buying Contract"
        break;
        case 12:
          return "RCTI"
        break;
        case 13:
          return "Sales Order"
        break;
        case 14:
          return "Delivery Doc"
        break;
        case 15:
          return "Sales Invoice"
        break;
        case 16:
          return "Melting Issue"
        break;
        case 17:
          return "Melting Receipt"
        break;
        case 18:
          return "Refining Issue"
        break;
        case 19:
          return "Refining Receipt"
        break;
        case 20:
          return "Casting Issue"
        break;
        case 21:
          return "Casting Receipt"
        break;
        case 22:
          return "Jobwork Inward"
        break;
        case 23:
          return "Jobwork Delivery"
        break;      
      }
      return "";
    }
  
  getTransactionImagesServerPath(CompSno: number, VouTypeSno: number): string{    
    return "Images/" + CompSno + "/Transactions/" + VouTypeSno;
  }

  getClientImagesServerPath(CompSno: number): string{    
    return "Images/" + CompSno + "/Clients";
  }

  DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }
  
  IntToDate(inputDate: any)
  {
    let argDate = inputDate.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = year + "/" + month + "/" + day;
    return new Date(newDate);
  }

  IntToDateString(inputDate: any)
  {
    let argDate = inputDate.toString();
    let year = argDate.substring(0,4);
    let month = argDate.substring(4,6);
    let day = argDate.substring(6,9);
    let newDate = day + "/" + month + "/" + year;
    return newDate;
  }

  ShowAlert(AlertType: number, Message: string ){
    // DialogType: number; // 0-Progress 1-Information 2-Question 3- Error
    const dialogRef = this.dialog.open(MsgboxComponent,
      {
        data: {"DialogType": AlertType, "Message": Message},   
      } 
      );  
      dialogRef.disableClose = true;
  }

  QuestionAlert(Message: string): Observable<number> {
    var subject = new Subject<number>();
    const dialogRef = this.dialog.open(MsgboxComponent,
      {
        data: {"DialogType": this.DialogTypeQuestion, "Message": Message},   
      } 
      );  
      dialogRef.disableClose = true;      

      dialogRef.afterClosed().subscribe(result => {        
          subject.next(result);
      });        
      return subject.asObservable();
  }

  SnackBar(Type: string, Msg: string, duration: number): void {
    // Types : "info" ,"error"
    const timeout = duration;
    const dialogRef = this.dialog.open(SnackbarComponent, {      
      minWidth:'350px',
      height: '60px',
      position: {top: '80px'} ,
      data: {"type":Type, "message": Msg},
      backdropClass: "none",   
      enterAnimationDuration: 500,
      exitAnimationDuration: 500       
    });

    dialogRef.afterOpened().subscribe(_ => {
      setTimeout(() => {
         dialogRef.close();
      }, timeout)
    })
  }

  /* ------------------------------------------For Opening Dialog with Animation----------------------------------------------------
    OpenDialog(enterAnimationDuration: string, exitAnimationDuration: string, DialogType: number, DialogText: string): void {
    this.globals.OpenDialog('500ms', '500ms',3,""); 
  ----------------------------------------------------------------------------------------------------------------------------------*/
GetUserRight(UserRights: TypeUserRights[], FormSno: number, RightType: number): boolean{
  
  if (UserRights.length < 1 ) { return true}
  let FormRight = false;
  switch (RightType) {
    case this.UserRightView:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].View_Right;
      break;
    case this.UserRightCreate:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Create_Right;
      break;
    case this.UserRightEdit:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Edit_Right;
      break;
    case this.UserRightDelete:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Delete_Right;
      break;
    case this.UserRightPrint:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Print_Right;
      break;
    case this.UserRightDateAccess:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Date_Access;
      break;
    case this.UserRightSearchAccess:
      FormRight =UserRights.filter(right=>{ return right.FormSno == FormSno})[0].Search_Access;
      break;
  }
   return FormRight;
}  

GetMonthName(Month: number, ReturnAlias: boolean):string{
  let MonthName = "";
  switch (Month) {
    case 1:
      MonthName =  ReturnAlias ? "Jan" : "January";
      break;  
    case 2:
      MonthName =  ReturnAlias ? "Feb" : "February";
      break;  
    case 3:
      MonthName =  ReturnAlias ? "Mar" : "March";
      break;  
    case 4:
      MonthName =  ReturnAlias ? "Apr" : "April";
      break;  
    case 5:
      MonthName =  ReturnAlias ? "May" : "May";
      break;  
    case 6:
      MonthName =  ReturnAlias ? "Jun" : "June";
      break;  
    case 7:
      MonthName =  ReturnAlias ? "Jul" : "July";
      break;  
    case 8:
      MonthName =  ReturnAlias ? "Aug" : "August";
      break;  
    case 9:
      MonthName =  ReturnAlias ? "Sep" : "September";
      break;  
    case 10:
      MonthName =  ReturnAlias ? "Oct" : "October";
      break;  
    case 11:
      MonthName =  ReturnAlias ? "Nov" : "November";
      break;  
    case 12:
      MonthName =  ReturnAlias ? "Dec" : "December";
      break;  
  }
  return MonthName;
}

}
