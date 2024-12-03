import { Component, Inject } from '@angular/core';
import { TypeGridItem } from '../../../../Types/TypeGridItem';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { SelectionlistComponent } from '../../selectionlist/selectionlist.component';
import { FormsModule } from '@angular/forms';
import { ItemService, TypeItem } from '../../../Services/item.service';
import { TypeUom, UomService } from '../../../Services/uom.service';
import { NumberInputDirective } from '../../../Directives/NumberInput';

@Component({
  selector: 'app-additem',
  standalone: true,
  imports: [MatDialogClose, SelectionlistComponent, FormsModule, NumberInputDirective],
  templateUrl: './additem.component.html',
  styleUrl: './additem.component.scss'
})

export class AdditemComponent {

  GridItem!: TypeGridItem;
  ItemsList: TypeItem[] = [];
  UomsList: TypeUom[] = [];
  
    constructor(private itmService: ItemService, private umService: UomService,
      public dialogRef: MatDialogRef<AdditemComponent>, @Inject(MAT_DIALOG_DATA) public data: TypeGridItem,                
    ) 
    {
      this.GridItem = data;           
    }

  ngOnInit(){
    this.itmService.getItems(0,0).subscribe(data=>{
      this.ItemsList = JSON.parse (data.apiData);
    });
    this.umService.getUoms(0).subscribe(data=>{
      this.UomsList = JSON.parse (data.apiData);
    })
  }

  AddItem(){
    this.dialogRef.close(this.GridItem);
  }

    
  getItem($event: TypeItem){
    this.GridItem.Item = $event;
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
