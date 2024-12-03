import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { LedgerService, TypeLedger } from '../../Services/ledger.service';
import { GlobalsService } from '../../../global.service';
import { SelectionlistComponent } from '../selectionlist/selectionlist.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, TypePaymentModes } from '../../Services/transaction.service';


@Component({
  selector: 'app-paymodes',
  standalone: true,
  imports:[CommonModule, FormsModule, SelectionlistComponent, MatDialogClose ],
  templateUrl: './paymodes.component.html',
  styleUrls: ['./paymodes.component.scss']
})

@AutoUnsubscribe
export class PaymodesComponent {
  PayModesList: TypePaymentModes[] = [];
  PaymnentModeLedgers: TypeLedger[] = []; 
  errText: string = "";
  ModeValid: boolean[] = [];
  AmtValid: boolean[] = []; 
  totalAmount = 0;

  constructor(
    public dialogRef: MatDialogRef<PaymodesComponent>,
    private transService: TransactionService,
    private ledService: LedgerService,
    @Inject(MAT_DIALOG_DATA) public data: any,                
  )  {}

  ngOnInit(){            
    this.ledService.getPaymentModes().subscribe(data=>{
      this.PaymnentModeLedgers = JSON.parse(data.apiData);

      if (this.data.PaymentModeList.length == 0){
        this.PayModesList.push ({ "PmSno":0, "TransSno":0, "Ledger": this.PaymnentModeLedgers[0], "Amount" : this.data.Amount, "Remarks":"", })
        this.ModeValid[this.PayModesList.length-1] = true;        
        this.AmtValid[this.PayModesList.length-1] = true;        
      }
      else{
        this.PayModesList =  this.data.PaymentModeList;
        let i = 0;
        this.PayModesList.forEach(mode=>{
          this.ModeValid[i] = true;
          this.AmtValid[i] = true;
          i++;
        })
      }
    })
  }

  SelectLoan(loan: any){
    this.dialogRef.close(loan.LoanSno);
  }

  getLedger($event: TypeLedger, i: number){    
    this.PayModesList[i].Ledger = $event;    
  }

  AddMode(){
    this.PayModesList.push (this.transService.InitializePaymentModes())
    this.ModeValid[this.PayModesList.length-1] = true;
    this.AmtValid[this.PayModesList.length-1] = true;
  }

  RemoveMode(i: number){
    this.PayModesList.splice(i,1);
    this.ModeValid.splice(i,1);
    this.AmtValid.splice(i,1);
  }

  Submit(){
    let i = 0;
    this.errText =  "";
    let ValidPaymode = false;

    this.PayModesList.forEach(mode=>{            
      if (!mode.Ledger || mode.Ledger.LedSno == 0) { this.ModeValid[i] = false; ValidPaymode = false; return; } else {this.ModeValid[i] = true;}
      if (mode.Amount == 0) { this.AmtValid[i] = false; ValidPaymode = false; return; } else {this.AmtValid[i] = true}
      i++;
      ValidPaymode = true;
    })

    if (ValidPaymode == false) { return; }

    this.PayModesList.forEach(mode=>{
      let ledcount = this.PayModesList.filter((md)=>{
        return md.Ledger == mode.Ledger
      }).length;

      if (ledcount > 1 ) {
        this.errText = "** Duplicate Ledgers";
        ValidPaymode = false;
        return;
      }
      ValidPaymode = true; 
    })

    if (ValidPaymode == false) { return; }

    this.totalAmount = 0;
    this.PayModesList.forEach(mode=>{
      this.totalAmount+= mode.Amount;
    }) 

    if (+this.data.Amount !== +this.totalAmount)
    {
      this.errText = "** Amount do not match with the Loan Amount";
      return;
    }

    this.CloseDialog();
  }

  CloseDialog(){
    this.dialogRef.close(this.PayModesList);
  }

}
