import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TransactionService, TypeAssayRecord, TypePaymentModes, TypeTransaction } from '../../Services/transaction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, TypeClient } from '../../Services/client.service';
import { GlobalsService } from '../../../global.service';
import { SelectionlistComponent } from '../../Widgets/selectionlist/selectionlist.component';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';
import { TypeVoucherSeries, VoucherSeriesService } from '../../Services/vouseries.service';
import { PaymodesComponent } from '../../Widgets/paymodes/paymodes.component';
import { NumberInputDirective } from '../../Directives/NumberInput';
import { FileHandle } from '../../../Types/file-handle';
import { SessionStorageService } from '../../../session-storage.service';
import { LedgerService, TypeLedger } from '../../Services/ledger.service';
import { ReportService } from '../../Services/reports.service';
import { ItemService, TypeItem } from '../../Services/item.service';

@Component({
  selector: 'app-labtest',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectionlistComponent, IntToDatePipe, MatDialogClose, NumberInputDirective],
  templateUrl: './labtest.component.html',
  styleUrl: './labtest.component.scss'
})

export class LabtestComponent {
  constructor(public dialogRef: MatDialogRef<LabtestComponent>,
    private dialog: MatDialog,
    private globals: GlobalsService,
    private clntService: ClientService,
    private serService: VoucherSeriesService, 
    private transService: TransactionService,
    private sessionServive: SessionStorageService,
    private ledService: LedgerService,
    private repService: ReportService,
    private itService: ItemService,
    @Inject(MAT_DIALOG_DATA) public data: TypeTransaction,  ){
  }

  
  SeriesList: TypeVoucherSeries[] = [];
  ClientList: TypeClient[] = [];
  ImageSource: FileHandle[] = [];
  PaymentModeLedgers: TypeLedger[] = [];
  
  BarRefList: TypeAssayRecord[] = [];
  BarReference!: TypeAssayRecord;
  SampleGold: number = 2;
  RecdPurity: number = 0;

  IssuesList: TypeTransaction[] = [];
  IssueTrans!: TypeTransaction;

  SeriesNameValid: boolean = true;
  DocNoValid: boolean = true;
  ClientNameValid: boolean = true;
  SampleGoldValid: boolean = true;
  RecdPurityValid: boolean = true;
  
  SampleItem!: TypeItem;
  

  ngOnInit(){ 
        
    this.data.Fixed_Price = +(+this.data.Fixed_Price).toFixed(2);
    this.data.Commision = +(+this.data.Commision).toFixed(2);
    this.data.NettAmount = +(+this.data.NettAmount).toFixed(2);
    
    this.itService.getSampleGoldItem().subscribe(data =>{
      this.SampleItem = JSON.parse(data.apiData)[0];
    })

    this.clntService.getClients(0).subscribe(data =>{
      this.ClientList = JSON.parse(data.apiData);      
    })
    this.serService.getVoucherSeries(0,this.data.Series.VouType.VouTypeSno).subscribe(data =>{
      this.SeriesList = JSON.parse(data.apiData);
      if (this.data.TransSno == 0){
        this.getSeries(this.SeriesList[0]);
      }
    })

    this.ledService.getPaymentModes().subscribe(data=>{
      this.PaymentModeLedgers = JSON.parse(data.apiData);
    });

    if (this.data.Series.VouType.VouTypeSno == 26){
      this.repService.getAssayRecords(0).subscribe(data=>{
        this.BarRefList = JSON.parse(data.apiData);
        if (this.data.TransSno !== 0){
          this.BarReference = this.BarRefList[0];
        }
      })
      this.SampleGold = this.data.GridItems[0].NettWt;    
    }
    else{
      if (this.data.TransSno ==0){
      this.repService.getPendingDocuments(this.globals.VTypLabTestingIssue,0).subscribe(data=>{
        this.IssuesList = JSON.parse(data.apiData);
      })
      }
      else{
        this.transService.getTransactions(this.data.RefSno,0,0,0,0).subscribe(data =>{
          this.getIssueTrans(JSON.parse(data.apiData)[0]);          
        })
      }
      this.RecdPurity = this.data.GridItems[0].Purity;    
    }
  }

  ValidateInputs(): boolean{        
    if (!this.data.Series.SeriesSno || this.data.Series.SeriesSno == 0){ this.SeriesNameValid = false; this.globals.SnackBar("error", "Invalid Series details",1000); return false; }
    if (!this.data.Trans_No || this.data.Trans_No == ''){ this.DocNoValid = false; this.globals.SnackBar("error", "Invalid Document Number",1000); return false; }
    if (!this.data.Client.ClientSno || this.data.Client.ClientSno == 0){ this.ClientNameValid = false; this.globals.SnackBar("error", "Invalid Client details",1000); return false; }
    if (this.data.Series.VouType.VouTypeSno == 26){
      if (!this.SampleGold || this.SampleGold == 0){ this.SampleGoldValid = false; this.globals.SnackBar("error", "Sample Gold is mandatory",1000); return false; }
    }
    else{
      if (!this.RecdPurity || this.RecdPurity == 0){ this.RecdPurityValid = false; this.globals.SnackBar("error", "Received Purity is mandatory",1000); return false; }
    }
    

    return true;
   }


