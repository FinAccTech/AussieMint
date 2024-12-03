import { Component, Inject } from '@angular/core';
import { TypeVoucherSeries, TypeVoucherTypes, VoucherSeriesService } from '../../../Services/vouseries.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../../global.service';
import { SessionStorageService } from '../../../../session-storage.service';
import { FormsModule } from '@angular/forms';
import { SelectionlistComponent } from '../../../Widgets/selectionlist/selectionlist.component';
import { MatOption, MatSelect } from '@angular/material/select';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-voucherseries',
    imports: [CommonModule, FormsModule, SelectionlistComponent, MatSelect, MatOption, IntToDatePipe],
    templateUrl: './voucherseries.component.html',
    styleUrl: './voucherseries.component.scss'
})

export class VoucherseriesComponent {
  
  Series!:          TypeVoucherSeries;
  VtypeList!:    TypeVoucherTypes[]; 
  SeriesNameValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<VoucherseriesComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeVoucherSeries,        
    private globals: GlobalsService,
    private sessionService: SessionStorageService,
    private serService: VoucherSeriesService
  ) 
  {
    this.Series = data;           
  }

  ngOnInit(): void {        
    this.serService.getVoucherTypes(0).subscribe(data => {      
      this.VtypeList = JSON.parse (data.apiData);   
    });    
  }

  SaveSeries(){        
            
    if (this.ValidateInputs() == false) {return};    
    
    this.serService.saveVoucherSeries(this.Series).subscribe(data => {
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.globals.SnackBar("info", this.Series.SeriesSno == 0 ? "Series Created successfully" : "Series updated successfully",1500);          
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

  ValidateInputs(): boolean{            
    if (!this.Series.Series_Name.length )  { this.SeriesNameValid = false;  return false; }  else  {this.SeriesNameValid = true; }   
    
    // if (!this.Series.IGroup || this.Series.IGroup.GrpSno == 0 )  { this.GrpNameValid = false;  return false; }  else  {this.GrpNameValid = true; }    
     return true;
  }
  // SetActiveStatus($event: any){    
  //   console.log (this.SeriesGroup.Active_Status);
  //   console.log ($event.target.checked);
  // }
  getVoucherType($event: TypeVoucherTypes){    
    this.Series.VouType = $event;    
  }

  
  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}
