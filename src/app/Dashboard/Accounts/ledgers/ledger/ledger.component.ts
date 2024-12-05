import { Component, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../../../../auto-unsubscribe.decorator';
import { LedgerService, TypeLedger } from '../../../Services/ledger.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../../global.service';
import { SessionStorageService } from '../../../../session-storage.service';
import { LedgerGroupService, TypeLedgerGroup } from '../../../Services/ledgergroup.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectionlistComponent } from '../../../Widgets/selectionlist/selectionlist.component';
import { MatOption, MatSelect } from '@angular/material/select';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';

@Component({
    selector: 'app-ledger',
    imports: [CommonModule, FormsModule, SelectionlistComponent, MatSelect, MatOption, IntToDatePipe],
    templateUrl: './ledger.component.html',
    styleUrl: './ledger.component.scss'
})

@AutoUnsubscribe

export class LedgerComponent  {  
  Ledger!:          TypeLedger;  
  
  GrpsList: TypeLedger[] = [];

  CodeAutoGen: boolean = false;
  LedgerNameValid: boolean = true;
  LedegerGroupUnderValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<LedgerComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeLedger,        
    private globals: GlobalsService,
    private ledgerService: LedgerService ,
    private grpService: LedgerGroupService
  ) 
  {
    this.Ledger = data;                
  }

  ngOnInit(): void {    
    this.CodeAutoGen = true;        
    this.grpService.getLedgerGroups(0).subscribe(data => {
      this.GrpsList = JSON.parse (data.apiData);
    })
    console.log(this.Ledger);    
  }

  SaveLedger(){    
    if (this.ValidateInputs() == false) {return};            
    this.ledgerService.saveLedger(this.Ledger).subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.Ledger.LedSno == 0 ? "Ledger Created successfully" : "Ledger Group updated successfully", 1500);          
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

 
  CloseDialog()  {
    this.dialogRef.close();
  }

  DateToInt($event: any): number{    
    return this.globals.DateToInt( new Date ($event));
  }

  ValidateInputs(): boolean{            
    if (!this.Ledger.Led_Name.length )  { this.LedgerNameValid = false;  return false; }  else  {this.LedgerNameValid = true; }        
    if (!this.Ledger.Group || this.Ledger.Group.GrpSno ==0 ) 
      {
      this.LedegerGroupUnderValid = false;
      return false;
    }
    else{
      this.LedegerGroupUnderValid = true;
    }
    return true;
  }

  getGroup($event: TypeLedgerGroup){  
    this.Ledger.Group = $event;    
  }

}
