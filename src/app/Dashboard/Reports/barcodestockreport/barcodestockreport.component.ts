import { Component } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { GlobalsService } from '../../../global.service';
import { ReportService} from '../../Services/reports.service';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { IGroupService} from '../../Services/igroup.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';
import { TypeBarCode } from '../../../Types/TypeGridItem';
import { MatOption, MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-stockreport',
  imports: [TableviewComponent, MatSelect, MatOption],
  templateUrl: './barcodestockreport.component.html',
  styleUrl: './barcodestockreport.component.scss',
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
export class BarCodeStockreportComponent {      
  BarCodedStockList: TypeBarCode[] = [];  
  FilteredBarCodedStockList: TypeBarCode[] = [];  
  ShowEmptyStock: number = 0;
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"VouType_Name", Data_Type:"string" }, 
    {Field_Name:"Trans_Date", Data_Type:"date" }, 
    {Field_Name:"Item_Name", Data_Type:"string" }, 
    {Field_Name:"BarCode_No", Data_Type:"string" }, 
    {Field_Name:"NettWt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"PureWt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"Issued_Wt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"Balance_Wt", Data_Type:"number", Decimals:3 }, 
  ]

  TotalFields: string[] = ["Qty", "GrossWt", "StoneWt", "Wastage", "NettWt"]
  
  constructor(private globals: GlobalsService, private grpService: IGroupService,  private repService: ReportService ) {}
  state = 'void';
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);      
    this.LoadReport();
  }

  LoadReport(){            
    this.repService.getBarCodeStock().subscribe(data =>{      
      this.BarCodedStockList = JSON.parse(data.apiData);
      this.FilterStockReport();
    })
  }

  FilterStockReport(){
    this.FilteredBarCodedStockList = this.BarCodedStockList.filter(item=>{
      return  this.ShowEmptyStock==0 ? item.Balance_Wt! > 0 : item ;
    })
  }
 
}
