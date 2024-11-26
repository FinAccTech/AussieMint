import { Component } from '@angular/core';
import { TypeUom, UomService } from '../../Services/uom.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { UomComponent } from './uom/uom.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';

@Component({
  selector: 'app-uoms',
  standalone: true,
  imports: [TableviewComponent],
  templateUrl: './uoms.component.html',
  styleUrl: './uoms.component.scss'
})


export class UomsComponent {

  constructor(private uomService: UomService, private dialog: MatDialog, private globals: GlobalsService) {}
  
  UomsList: TypeUom[] = [];
  FieldNames: string[] = ["#", "Uom_Code", "Uom_Name", "BaseUom_Name","Base_Qty", "Active_Status", "Actions"]
  RemoveSignal: number = 0;

  ngOnInit(){
    this.uomService.getUoms(0).subscribe(data =>{
      if (data.queryStatus == 1){
        if (data.apiData){ this.UomsList = JSON.parse(data.apiData); }
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })  
  }
  
  AddNewUom(){
      this.OpenUom(this.uomService.Initialize());
  }

  OpenUom(Um: TypeUom){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdUomUoms, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Um.UomSno; 
    const dialogRef = this.dialog.open(UomComponent, 
      {
        data: Um,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.UomsList.push(result);          
        }        
      });  
  } 

  DeleteUom(Um: TypeUom, index: number){    
    this.uomService.deleteUom(Um.UomSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Uom deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Uom   
    if ($event.Action == 1){
      this.OpenUom($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Uom
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteUom($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
