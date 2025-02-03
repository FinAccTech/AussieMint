import { Component, Inject } from '@angular/core';
import { ItemService, TypeItem } from '../../../Services/item.service';
import { IGroupService, TypeItemGroup } from '../../../Services/igroup.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SessionStorageService } from '../../../../session-storage.service';
import { GlobalsService } from '../../../../global.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { SelectionlistComponent } from '../../../Widgets/selectionlist/selectionlist.component'; 

@Component({
    selector: 'app-item',
    imports: [CommonModule, FormsModule, IntToDatePipe, SelectionlistComponent, MatDialogClose],
    templateUrl: './item.component.html',
    styleUrl: './item.component.scss'
})


export class ItemComponent {
  
  Item!:          TypeItem;
  GroupsList!:    TypeItemGroup[];   
  
  // For Validations  
  CodeAutoGen: boolean = false;
  ItemNameValid: boolean = true;
  GrpNameValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<ItemComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeItem,    
    private sessionService: SessionStorageService,    
    private globals: GlobalsService,
    private itemService: ItemService,
    private grpService: IGroupService
  ) 
  { 
    this.Item = data;          
  }

  ngOnInit(): void {        
      if (this.sessionService.GetAppSetup().ItemCode_AutoGen == 1){         
        if (this.Item.ItemSno == 0){      
          this.CodeAutoGen = true;
          this.Item.Item_Code="AUTO";
        }
      }    
    this.grpService.getIGrps(0).subscribe(data => {      
      this.GroupsList = JSON.parse (data.apiData);   
    });    
  }

  SaveItem(){          
    if (this.ValidateInputs() == false) {return};    
    
    this.itemService.saveItem(this.Item).subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.Item.ItemSno = data.RetSno;
          this.Item.Name = this.Item.Item_Name;
          this.Item.Details = 'Code: ' +  this.Item.Item_Code;

          this.globals.SnackBar("info", this.Item.ItemSno == 0 ? "Item Created successfully" : "Item updated successfully",1500);                    
          this.CloseDialog(this.Item);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  CloseDialog(item: TypeItem)  {
    this.dialogRef.close(item);
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
  ValidateInputs(): boolean{            
    if (!this.Item.Item_Name.length )  { this.ItemNameValid = false;  return false; }  else  {this.ItemNameValid = true; }  
    if (!this.Item.IGroup || this.Item.IGroup.GrpSno == 0 )  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }    
    return true;
  }
  // SetActiveStatus($event: any){    
  //   console.log (this.ItemGroup.Active_Status);
  //   console.log ($event.target.checked);
  // }

  getGroup($event: TypeItemGroup){  
    this.Item.IGroup = $event;    
  }
}
