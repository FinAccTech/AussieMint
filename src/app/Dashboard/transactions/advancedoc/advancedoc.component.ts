import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TransactionService, TypePaymentModes, TypeTransaction } from '../../Services/transaction.service';
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

@Component({
  selector: 'app-advancedoc',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectionlistComponent, IntToDatePipe, MatDialogClose, NumberInputDirective],
  templateUrl: './advancedoc.component.html',
  styleUrl: './advancedoc.component.scss'
})

export class AdvancedocComponent {

  constructor(public dialogRef: MatDialogRef<AdvancedocComponent>,
    private dialog: MatDialog,
    private globals: GlobalsService,
    private clntService: ClientService,
    private serService: VoucherSeriesService,
    private transService: TransactionService,
    private sessionServive: SessionStorageService,
    private ledService: LedgerService,
    @Inject(MAT_DIALOG_DATA) public data: TypeTransaction,   ){
  }

  SeriesList: TypeVoucherSeries[] = [];
  ClientList: TypeClient[] = [];
  ImageSource: FileHandle[] = [];
  PaymentModeLedgers: TypeLedger[] = [];
  
  SeriesNameValid: boolean = true;
  DocNoValid: boolean = true;
  ClientNameValid: boolean = true;
  NettAmountValid: boolean = true;
  

  ngOnInit(){ 
        
    this.data.Fixed_Price = +(+this.data.Fixed_Price).toFixed(2);
    this.data.Commision = +(+this.data.Commision).toFixed(2);
    this.data.NettAmount = +(+this.data.NettAmount).toFixed(2);
    
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
  }

  ValidateInputs(): boolean{        
    if (!this.data.Series.SeriesSno || this.data.Series.SeriesSno == 0){ this.SeriesNameValid = false; this.globals.SnackBar("error", "Invalid Series details",1000); return false; }
    if (!this.data.Trans_No || this.data.Trans_No == ''){ this.DocNoValid = false; this.globals.SnackBar("error", "Invalid Document Number",1000); return false; }
    if (!this.data.Client.ClientSno || this.data.Client.ClientSno == 0){ this.ClientNameValid = false; this.globals.SnackBar("error", "Invalid Client details",1000); return false; }
    if (!this.data.NettAmount || this.data.NettAmount == 0){ this.NettAmountValid = false; this.globals.SnackBar("error", "Invalid Nett Amount",1000); return false; }

    return true;
   }


  SaveDocuemnt(){
    if (this.ValidateInputs() == false){ return; }
    
    if (this.data.PaymentModes.length == 0){
      this.data.PaymentModes.push ({ PmSno:0, TransSno:0, "Ledger": this.PaymentModeLedgers[0], "Amount" : this.data.NettAmount, "Remarks":"", Trans_Type:1 })
    }
    
    
    //All Xmls
    this.data.ItemDetailXML   = "<ROOT><Transaction> </Transaction> </ROOT>";
    this.data.ImageDetailXML  = this.globals.GetImageXml(this.ImageSource,this.sessionServive.GetCompany().CompSno,this.data.Series.VouType.VouTypeSno );
    this.data.PaymentModesXML = this.globals.GetPaymentModeXml( this.data.PaymentModes,this.data.Series.VouType);
    
    this.transService.saveTransaction(this.data).subscribe(data=>{
      if (data.queryStatus == 1){
        this.globals.SnackBar("info", "Advance Document saved successfully!!",1500);
        this.dialogRef.close();
    //    this.actionEvent.emit("iexit");
      }
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })
  }

  getClient($event: TypeClient){    
    this.data.Client = $event;
    this.data.Commision = this.data.Client.Commision;
    this.data.Client.ImagesSource = JSON.parse (this.data.Client.Images_Json);
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
}
