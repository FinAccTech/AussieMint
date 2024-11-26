import { Component, Inject } from '@angular/core';
import { TypeUom, UomService } from '../../../Services/uom.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SessionStorageService } from '../../../../session-storage.service';
import { GlobalsService } from '../../../../global.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { SelectionlistComponent } from '../../../Widgets/selectionlist/selectionlist.component';

@Component({
  selector: 'app-uom',
  standalone: true,
  imports: [CommonModule, FormsModule, IntToDatePipe, MatDialogClose, SelectionlistComponent],
  templateUrl: './uom.component.html',
  styleUrl: './uom.component.scss'
})

export class UomComponent {
  
  Uom!:          TypeUom;
  BaseUomList: TypeUom[] = [];
  BaseUomValid:boolean = true;
  
  // For Validations  
  CodeAutoGen: boolean = false;
  UomNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<UomComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeUom,    
    private sessionService: SessionStorageService,    
    private globals: GlobalsService,
    private umService: UomService,    
  ) 
  {
    this.Uom = data;          
  }

  ngOnInit(): void {        
      if (this.sessionService.GetAppSetup().UomCode_AutoGen == 1){                         
        this.CodeAutoGen = true;
        if (this.Uom.UomSno == 0){                
          this.Uom.Uom_Code="AUTO";
        }
      }        

      this.umService.getUoms(0).subscribe(data=>{
        this.BaseUomList = JSON.parse(data.apiData);
      })
  }

  SaveUom(){          
    if (this.ValidateInputs() == false) {return};    
    
    this.umService.saveUom(this.Uom).subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.Uom.UomSno = data.RetSno;
          this.Uom.Name = this.Uom.Uom_Name;
          this.Uom.Details = 'Code: ' +  this.Uom.Uom_Code;

          this.globals.SnackBar("info", this.Uom.UomSno == 0 ? "Uom Created successfully" : "Uom updated successfully",1500);                    
          this.CloseDialog(this.Uom);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  CloseDialog(Uom: TypeUom)  {
    this.dialogRef.close(Uom);
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
  ValidateInputs(): boolean{            
    if (!this.Uom.Uom_Name.length )  { this.UomNameValid = false;  return false; }  else  {this.UomNameValid = true; }      
    //if (!this.Uom.BaseUom || this.Uom.UomSno == 0 )  { this.BaseUomValid = false;  return false; }  else  {this.BaseUomValid = true; }    
    return true;
  } 

  getBaseUom($event: TypeUom){  
    this.Uom.BaseUom = $event;    
  }
  
}
