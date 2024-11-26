import { Component, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../../../../auto-unsubscribe.decorator';
import { LedgerGroupService, TypeLedgerGroup } from '../../../Services/ledgergroup.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../../global.service';
import { SessionStorageService } from '../../../../session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectionlistComponent } from '../../../Widgets/selectionlist/selectionlist.component';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';

@Component({
  selector: 'app-ledgergroup',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectionlistComponent, IntToDatePipe],
  templateUrl: './ledgergroup.component.html',
  styleUrl: './ledgergroup.component.scss'
})

@AutoUnsubscribe

export class LedgergroupComponent {
  
  LedgerGroup!:          TypeLedgerGroup;  
  
  GrpsList: TypeLedgerGroup[] = [];

  CodeAutoGen: boolean = false;
  LedgerGroupNameValid: boolean = true;
  LedegerGroupUnderValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<LedgergroupComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeLedgerGroup,        
    private globals: GlobalsService,
    private sessionService: SessionStorageService,
    private lgrpService: LedgerGroupService
  ) 
  {
    this.LedgerGroup = data;                
  }

  ngOnInit(): void {    
    this.CodeAutoGen = true;            
    console.log(this.LedgerGroup);
    
    this.lgrpService.getLedgerGroups(0).subscribe(data => {
      this.GrpsList = JSON.parse (data.apiData);
    })
  }

  SaveLedgerGroup(){    
    if (this.ValidateInputs() == false) {return};    
        
    this.lgrpService.saveLedgerGroup(this.LedgerGroup).subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.LedgerGroup.GrpSno == 0 ? "Ledger Group Created successfully" : "Ledger Group updated successfully", 1500);          
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
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  ValidateInputs(): boolean{            
    if (!this.LedgerGroup.Grp_Name.length )  { this.LedgerGroupNameValid = false;  return false; }  else  {this.LedgerGroupNameValid = true; }        
    if (!this.LedgerGroup.GroupUnder || this.LedgerGroup.GroupUnder.GrpSno ==0 ) 
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
  //  this.SelectedGroupUnder = $event;
    this.LedgerGroup.GroupUnder = $event;    
  }

}
