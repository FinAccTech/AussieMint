import { Component } from '@angular/core';
import { TypeTransaction } from '../../Services/transaction.service';
import { GlobalsService } from '../../../global.service';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';
import { ReportService } from '../../Services/reports.service';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { SelectionlistComponent } from '../../Widgets/selectionlist/selectionlist.component';
import { ClientService, TypeClient } from '../../Services/client.service';

@Component({
  selector: 'app-clienthistory',
  imports: [TableviewComponent, SelectionlistComponent],
  templateUrl: './clienthistory.component.html',
  styleUrl: './clienthistory.component.scss'
})
export class ClienthistoryComponent {
  ClientsList: TypeClient[] = [];
  SelectedClient!: TypeClient;
  TransList: TypeTransaction[] = [];
  
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Trans_No", Data_Type:"string" }, 
    {Field_Name:"Trans_Date", Data_Type:"date" },     
    {Field_Name:"Payment_TypeStr", Data_Type:"string" },     
    {Field_Name:"VouType_Name", Data_Type:"string" }, 
    {Field_Name:"TotNettWt", Data_Type:"number", Decimals: 3 }, 
    {Field_Name:"NettAmount", Data_Type:"number" }, 
  ]
  
  TotalFields: string[] = ["TotNettWt", "NettAmount"]
  
  constructor(private globals: GlobalsService, private clntService: ClientService, private repService: ReportService ) {}
  state = 'void';
  
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    
    this.clntService.getClients(0).subscribe(data=>{
      this.ClientsList = JSON.parse(data.apiData);
    })
    
  }

  LoadClientHistory(){            
    this.repService.getClientHistory(this.SelectedClient.ClientSno).subscribe(data =>{
      this.TransList = JSON.parse(data.apiData);
    })
  }

  getClient($event: TypeClient){
    this.SelectedClient = $event;
    this.LoadClientHistory();
  }
}
