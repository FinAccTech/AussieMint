import { Component } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { LedgerService, TypeLedger } from '../../Services/ledger.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { LedgerComponent } from './ledger/ledger.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';

@Component({
    selector: 'app-ledgers',
    imports: [TableviewComponent],
    templateUrl: './ledgers.component.html',
    styleUrl: './ledgers.component.scss',
    animations: [
      trigger('myAnimation', [
        state('void', style({ opacity: 0 })),
        state('*', style({ opacity: .9 })),
        transition('void => *', [
          animate('1000ms ease-in')
        ]),
        transition('* => void', [
          animate('1000ms ease-out')
        ])
      ])
    ]
})

@AutoUnsubscribe

export class LedgersComponent {

  constructor(private ledService: LedgerService, private dialog: MatDialog, private globals: GlobalsService) {}
  
  LedgersList: TypeLedger[] = [];
    
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Led_Code", Data_Type:"string" }, 
    {Field_Name:"Led_Name", Data_Type:"string" }, 
    {Field_Name:"Grp_Name", Data_Type:"string" }, 
    {Field_Name:"IsStd", Data_Type:"boolean" }, 
    {Field_Name:"Actions", Data_Type:"object" },  
  ]

  RemoveSignal: number = 0;
  state = 'void';
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
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
