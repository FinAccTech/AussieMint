import { Component } from '@angular/core';
import { IGroupService, TypeItemGroup } from '../../Services/igroup.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { TableviewComponent } from "../../Widgets/tableview/tableview.component";
import { ItemgroupComponent } from './itemgroup/itemgroup.component';

@Component({
  selector: 'app-itemgroups',
  standalone: true,  
  templateUrl: './itemgroups.component.html',
  styleUrl: './itemgroups.component.scss',
  imports: [TableviewComponent]
})
export class ItemgroupsComponent {

  constructor(private grpService: IGroupService, private dialog: MatDialog, private globals: GlobalsService) {}
  
  GroupsList: TypeItemGroup[] = [];
  FieldNames: string[] = ["#", "Grp_Code", "Grp_Name", "Market_Rate", "Active_Status", "Actions"]
  RemoveSignal: number = 0;

  ngOnInit(){
    this.grpService.getIGrps(0).subscribe(data =>{
      if (data.queryStatus == 1){
        this.GroupsList = JSON.parse(data.apiData);          
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })
  //   let person =[{
  //     Name:"Srinivasasn",
  //     Age: 40,
  //     Sex: "Male"
  //   },
  //   {
  //     Name:"Srinivasasn",
  //     Age: 40,
  //     Sex: "Male"
  //   }
  // ]

  //   let FldNames =  Object.keys(person[0]);
    
  //   FldNames.forEach(x=>{
  //     console.log(x);
      
  //   })
  }
  
  AddNewGroup(){
      this.OpenItemGroup(this.grpService.Initialize());
  }

  OpenItemGroup(Grp: TypeItemGroup){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItemGroups, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Grp.GrpSno; 
    const dialogRef = this.dialog.open(ItemgroupComponent, 
      {
        data: Grp,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.GroupsList.push(result);          
        }        
      });  
  } 

  DeleteItemGroup(Grp: TypeItemGroup, index: number){    
    this.grpService.deleteIGrp(Grp.GrpSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Item Group deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Group   
    if ($event.Action == 1){
      this.OpenItemGroup($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Group
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteItemGroup($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
