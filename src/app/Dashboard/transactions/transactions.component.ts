import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GlobalsService } from '../../global.service';
import { TransactionComponent } from "./transaction/transaction.component";
import { TransactionService, TypeTransaction } from '../Services/transaction.service';
import { TableviewComponent } from '../Widgets/tableview/tableview.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

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

  TransList: TypeTransaction[]= [];
  FieldNames: string[] = ["#", "Trans_No", "Trans_DateStr", "Client_Name", "TotNettWt", "NettAmount","Actions"]
  TotalFields: string[] = ["TotNettWt", "NettAmount"]
  RemoveSignal: number = 0;

  constructor(private route: ActivatedRoute, private router: Router, private globals: GlobalsService, private transService: TransactionService){
    
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
        this.LoadTransactionList();        
      });  
  }

  LoadTransactionList(){
    this.transService.getTransactions(0,this.VouTypeSno, 0, this.FromDate, this.ToDate).subscribe(data=>{
      if (data.queryStatus == 1){
        this.TransList = JSON.parse(data.apiData);
        if (this.FromDate ==0 || this.ToDate == 0){
          this.FromDate = this.ToDate = data.ExtraData;
        }
      } 
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })
  }

  AddNewTransaction(){    
    let Trans = this.transService.InitializeTransaction();
    Trans.Series.VouType.VouTypeSno = this.VouTypeSno;    
    Trans.TaxPer = 10;    
    this.ChildTransaction = Trans;
    this.EntryMode = true;
  }

  handleEventFromChild(event: string){
    if (event =="iexit"){
      this.EntryMode= false;
    }
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
    this.EntryMode = true;
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
          }
        });
        break;
      case "Filter":
        this.FromDate = $event.FromDate;
        this.ToDate = $event.ToDate;
        this.LoadTransactionList();
        break;
    }

    
  }

}
