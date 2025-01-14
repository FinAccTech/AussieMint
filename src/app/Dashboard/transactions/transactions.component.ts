import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GlobalsService } from '../../global.service';
import { TransactionComponent } from "./transaction/transaction.component";
import { TransactionService, TypeTransaction } from '../Services/transaction.service';
import { TableviewComponent } from '../Widgets/tableview/tableview.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { AdvancedocComponent } from './advancedoc/advancedoc.component';
import { TypeFieldInfo } from '../../Types/TypeFieldInfo';
import { VoucherprintService } from '../Services/voucherprint.service';
import { LabtestComponent } from './labtest/labtest.component';

@Component({
  selector: 'app-transactions',
  imports: [TransactionComponent, TableviewComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',   
  animations: [
    trigger('myAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [
        animate('1000ms ease-in')
      ]),
      transition('* => void', [
        animate('1000ms ease-out')
      ])
    ])
  ] 
}) 

export class TransactionsComponent {
//"#", "Trans_No", "Trans_DateStr", "Client_Name", "TotNettWt", "NettAmount","Actions"
  TransList: TypeTransaction[]= [];
  FieldNames: TypeFieldInfo[] = [
      {Field_Name:"#", Data_Type:"string" }, 
      {Field_Name:"Trans_No", Data_Type:"string" }, 
      {Field_Name:"Trans_Date", Data_Type:"date" }, 
      {Field_Name:"Client_Name", Data_Type:"string" }, 
      {Field_Name:"TotNettWt", Data_Type:"number", Decimals:3 }, 
      {Field_Name:"NettAmount", Data_Type:"number" }, 
      {Field_Name:"Actions", Data_Type:"object" }, 
    ]
  TotalFields: string[] = ["TotNettWt", "NettAmount"]
  RemoveSignal: number = 0;

  constructor(private route: ActivatedRoute, private dialog: MatDialog, private globals: GlobalsService, private transService: TransactionService, private vouPrint: VoucherprintService){
    
  }
 
  state = 'void';

  VouTypeSno: number = 0;
  VouTypeName: string = "";
  EntryMode: boolean = false;

  ChildTransaction!: TypeTransaction;

  FromDate: number = 0;
  ToDate: number = 0;


  ngOnInit(){    
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    
    this.route.params.subscribe(             
      (params: Params) => 
      { 
        this.EntryMode= false;
        this.VouTypeSno =  +(params['voutypesno']);     
        this.VouTypeName = this.globals.GetVouTypeName(this.VouTypeSno);     
        this.FromDate = 0;
        this.ToDate = 0;
        this.LoadTransactionList();        
      });  
  }

  LoadTransactionList(){
    this.transService.getTransactions(0,this.VouTypeSno, 0, this.FromDate, this.ToDate).subscribe(data=>{
      if (data.queryStatus == 1){
        this.TransList = JSON.parse(data.apiData);
        if (this.FromDate ==0 || this.ToDate == 0){          
          let newDate = new Date();          
          this.FromDate =  this.globals.DateToInt (new Date((newDate.getMonth() == 0 ? newDate.getFullYear() -1 :newDate.getFullYear()).toString() +  '/' + (newDate.getMonth() == 0 ? 12 : newDate.getMonth()).toString() + "/" + newDate.getDate().toString()));          
          this.ToDate = this.globals.DateToInt (new Date());
        }
      } 
      else{
        this.globals.ShowAlert(3,data.apiData); 
      }
    }) 
  }

  AddNewTransaction(){    
    let Trans                       = this.transService.InitializeTransaction();
    Trans.Series.VouType.VouTypeSno = this.VouTypeSno;    
    Trans.TaxPer                    = 10;    
    this.ChildTransaction           = Trans;
    this.OpenTransactionComp(Trans);      
  }

  OpenTransaction(Trans: TypeTransaction){          
    
    Trans.Series        = JSON.parse(Trans.Series_Json)[0];
    Trans.Client        = JSON.parse(Trans.Client_Json)[0];
    Trans.PaymentModes  = JSON.parse(Trans.PaymentModes_Json); 
    
    if (Trans.Images_Json){
      Trans.ImageSource   = JSON.parse(Trans.Images_Json);
    }
    else{ Trans.ImageSource = [] }
    Trans.GridItems     = JSON.parse(Trans.Items_Json);    
    
    this.ChildTransaction = Trans;    

    this.OpenTransactionComp(Trans);

    // if ((Trans.Series.VouType.VouTypeSno == this.globals.VTypAdvancePurchase) || (Trans.Series.VouType.VouTypeSno == this.globals.VTypAdvanceSales)){
    //   const dialogRef = this.dialog.open(AdvancedocComponent, 
    //     {
    //       width: '60vw',
    //       maxWidth: 'none',
    //       data: Trans,        
    //       panelClass: "dialogMat"
    //     });      
    //     dialogRef.disableClose = true; 
    //     dialogRef.afterClosed().subscribe(result => {        
    //         this.LoadTransactionList();                 
    //     }); 
    // }
    // else{
    //   this.EntryMode = true;
    // }    
    
  } 

