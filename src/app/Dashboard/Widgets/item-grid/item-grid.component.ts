import { Component, computed, effect, ElementRef, EventEmitter, Input, input, Output, Signal, ViewChild } from '@angular/core';
import { TypeBarCode, TypeGridItem } from '../../../Types/TypeGridItem';
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
import { StockselectionComponent } from '../stockselection/stockselection.component';
import { GlobalsService } from '../../../global.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ReportService } from '../../Services/reports.service';
import { NumberInputDirective } from "../../Directives/NumberInput";

@Component({
  selector: 'app-item-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectionlistComponent, NumberInputDirective],
  templateUrl: './item-grid.component.html',
  styleUrl: './item-grid.component.scss'
})

export class ItemGridComponent {
  private searchSubject = new Subject<number>();
  
  TransSno = input.required(); //For Input   
  GridItems = input<TypeGridItem[]>(); //For Input  
  DocFooter = input<TypeDocFooter>();
  EnableBarCode = input.required();
  GenerateBarCode = input.required();
  EnableAmountCols = input.required();
  StockSelection = input.required();
  VouTypeSno = input.required();
  ImageSource = input<FileHandle[]>([]); 
  
  ItemsList: TypeItem[] = [];
  UomsList: TypeUom[] = []; 
  DirectItemEntry: boolean = false;

  TotQty: number = 0;
  TotGrossWt: number = 0; 
  TotNettWt: number = 0;

  BarCodedList: TypeBarCode[] = [];
  BarCode: string = "";

  UpdRate: number = 0;
  @ViewChild('itemDiv') myDivRef!: ElementRef;

  constructor(private itmService: ItemService, private umService: UomService, private dialog: MatDialog, private globals: GlobalsService, private repService: ReportService) {
     this.searchSubject
        .pipe( 
          debounceTime(300), // Wait 300ms after user stops typing
          distinctUntilChanged() // Only emit if the value is different from the last
        )
        .subscribe((searchText) => {                  
          if (searchText < 1) { this.BarCode= ""; return;}
          
          let item: any = this.BarCodedList.find(itm => (itm.BarCode_No === this.BarCode) )
          
          if(item){          
            let itemExists: boolean = this.GridItems()!.some(it => it.BarCode.BarCode_No === item.BarCode_No);
            if (itemExists == false){
              this.GridItems()!.push(
                      {BarCode:{"BarCodeSno": item.BarCodeSno, BarCode_No: item.BarCode_No, Name: item.BarCode_No!, Details: item.BarCode_No!}, 
                        DetSno: item.DetSno!,
                        Item:{ItemSno: item.ItemSno!, Item_Name:item.Item_Name!, Name:item.Item_Name!, Details:item.Item_Name! },
                        Item_Desc: item.Item_Desc!,
                        Karat: item.Karat!,
                        Purity: item.Purity!,
                        Qty: 1,
                        GrossWt: item.Balance_Wt!,
                        StoneWt: item.StoneWt!,
                        Wastage: item.Wastage!,
                        NettWt: item.Balance_Wt!,
                        Uom: {UomSno: item.UomSno!, Uom_Name: item.Uom_Name!, Name: item.Uom_Name, Details:item.Uom_Name, Base_Qty:item.Base_Qty},
                        Rate: item.Rate!,
                        Amount: item.Amount!,                                        
                      }
              ); 
            }
          }
          item = null;
          // Add your search logic here
          this.BarCode = "";
        });

    effect(()=>{                  
      this.SetTotals();                  
    })
  }

  ngOnInit(){        
    this.repService.getBarCodeStock().subscribe(data=>{
      this.BarCodedList = JSON.parse(data.apiData);
      this.BarCodedList = this.BarCodedList.filter(itm=>{
        return itm.Balance_Wt! > 0 
      })      
    })

    this.itmService.getItems(0,0).subscribe(data=>{
      this.ItemsList = JSON.parse (data.apiData);
    });
    this.umService.getUoms(0).subscribe(data=>{
      this.UomsList = JSON.parse (data.apiData);
    })
  }

