import { Component } from '@angular/core';
import { TypeTransaction } from '../../Services/transaction.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { GlobalsService } from '../../../global.service';
import { ReportService, TypeStockReport } from '../../Services/reports.service';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { SelectionlistComponent } from "../../Widgets/selectionlist/selectionlist.component";
import { IGroupService, TypeItemGroup } from '../../Services/igroup.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';

@Component({
  selector: 'app-stockreport',
  imports: [TableviewComponent, SelectionlistComponent],
  templateUrl: './stockreport.component.html',
  styleUrl: './stockreport.component.scss',
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
export class StockreportComponent {  
  GroupsList: TypeItemGroup[] = [];
  SelectedGroup!: TypeItemGroup;

  StockList: TypeStockReport[] = [];

  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Item_Name", Data_Type:"string" }, 
    {Field_Name:"Karat", Data_Type:"string" }, 
    {Field_Name:"Purity", Data_Type:"string" }, 
    {Field_Name:"Uom_Name", Data_Type:"string"}, 
    {Field_Name:"Qty", Data_Type:"number" }, 
    {Field_Name:"GrossWt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"StoneWt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"Wastage", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"NettWt", Data_Type:"number", Decimals:3 }, 
  ]

  TotalFields: string[] = ["Qty", "GrossWt", "StoneWt", "Wastage", "NettWt"]
  
  constructor(private globals: GlobalsService, private grpService: IGroupService,  private repService: ReportService ) {}
  state = 'void';
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.grpService.getIGrps(0).subscribe(data =>{
      this.GroupsList = JSON.parse(data.apiData);
      this.getGroup(this.GroupsList[0]);
    })
  }

  LoadReport(){            
    this.repService.getStockReport(this.SelectedGroup.GrpSno).subscribe(data =>{      
      this.StockList = JSON.parse(data.apiData);
    })
  }

  getGroup($event: TypeItemGroup){
    this.SelectedGroup = $event;
    this.LoadReport();
  }
}
