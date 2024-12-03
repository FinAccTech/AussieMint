import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { IGroupService, TypeItemGroup } from '../../../Services/igroup.service';
import { GlobalsService } from '../../../../global.service';
import { SessionStorageService } from '../../../../session-storage.service';


@Component({
    selector: 'app-itemgroup',
    imports: [CommonModule, FormsModule, MatDialogClose, IntToDatePipe],
    templateUrl: './itemgroup.component.html',
    styleUrl: './itemgroup.component.scss'
})

export class ItemgroupComponent {

  ItemGroup!: TypeItemGroup;

  // For Validations  
  CodeAutoGen: boolean = false;
  GrpNameValid: boolean = true;
  MarketRateValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<ItemgroupComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeItemGroup,        
    private globals: GlobalsService,
    private sessionService: SessionStorageService,
    private grpService: IGroupService
  ) 
  {
    this.ItemGroup = data;    
  }

  ngOnInit(): void {    
      if (this.ItemGroup.GrpSno == 0){
        if (this.sessionService.GetAppSetup().GrpCode_AutoGen == 1){
          this.CodeAutoGen = true;                
          this.ItemGroup.Grp_Code = "AUTO";
        }    
      }      
  }

  SaveItemGroup(){    
    if (this.ValidateInputs() == false) {return};    
    
    this.grpService.saveIGrp(this.ItemGroup) .subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.ItemGroup.GrpSno = data.RetSno;
          this.ItemGroup.Name = this.ItemGroup.Grp_Name;
          this.ItemGroup.Details = 'Code: '  + this.ItemGroup.Grp_Code;
          this.globals.SnackBar("info", this.ItemGroup.GrpSno == 0 ? "Group created successfully" : "Group updated successfully",1000);          
          this.CloseDialog(this.ItemGroup);
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  CloseDialog(grp: TypeItemGroup)  {
    this.dialogRef.close(grp);
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  ValidateInputs(): boolean{        
    if (!this.ItemGroup.Grp_Name!.length )  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }
    if (!this.ItemGroup.Market_Rate)  { this.MarketRateValid = false; return false; } else { this.MarketRateValid = true; }    
    return true;
  }
 
 }