  OpenTransactionComp(Trans: TypeTransaction){
    switch (Trans.Series.VouType.VouTypeSno) {
      case this.globals.VTypAdvancePurchase:
        const dialogRef = this.dialog.open(AdvancedocComponent, 
          {
            width: '60vw',
            maxWidth: 'none',
            data: Trans,        
            panelClass: "dialogMat"
          });      
          dialogRef.disableClose = true; 
          dialogRef.afterClosed().subscribe(result => {     
            this.LoadTransactionList();                           
          }); 
        break;

      case this.globals.VTypAdvanceSales:
        const dialogRef1 = this.dialog.open(AdvancedocComponent, 
          {
            width: '60vw',
            maxWidth: 'none',
            data: Trans,        
            panelClass: "dialogMat"
          });      
          dialogRef1.disableClose = true; 
          dialogRef1.afterClosed().subscribe(result => {                    
            this.LoadTransactionList();                           
          }); 
      break;
      
      case this.globals.VTypLabTestingIssue:
        const dialogRef2 = this.dialog.open(LabtestComponent, 
          {
            panelClass:['rightdialogMat'],        
            position:{"right":"0","top":"0" },              
            maxWidth: 'none',        
            data: Trans,                    
          });      
          dialogRef2.disableClose = true; 
          dialogRef2.afterClosed().subscribe(result => {                    
            this.LoadTransactionList();                           
          }); 
      break;

    case this.globals.VTypLabTestingReceipt:
        const dialogRef3 = this.dialog.open(LabtestComponent, 
          {
            panelClass:['rightdialogMat'],        
            position:{"right":"0","top":"0" },              
            maxWidth: 'none',   
            data: Trans,                    
          });      
          dialogRef3.disableClose = true; 
          dialogRef3.afterClosed().subscribe(result => {                    
            this.LoadTransactionList();                           
          }); 
      break;

      default:
        this.EntryMode = true;
        break;
    }  
  }

  PrintTransaction(trans: TypeTransaction){            
    
    trans.Series = JSON.parse(trans.Series_Json)[0];
    trans.Client = JSON.parse(trans.Client_Json)[0];

    if (trans.Items_Json && trans.Items_Json !== ''){
      trans.GridItems = JSON.parse(trans.Items_Json);
    }
    else{
      trans.GridItems = [];
    }
    if (trans.Images_Json && trans.Images_Json !== ''){
      trans.ImageSource = JSON.parse(trans.Images_Json);
    }
    else{
      trans.ImageSource =[];
    }

    if (trans.RefSno !==0){
      this.transService.getTransactions(trans.RefSno,0,0,0,0).subscribe(data=>{
        trans.PrintReference    = JSON.parse(data.apiData)[0];
      });
    }
    
    if (trans.Series.Print_Style == ""){ this.globals.SnackBar("error","No Print Style applied. Apply Print Styles in Voucher Series ", 1000); return; }
      else { this.vouPrint.PrintVoucher(trans, trans.Series.Print_Style!);}

  }

  handleEventFromChild(event: string){
    if (event =="iexit"){
      this.EntryMode= false;
    }
    else if (event =="iexitwithchanges"){
      this.EntryMode= false;
      this.LoadTransactionList();
    }
  }
  
  
 
  DeleteTransaction(Trans: TypeTransaction, index: number){    
    this.transService.deleteTransaction(Trans.TransSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Transaction deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Item   

    switch ($event.Action) {
      case 1:
        this.OpenTransaction($event.Data);  
        break;
      case 2:
        this.globals.QuestionAlert("Are you sure you want to delete this Transaction").subscribe(data=>{
          if (data == 1){
            this.DeleteTransaction($event.Data,$event.Index);
            this.LoadTransactionList();
          }
        });
        break;
      case 3:
          this.PrintTransaction($event.Data);
        break;
      case "Filter":
        this.FromDate = $event.FromDate;
        this.ToDate = $event.ToDate;
        this.LoadTransactionList();
        break;
    }

    
  }

}
