import { Component } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { LedgerService, TypeLedger } from '../../Services/ledger.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { LedgerComponent } from './ledger/ledger.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';

@Component({
    selector: 'app-ledgers',
    imports: [TableviewComponent],
    templateUrl: './ledgers.component.html',
    styleUrl: './ledgers.component.scss'
})

@AutoUnsubscribe

export class LedgersComponent {

  constructor(private ledService: LedgerService, private dialog: MatDialog, private globals: GlobalsService) {}
  
  LedgersList: TypeLedger[] = [];
  FieldNames: string[] = ["#", "Led_Code", "Led_Name", "Grp_Name", "IsStd", "Actions"]
  RemoveSignal: number = 0;

  ngOnInit(){
    this.ledService.getLedgers(0,0,1).subscribe(data =>{
      if (data.queryStatus == 1){
        this.LedgersList = JSON.parse(data.apiData);          
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })  
  }
  
  AddNewLedger(){
      this.OpenLedger(this.ledService.Initialize());
  }

  OpenLedger(Led: TypeLedger){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgerLedgers, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Led.LedSno; 
    const dialogRef = this.dialog.open(LedgerComponent, 
      {
        data: Led,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.LedgersList.push(result);          
        }        
      });  
  } 

  DeleteLedger(Led: TypeLedger, index: number){    
    this.ledService.deleteLedger(Led.LedSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Ledger deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Ledger   
    if ($event.Action == 1){
      this.OpenLedger($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Ledger
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteLedger($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
