import { Component } from '@angular/core';
import { TypeVoucherSeries, VoucherSeriesService } from '../../Services/vouseries.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { VoucherseriesComponent } from './voucherseries/voucherseries.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-voucherserieslist',
    imports: [TableviewComponent],
    templateUrl: './voucherserieslist.component.html', 
    styleUrl: './voucherserieslist.component.scss',
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

export class VoucherserieslistComponent {

  constructor(private vouSeriesService: VoucherSeriesService, private dialog: MatDialog, private globals: GlobalsService) {}
  state = 'void';

  SeriesList: TypeVoucherSeries[] = [];
  FieldNames: string[] = ["#", "Series_Name", "VouType_Name", "Prefix", "Current_No", "IsStd", "Active_Status", "Actions"]
  RemoveSignal: number = 0;

  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.vouSeriesService.getVoucherSeries(0,0).subscribe(data =>{
      if (data.queryStatus == 1){
        this.SeriesList = JSON.parse(data.apiData);                  
        
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })  
  }
  
  AddNewSeries(){
      this.OpenSeries(this.vouSeriesService.Initialize());
  }

  OpenSeries(Itm: TypeVoucherSeries){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdSeriesSeriess, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Itm.SeriesSno; 
    const dialogRef = this.dialog.open(VoucherseriesComponent, 
      {
        data: Itm,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.SeriesList.push(result);          
        }        
      });  
  } 

  DeleteSeries(ser: TypeVoucherSeries, index: number){    
    this.vouSeriesService.deleteVoucherSeries(ser.SeriesSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Series deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Series   
    if ($event.Action == 1){
      this.OpenSeries($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Series
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteSeries($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
