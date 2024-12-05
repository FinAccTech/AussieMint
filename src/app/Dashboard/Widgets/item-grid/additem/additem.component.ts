import { Component, Inject } from '@angular/core';
import { TypeBarCode, TypeGridItem } from '../../../../Types/TypeGridItem';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SelectionlistComponent } from '../../selectionlist/selectionlist.component';
import { FormsModule } from '@angular/forms';
import { ItemService, TypeItem } from '../../../Services/item.service';
import { TypeUom, UomService } from '../../../Services/uom.service';
import { NumberInputDirective } from '../../../Directives/NumberInput';
import { ReportService } from '../../../Services/reports.service';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-additem',
  standalone: true,
  imports: [ CommonModule, MatDialogClose, SelectionlistComponent, FormsModule, NumberInputDirective],
  templateUrl: './additem.component.html',
  styleUrl: './additem.component.scss'
})

export class AdditemComponent {  
  GridItem!: TypeGridItem;
  ItemsList: TypeItem[] = [];
  UomsList: TypeUom[] = [];
  BarCodeList: TypeBarCode[] = [];
  EnableBarCode: boolean = false;
  GenerateBarCode: boolean = false;
  EnableAmountCols: boolean = false;

  BarCodeValid: boolean = true;
  ItemNameValid: boolean = true;
  UomValid: boolean = true;
  NettWtValid: boolean = true;
  AmountValid: boolean = true;


  constructor(private itmService: ItemService, private umService: UomService, private repService: ReportService,
    public dialogRef: MatDialogRef<AdditemComponent>, @Inject(MAT_DIALOG_DATA) public data: any,) 
  {
    this.EnableBarCode = data.EnableBarCode;
    this.GenerateBarCode = data.GenerateBarCode;
    this.EnableAmountCols = data.EnableAmountCols;
    this.GridItem = data.Item;           
  }
 
  ngOnInit(){
    this.itmService.getItems(0,0).subscribe(data=>{
      this.ItemsList = JSON.parse (data.apiData);
    });
    this.umService.getUoms(0).subscribe(data=>{
      this.UomsList = JSON.parse (data.apiData);
    })

    this.repService.getBarCodeStock().subscribe(data =>{
      this.BarCodeList = JSON.parse(data.apiData);
    })
  }

  AddItem(){
    if (this.ValidateInputs() == false) {return;}
    this.dialogRef.close(this.GridItem);
  }

  ValidateInputs(): boolean{
    if (this.EnableBarCode) { if (!this.GridItem.BarCode || this.GridItem.BarCode.BarCodeSno == 0 ){ this.BarCodeValid = false; return false; } else { this.BarCodeValid = true; }}
    if (!this.GridItem.Item || this.GridItem.Item.ItemSno == 0 ){ this.ItemNameValid = false; return false; } else { this.ItemNameValid = true; }
    if (!this.GridItem.Uom || this.GridItem.Uom.UomSno == 0 ){ this.UomValid = false; return false; } else { this.UomValid = true; }
    if (!this.GridItem.NettWt || this.GridItem.NettWt == 0 ){ this.NettWtValid = false; return false; } else { this.NettWtValid = true; }
    if (this.EnableAmountCols){
      if (!this.GridItem.Amount || this.GridItem.Amount == 0 ){ this.AmountValid = false; return false; } else { this.AmountValid = true; }
    }
    return true;
  }  

  getItem($event: TypeItem){ 
    this.GridItem.Item = $event;
  }

  getBarCode($event: TypeBarCode){
    this.GridItem.BarCode = $event;
    this.GridItem.Item = {ItemSno: this.GridItem.BarCode.ItemSno!, Item_Name: this.GridItem.BarCode.Item_Name!, Name: this.GridItem.BarCode.Item_Name!, Details:this.GridItem.BarCode.Item_Name!,};
    
  }

  getUom($event: TypeUom){
    this.GridItem.Uom = $event;
  }
     
  CalcPurity(item: TypeGridItem)
  {
    item.Purity = +((item.Karat / 24) * 100).toFixed(2) ;
  }

  CalcKarat(item: TypeGridItem)
  {
    item.Karat = Math.round((item.Purity / 100) *24);
  }

  CalcWtandAmt(){
    this.GridItem.NettWt = +(this.GridItem.GrossWt - this.GridItem.StoneWt - this.GridItem.Wastage).toFixed(3);
    this.GridItem.Amount =  +(this.GridItem.NettWt * this.GridItem.Rate).toFixed(2)
  }

  }