  SaveDocuemnt(){
    if (this.ValidateInputs() == false){ return; }
    
    if (this.data.PaymentModes.length == 0){
      this.data.PaymentModes.push ({ PmSno:0, TransSno:0, "Ledger": this.PaymentModeLedgers[0], "Amount" : this.data.NettAmount, "Remarks":"", Trans_Type:1 })
    }
    if (this.data.Series.VouType.VouTypeSno == this.globals.VTypLabTestingIssue)
    {
      this.data.BarCodeRefSno = this.BarReference.BarCodeSno;      
      this.data.GridItems = [
        {
          BarCode:    {BarCodeSno: this.BarReference.BarCodeSno, BarCode_No: this.BarReference.BarCode_No},
          DetSno:     0,
          Item:       {ItemSno: this.BarReference.ItemSno, Item_Name: this.BarReference.Item_Name},    
          Item_Desc:  this.BarReference.Item_Desc,
          Karat:      this.BarReference.Karat,
          Purity:     this.BarReference.Purity,
          Qty:        1,
          GrossWt:    this.SampleGold,
          StoneWt:    0,
          Wastage:    0,
          NettWt:     this.SampleGold,
          Uom:        {UomSno:1, Uom_Name: "Grams"},
          Rate:       0,
          Amount:     0,
        }
      ]
    }
    else{
      this.data.RefSno = this.IssueTrans.TransSno;
      this.data.GridItems = [
        {
          BarCode:    {BarCodeSno: this.IssueTrans.GridItems[0].BarCode.BarCodeSno , BarCode_No: this.IssueTrans.GridItems[0].BarCode.BarCode_No},
          DetSno:     0,
          Item:       this.SampleItem,    
          Item_Desc:  "Sample Gold from Testing",
          Karat:      0,
          Purity:     this.RecdPurity,
          Qty:        1,
          GrossWt:    this.IssueTrans.GridItems[0].NettWt,
          StoneWt:    0,
          Wastage:    0,
          NettWt:     this.IssueTrans.GridItems[0].NettWt,
          Uom:        this.IssueTrans.GridItems[0].Uom,
          Rate:       0,
          Amount:     0,
        }     
      ]
  
    }
    
   
   
    
    //All Xmls
    this.data.ItemDetailXML   = this.globals.GetItemXml(this.data.GridItems);
    this.data.ImageDetailXML  = this.globals.GetImageXml(this.ImageSource,this.sessionServive.GetCompany().CompSno,this.data.Series.VouType.VouTypeSno );
    this.data.PaymentModesXML = this.globals.GetPaymentModeXml( this.data.PaymentModes,this.data.Series.VouType);
    
    this.transService.saveTransaction(this.data).subscribe(data=>{
      if (data.queryStatus == 1){
        this.globals.SnackBar("info", "Lab Test Issue saved successfully!!",1500);
        this.dialogRef.close();    
      }
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })
  }

  getClient($event: TypeClient){    
    this.data.Client = $event;
    this.data.Commision = this.data.Client.Commision;
    if (this.data.Client.Images_Json){
      this.data.Client.ImagesSource = JSON.parse (this.data.Client.Images_Json);
    }
  }

  getSeries($event: TypeVoucherSeries){    
    this.data.Series = $event;
    this.transService.getVoucherNumber($event.SeriesSno).subscribe(data =>{
      this.data.Trans_No = data.apiData;      
    })
  }
 
  OpenPaymentModes(){
    
    if (this.data.NettAmount == 0) { this.globals.SnackBar("error","Nett Amount is zero!!",1000); return; }
    const dialogRef = this.dialog.open(PaymodesComponent, 
      { 
        panelClass:['rightdialogMat'],        
        position:{"right":"0","top":"0" },              
        maxWidth: 'none',        
        data: {"Amount": this.data.NettAmount, "PaymentModeList": this.data.PaymentModes, "Trans_Type":1} ,
      });
      
      dialogRef.disableClose = true;  
      dialogRef.afterClosed().subscribe((result: TypePaymentModes[]) => {        
        if (result){  
          if (result){                    
            console.log(result);
            
            this.data.PaymentModes = result;
          }        
        }      
      }); 
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  getAssayItem($event: TypeAssayRecord){
    this.BarReference = $event;    
  }

  getIssueTrans($event: TypeTransaction){
    this.IssueTrans = $event;
    this.IssueTrans.GridItems = JSON.parse (this.IssueTrans.Items_Json);
  }
}
