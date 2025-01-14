import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TypeBarCode, TypeGridItem } from '../../../Types/TypeGridItem';
import { ReportService } from '../../Services/reports.service';
import { TableviewComponent } from '../tableview/tableview.component';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';

@Component({
  selector: 'app-stockselection',
  standalone: true,
  imports: [MatDialogClose, TableviewComponent],
  templateUrl: './stockselection.component.html',
  styleUrl: './stockselection.component.scss'
})
export class StockselectionComponent {
  constructor(public dialogRef: MatDialogRef<StockselectionComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
  private repService: ReportService) 
  {}

  BarCodedList: TypeBarCode[] = [];  
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"VouType_Name", Data_Type:"string" }, 
    {Field_Name:"Trans_Date", Data_Type:"date" }, 
    {Field_Name:"Item_Name", Data_Type:"string" }, 
    {Field_Name:"Item_Desc", Data_Type:"string" }, 
    {Field_Name:"BarCode_No", Data_Type:"string" }, 
    {Field_Name:"NettWt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"Issued_Wt", Data_Type:"number", Decimals:3 }, 
    {Field_Name:"Balance_Wt", Data_Type:"number", Decimals:3 }, 
  ]

  TotalFields: string[] = ["NettWt", "Issued_Wt", "Balance_Wt"]

  ngOnInit(){
    this.repService.getBarCodeStock().subscribe(data=>{
      this.BarCodedList = JSON.parse(data.apiData);
      this.BarCodedList = this.BarCodedList.filter(itm=>{
        return itm.Balance_Wt! > 0
      })
      
    })
  }

  AddItem(selItem: TypeBarCode){
    let item: TypeGridItem;
    item = {BarCode:{"BarCodeSno": selItem.BarCodeSno, BarCode_No: selItem.BarCode_No, Name: selItem.BarCode_No!, Details: selItem.BarCode_No!}, 
                    DetSno: selItem.DetSno!,
                    Item:{ItemSno: selItem.ItemSno!, Item_Name:selItem.Item_Name!, Name:selItem.Item_Name!, Details:selItem.Item_Name! },
                    Item_Desc: selItem.Item_Desc!,
                    Karat: selItem.Karat!,
                    Purity: selItem.Purity!,
                    Qty: 1,
                    GrossWt: selItem.Balance_Wt!,
                    StoneWt: selItem.StoneWt!,
                    Wastage: selItem.Wastage!,
                    NettWt: selItem.Balance_Wt!,
                    Uom: {UomSno: selItem.UomSno!, Uom_Name: selItem.Uom_Name!, Name: selItem.Uom_Name, Details:selItem.Uom_Name},
                    Rate: selItem.Rate!,
                    Amount: selItem.Amount!,                                        
                  }
    this.dialogRef.close(item);
  }

  handleActionFromTable($event: any){    
    this.AddItem($event.Data);
  }
}
