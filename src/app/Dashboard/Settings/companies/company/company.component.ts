import { Component, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../../../../auto-unsubscribe.decorator';
import { TypeCompanies } from '../../../../Types/TypeCompanies';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../../global.service';
import { SessionStorageService } from '../../../../session-storage.service';
import { CompanyService } from '../../../Services/companies.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule, IntToDatePipe, MatSelect, MatOption],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})

@AutoUnsubscribe

export class CompanyComponent {
  
  Comp!:          TypeCompanies;  
  DataChanged:    boolean = false;

  // For Validations  
  CompNameValid: boolean = true;
  
  constructor(
    public dialogRef: MatDialogRef<CompanyComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeCompanies,        
    private globals: GlobalsService,
    private compService: CompanyService,
    private sessionService: SessionStorageService
  ) 
  {
    this.Comp = data;                
  }

  ngOnInit(): void {    


  }

  SaveCompany(){    
    if (this.ValidateInputs() == false) {return};    
    
    
    // comp.Comp.BranchSno =this.auth.SelectedBranchSno;
     
    this.compService.saveCompany(this.Comp).subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.Comp.CompSno == 0 ? "Company Created successfully" : "Company updated successfully", 2000) ;
          this.DataChanged = true;
          this.CloseDialog();
        }
    }, 
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  DeleteCompany(){
    if (this.Comp.CompSno == 0){
      this.globals.SnackBar("error", "No Comp selected to delete",2000);
      return;
    }
    this.globals.QuestionAlert("compe you sure you wanto to delete this Comp?").subscribe(Response => {      
      if (Response == 1){
        
        this.compService.deleteCompany( this.Comp.CompSno ).subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Comp deleted successfully",2000);
            this.DataChanged = true;
            this.CloseDialog();
          }
        })        
      }
    })
  }

  CloseDialog()  {
    this.dialogRef.close(this.DataChanged);
  }

  
  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
  

  ValidateInputs(): boolean{            
    if (!this.Comp.Comp_Name.length )  { this.CompNameValid = false;  return false; }  else  {this.CompNameValid = true; }        
    return true;
  }
  
}
