import { Component } from '@angular/core';
import { TransactionService, TypeAssayRecord } from '../../Services/transaction.service';
import { ReportService } from '../../Services/reports.service';
import { GlobalsService } from '../../../global.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { MatDialog } from '@angular/material/dialog';
import { LabtestComponent } from '../../transactions/labtest/labtest.component';

@Component({
  selector: 'app-pendinglabreport',
  imports: [MatSelect, MatOption ],
  templateUrl: './pendinglabreport.component.html',
  styleUrl: './pendinglabreport.component.scss'
})

@AutoUnsubscribe
export class PendinglabreportComponent {
  
  ReportList: TypeAssayRecord[] = [];
  FilteredList: TypeAssayRecord[] = [];
  ReportStatus: number  = 0;

  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"BarCode_No", Data_Type:"string" }, 
    {Field_Name:"Item_Name", Data_Type:"string" }, 
    {Field_Name:"Trans_No", Data_Type:"string" }, 
    {Field_Name:"Trans_Date", Data_Type:"date" },     
    {Field_Name:"Client_Name", Data_Type:"string" }, 
    {Field_Name:"IssueTrans_No", Data_Type:"string" }, 
    {Field_Name:"ReceiptTrans_No", Data_Type:"string" }, 
  ]

  TotalFields: string[] = ["NettAmount"]
  
  constructor(private globals: GlobalsService, private dialog: MatDialog, private transService: TransactionService, private repService: ReportService ) {}
  state = 'void';
   
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);      
    this.LoadPendingReport();
  }

  LoadPendingReport(){        
    this.repService.getAssayRecords(0).subscribe(data =>{
      this.ReportList = JSON.parse(data.apiData);
      this.FilteredList = this.ReportList;      
      this.FilterPendingReport()
    })    
  }

  FilterPendingReport(){    
    this.FilteredList = this.ReportList.filter(rep =>{
      return rep.Assay_Status == this.ReportStatus;
    })
  }

  CreateLabIssue(){
    let Trans                       = this.transService.InitializeTransaction();
    Trans.Series.VouType.VouTypeSno = this.globals.VTypLabTestingIssue;    
     const dialogRef2 = this.dialog.open(LabtestComponent, 
      {
        width: '60vw',
        maxWidth: 'none',
        data: Trans,        
        panelClass: "dialogMat"
      });      
      dialogRef2.disableClose = true; 
      dialogRef2.afterClosed().subscribe(result => {                    
        this.LoadPendingReport();                           
      }); 
  }

  CreateLabReceipt(){
    let Trans                       = this.transService.InitializeTransaction();
    Trans.Series.VouType.VouTypeSno = this.globals.VTypLabTestingReceipt;    
     const dialogRef2 = this.dialog.open(LabtestComponent, 
      {
        width: '60vw',
        maxWidth: 'none',
        data: Trans,        
        panelClass: "dialogMat"
      });      
      dialogRef2.disableClose = true; 
      dialogRef2.afterClosed().subscribe(result => {                    
        this.LoadPendingReport();                           
      }); 
  }
}
