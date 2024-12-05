import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TypeBarCode, TypeGridItem } from '../../../Types/TypeGridItem';
import { ReportService } from '../../Services/reports.service';
import { TableviewComponent } from '../tableview/tableview.component';

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
  FieldNames: string[] = ["#", "VouType_Name", "Trans_Date", "Item_Name", "BarCode_No", "NettWt","Issued_Wt", "Balance_Wt"]
  TotalFields: string[] = ["NettWt", "Issued_Wt", "Balance_Wt"]

  ngOnInit(){
    this.repService.getBarCodeStock().subscribe(data=>{
      this.BarCodedList = JSON.parse(data.apiData);
    })
  }

  AddItem(selItem: TypeBarCode){
    let item: TypeGridItem;
    item = {BarCode:{"BarCodeSno": selItem.BarCodeSno, BarCode_No: selItem.BarCode_No, Name: selItem.BarCode_No!, Details: selItem.BarCode_No!}, 
                    DetSno: selItem.DetSno!,
                    Item:{ItemSno: selItem.ItemSno!, Item_Name:selItem.Item_Name!, Name:selItem.Item_Name!, Details:selItem.Item_Name! },
                    Item_Desc: "",
                    Karat: selItem.Karat!,
                    Purity: selItem.Purity!,
                    Qty: 1,
                    GrossWt: selItem.GrossWt!,
                    StoneWt: selItem.StonWt!,
                    Wastage: selItem.Wastage!,
                    NettWt: selItem.NettWt!,
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
