import { Component } from '@angular/core';
import { TypeBarCode, TypeBarCodeHistory } from '../../../Types/TypeGridItem';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';
import { GlobalsService } from '../../../global.service';
import { ReportService } from '../../Services/reports.service';
import { ItemService } from '../../Services/item.service';
import { SelectionlistComponent } from '../../Widgets/selectionlist/selectionlist.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';

@Component({
  selector: 'app-barcodeitemshistory',
  imports: [SelectionlistComponent, TableviewComponent],
  templateUrl: './barcodeitemshistory.component.html',
  styleUrl: './barcodeitemshistory.component.scss'
})
export class BarcodeitemshistoryComponent {
  BarCodesList: TypeBarCode[] = [];
  SelectedBarCode!: TypeBarCode;
  RepList: TypeBarCodeHistory[] = [];
   
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Trans_No", Data_Type:"string" }, 
    {Field_Name:"Trans_Date", Data_Type:"date" },     
    {Field_Name:"VouType_Name", Data_Type:"string" },     
    {Field_Name:"Client_Name", Data_Type:"string" }, 
    {Field_Name:"Item_Name", Data_Type:"string" }, 
    {Field_Name:"Item_Desc", Data_Type:"string" }, 
    {Field_Name:"Uom_Name", Data_Type:"string" }, 
    {Field_Name:"Karat", Data_Type:"number", }, 
    {Field_Name:"Purity", Data_Type:"number", Decimals: 2 }, 
    {Field_Name:"GrossWt", Data_Type:"number", Decimals: 3 }, 
    {Field_Name:"NettWt", Data_Type:"number", Decimals: 3 }, 
    {Field_Name:"PureWt", Data_Type:"number", Decimals: 3 }, 
    {Field_Name:"Rate", Data_Type:"number" }, 
    {Field_Name:"Amount", Data_Type:"number" }, 
  ]
  
  TotalFields: string[] = ["TotNettWt", "NettAmount"]
  
  constructor(private globals: GlobalsService, private itService: ItemService, private repService: ReportService ) {}
  state = 'void';
  
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    
    this.itService.getBarCodedItems().subscribe(data=>{
      this.BarCodesList = JSON.parse(data.apiData);
    })
    
  }

  LoadBarCodeHistory(){            
    this.repService.getBarCodeHistory(this.SelectedBarCode.BarCodeSno).subscribe(data =>{
      this.RepList = JSON.parse(data.apiData);
    })
  }

  getBarCode($event: TypeBarCode){
    this.SelectedBarCode = $event;
    this.LoadBarCodeHistory();
  }
}