  AddItem(){
    if (this.DirectItemEntry){
      this.GridItems()!.push({DetSno:0, BarCode:{BarCodeSno:0, BarCode_No:"", Name:"", Details:"" }, Item: this.itmService.Initialize(), Karat:0, Purity:0, Item_Desc:"", Qty:0, GrossWt:0, StoneWt:0, Wastage:0, NettWt:0, Uom: this.umService.Initialize(), Rate:0, Amount:0});
      this.SetTotals();     
    }
    else{
      let item: TypeGridItem = {DetSno:0, BarCode:{BarCodeSno:0, BarCode_No:"", Name:"", Details:""}, Item: this.itmService.Initialize(), Karat:0, Purity:0, Item_Desc:"", Qty:0, GrossWt:0, StoneWt:0, Wastage:0, NettWt:0, Uom: this.umService.Initialize(), Rate:0, Amount:0};
      const dialogRef = this.dialog.open(AdditemComponent, 
        {
          data: { "EnableBarCode":  ((this.VouTypeSno() == this.globals.VTypRefiningIssue) ? false : this.EnableBarCode()), "GenerateBarCode": this.GenerateBarCode(), "EnableAmountCols": this.EnableAmountCols(), "Item": item},        
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

  SelectfromInventory(){
    const dialogRef = this.dialog.open(StockselectionComponent, 
      {
        width:"80vw",        
        maxWidth: 'none',      
        data: this.GridItems(),                
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {                  
        
        if (result) 
        { 
          if (this.TransSno() == 0){
            this.GridItems()?.splice(0, this.GridItems()?.length);          
          }
          result.forEach((itm: any)=>{
            this.GridItems()!.push(itm); 
          })
          this.SetTotals();      
          // let isExists: boolean = false;
          //   this.GridItems()!.forEach(item => {
          //     if (item.BarCode.BarCodeSno == result.BarCode.BarCodeSno){
          //       this.globals.SnackBar("error", "Item already added in the list", 1000);                
          //       isExists = true;
          //       return;                
          //     }
          //   })
          
          //   if (isExists == false){
          //     this.GridItems()!.push(result);    
          //     this.SetTotals();        
          //   }   
        }        
      });  
  }
  

EditItem( item: TypeGridItem, index: number){  
    const dialogRef = this.dialog.open(AdditemComponent, 
    {            
      //data: item,        
      data: { "EnableBarCode": this.EnableBarCode(), "GenerateBarCode": this.GenerateBarCode(), "EnableAmountCols": this.EnableAmountCols(), "Item": item},        
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
    let TaxableAmount: number = 0;

    this.GridItems()!.forEach(item => {
        this.TotQty +=  +item.Qty;
        this.TotGrossWt +=  +item.GrossWt * (item.Uom.Base_Qty! == 0 ? 1 : item.Uom.Base_Qty!);
        this.TotNettWt +=  +item.NettWt * (item.Uom.Base_Qty! == 0 ? 1 : item.Uom.Base_Qty!) ;
        this.DocFooter()!.TotalAmount +=  +item.Amount;
        if (item.Karat < 24){
          TaxableAmount += +item.Amount;
        }
    });
       
    this.DocFooter()!.TotalAmount =  +this.DocFooter()!.TotalAmount.toFixed(2);

    this.TotGrossWt = +this.TotGrossWt.toFixed(3);
    this.TotNettWt = +this.TotNettWt.toFixed(3);
    
    this.DocFooter()!.TaxAmount = +((this.DocFooter()!.TaxPer / 100) * TaxableAmount).toFixed(2);
    this.DocFooter()!.RevAmount = +(this.DocFooter()!.TaxAmount).toFixed(2);
    this.DocFooter()!.NettAmount = +(this.DocFooter()!.TotalAmount).toFixed(2);
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

  onSearchByBarCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(+input.value);    
  }

  UpdateRates(){
    this.GridItems()?.forEach(it=>{
      it.Rate = this.UpdRate;
      it.Amount = it.NettWt * it.Rate;
    })
    this.SetTotals();     
  }
}
