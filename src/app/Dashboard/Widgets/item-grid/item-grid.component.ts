import { Component, computed, effect, ElementRef, EventEmitter, Input, input, Output, Signal, ViewChild } from '@angular/core';
import { TypeGridItem } from '../../../Types/TypeGridItem';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService, TypeItem } from '../../Services/item.service';
import { TypeUom, UomService } from '../../Services/uom.service';
import { AdditemComponent } from './additem/additem.component';
import { MatDialog } from '@angular/material/dialog';
import { SelectionlistComponent } from '../selectionlist/selectionlist.component';
import { ImagesComponent } from '../images/images.component';
import { FileHandle } from '../../../Types/file-handle';
import { TypeDocFooter } from '../../../Types/TypeDocFooter';

@Component({
  selector: 'app-item-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectionlistComponent],
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.scss'
})

export class ItemGridComponent {
  GridItems = input<TypeGridItem[]>(); //For Input  
  DocFooter = input<TypeDocFooter>();
  EnableBarCode = input.required();
  GenerateBarCode = input.required();
  EnableAmountCols = input.required();

  ImageSource = input<FileHandle[]>([]); 
  
  ItemsList: TypeItem[] = [];
  UomsList: TypeUom[] = []; 
  DirectItemEntry: boolean = false;

  TotQty: number = 0;
  TotGrossWt: number = 0;
  TotNettWt: number = 0;
  
  @ViewChild('itemDiv') myDivRef!: ElementRef;

  constructor(private itmService: ItemService, private umService: UomService, private dialog: MatDialog) {
    effect(()=>{                  
      this.SetTotals();                  
    })
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
    if (this.DirectItemEntry){
      this.GridItems()!.push({DetSno:0, BarCode:{BarCodeSno:0, BarCode_No:""}, Item: this.itmService.Initialize(), Karat:0, Purity:0, Item_Desc:"", Qty:0, GrossWt:0, StoneWt:0, Wastage:0, NettWt:0, Uom: this.umService.Initialize(), Rate:0, Amount:0});
      this.SetTotals();     
    }
    else{
      let item: TypeGridItem = {DetSno:0, BarCode:{BarCodeSno:0, BarCode_No:"BarCode"}, Item: this.itmService.Initialize(), Karat:24, Purity:91.6, Item_Desc:"No Dewscription", Qty:3, GrossWt:3.900, StoneWt:.400, Wastage:.100, NettWt:3.400, Uom: this.umService.Initialize(), Rate:6000, Amount:30000};
      const dialogRef = this.dialog.open(AdditemComponent, 
        {
          data: item,        
          panelClass: "dialogMat"
        });      
        dialogRef.disableClose = true; 
        dialogRef.afterClosed().subscribe(result => {                  
          if (result) 
          { 
            this.GridItems()!.push(result);    
            this.SetTotals();           
          }        
        });  
    }
    this.myDivRef.nativeElement.scrollTop = this.myDivRef.nativeElement.scrollHeight+1000;    
  }

  EditItem( item: TypeGridItem, index: number){
    const dialogRef = this.dialog.open(AdditemComponent, 
      {
        data: item,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {                  
        if (result) 
        { 
          this.GridItems()![index] = result;
          this.SetTotals();     
        }        
      });  
  }

  RemoveItem(index: number){
    this.GridItems()?.splice(index,1);
    this.SetTotals();     
  }

  getItem($event: TypeItem){

  }

  getUom($event: TypeUom){

  }

  SetTotals(){    
    this.TotQty  = 0;
    this.TotGrossWt = 0;
    this.TotNettWt = 0;    
    this.DocFooter()!.TotalAmount =  0;

    this.GridItems()!.forEach(item => {
        this.TotQty +=  item.Qty;
        this.TotGrossWt +=  item.GrossWt;
        this.TotNettWt +=  item.NettWt;
        this.DocFooter()!.TotalAmount +=  item.Amount;
    });
    
    this.DocFooter()!.TaxAmount = +((this.DocFooter()!.TaxPer / 100) * this.DocFooter()!.TotalAmount).toFixed(2);
    this.DocFooter()!.RevAmount = +(this.DocFooter()!.TaxAmount).toFixed(2);
    this.DocFooter()!.NettAmount = +(this.DocFooter()!.TaxAmount +  this.DocFooter()!.TotalAmount).toFixed(2);

  }

  OpenImagesCreation(){
    var img = this.ImageSource(); 

    const dialogRef = this.dialog.open(ImagesComponent, 
      { 
        width:"70vw",
        height:"60vh",        
        maxWidth: 'none',        
        data: {img}, 
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {
        if (result){
          let i = 0;
          this.ImageSource().forEach(item =>{
            this.ImageSource().slice(i,1);
            i++;
          });          
          //this.ImageSource().push(result);
        }         
      }); 
  }



}