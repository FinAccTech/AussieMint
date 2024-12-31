import { Component } from '@angular/core';
import { LedgerGroupService, TypeLedgerGroup } from '../../Services/ledgergroup.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { LedgergroupComponent } from './ledgergroup/ledgergroup.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';

@Component({
    selector: 'app-ledgergroups',
    imports: [TableviewComponent],
    templateUrl: './ledgergroups.component.html',
    styleUrl: './ledgergroups.component.scss',
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
export class LedgergroupsComponent {

  constructor(private lgrpService: LedgerGroupService, private dialog: MatDialog, private globals: GlobalsService) {}
  state = 'void';

  LedgerGroupsList: TypeLedgerGroup[] = [];  
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Grp_Code", Data_Type:"string" }, 
    {Field_Name:"Grp_Name", Data_Type:"string" }, 
    {Field_Name:"GrpUnder_Name", Data_Type:"string" }, 
    {Field_Name:"IsStd", Data_Type:"boolean" }, 
    {Field_Name:"Actions", Data_Type:"object" },  
  ]


  RemoveSignal: number = 0;

  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.lgrpService.getLedgerGroups(0).subscribe(data =>{
      if (data.queryStatus == 1){
        this.LedgerGroupsList = JSON.parse(data.apiData);          
        console.log(this.LedgerGroupsList);
        
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })  
  }
  
  AddNewLedgerGroup(){
      this.OpenLedgerGroup(this.lgrpService.Initialize());
  }

  OpenLedgerGroup(Grp: TypeLedgerGroup){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdLedgerGroupLedgerGroups, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Grp.GrpSno; 
    const dialogRef = this.dialog.open(LedgergroupComponent, 
      {
        data: Grp,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.LedgerGroupsList.push(result);          
        }        
      });  
  } 

  DeleteLedgerGroup(Grp: TypeLedgerGroup, index: number){    
    this.lgrpService.deleteLedgerGroup(Grp.GrpSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "LedgerGroup deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open LedgerGroup   
    if ($event.Action == 1){
      this.OpenLedgerGroup($event.Data);
    }
    else if ($event.Action == 2){
      //Delete LedgerGroup
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteLedgerGroup($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
