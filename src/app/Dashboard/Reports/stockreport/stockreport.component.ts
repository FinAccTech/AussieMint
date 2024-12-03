import { Component } from '@angular/core';
import { TypeTransaction } from '../../Services/transaction.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { GlobalsService } from '../../../global.service';
import { ReportService, TypeStockReport } from '../../Services/reports.service';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { SelectionlistComponent } from "../../Widgets/selectionlist/selectionlist.component";
import { IGroupService, TypeItemGroup } from '../../Services/igroup.service';

@Component({
  selector: 'app-stockreport',
  imports: [TableviewComponent, SelectionlistComponent],
  templateUrl: './stockreport.component.html',
  styleUrl: './stockreport.component.scss'
})
@AutoUnsubscribe
export class StockreportComponent {  
  GroupsList: TypeItemGroup[] = [];
  SelectedGroup!: TypeItemGroup;

  StockList: TypeStockReport[] = [];

  FieldNames: string[] = ["#", "Item_Name", "Karat", "Purity", "Uom_Name", "Qty", "GrossWt", "StoneWt", "Wastage", "NettWt"]
  TotalFields: string[] = ["Qty", "GrossWt", "StoneWt", "Wastage", "NettWt"]
  
  constructor(private globals: GlobalsService, private grpService: IGroupService,  private repService: ReportService ) {}

  ngOnInit(){
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
