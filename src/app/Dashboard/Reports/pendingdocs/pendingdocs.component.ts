import { Component, input } from '@angular/core';
import { GlobalsService } from '../../../global.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { TypeTransaction } from '../../Services/transaction.service';
import { ReportService } from '../../Services/reports.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';

@Component({
  selector: 'app-pendingdocs',
  imports: [MatSelect, MatOption, TableviewComponent],
  templateUrl: './pendingdocs.component.html',
  styleUrl: './pendingdocs.component.scss',
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
export class PendingdocsComponent {
  VouTypeSno: number = 0;
  VouTypeName: string = "";
  TransList: TypeTransaction[] = [];
  
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Trans_No", Data_Type:"string" }, 
    {Field_Name:"Trans_Date", Data_Type:"string" },     
    {Field_Name:"Client_Name", Data_Type:"string" }, 
    {Field_Name:"TotNettWt", Data_Type:"string" }, 
    {Field_Name:"NettAmount", Data_Type:"string" }, 
  ]
  
  TotalFields: string[] = ["TotNettWt", "NettAmount"]
  
  constructor(private globals: GlobalsService, private repService: ReportService ) {}
  state = 'void';
  
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.VouTypeSno = 10;
    this.LoadPendingReport();
  }

  LoadPendingReport(){        
    this.VouTypeName = this.globals.GetVouTypeName(this.VouTypeSno);
    this.repService.getPendingDocuments(this.VouTypeSno,0).subscribe(data =>{
      this.TransList = JSON.parse(data.apiData);
    })
  }
}
