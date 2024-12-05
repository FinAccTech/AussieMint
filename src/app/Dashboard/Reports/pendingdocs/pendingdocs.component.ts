import { Component, input } from '@angular/core';
import { GlobalsService } from '../../../global.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { TypeTransaction } from '../../Services/transaction.service';
import { ReportService } from '../../Services/reports.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  FieldNames: string[] = ["#", "Trans_No", "Trans_DateStr", "Client_Name", "TotNettWt", "NettAmount"]
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
    this.repService.getPendingDocuments(this.VouTypeSno).subscribe(data =>{
      this.TransList = JSON.parse(data.apiData);
    })
  }
}
