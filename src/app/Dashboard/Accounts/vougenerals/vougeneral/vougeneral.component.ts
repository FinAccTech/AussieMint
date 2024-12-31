import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../../global.service';
import { LedgerService, TypeLedger } from '../../../Services/ledger.service';
import { TypeVoucherSeries, VoucherSeriesService } from '../../../Services/vouseries.service';
import { SessionStorageService } from '../../../../session-storage.service';
import { FileHandle } from '../../../../Types/file-handle';
import { TypeVoucherGeneral, VoucherGeneralService } from '../../../Services/vougenera.service.ta';
import { PaymodesComponent } from '../../../Widgets/paymodes/paymodes.component';
import { TypePaymentModes } from '../../../Services/transaction.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectionlistComponent } from '../../../Widgets/selectionlist/selectionlist.component';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { MatOption, MatSelect } from '@angular/material/select';
import { AutoUnsubscribe } from '../../../../auto-unsubscribe.decorator';

@Component({
  selector: 'app-vougeneral',
  imports: [CommonModule, FormsModule, SelectionlistComponent, IntToDatePipe, MatSelect, MatOption, MatDialogClose ],
  templateUrl: './vougeneral.component.html',
  styleUrl: './vougeneral.component.scss'
})

@AutoUnsubscribe
export class VougeneralComponent {

  constructor(public dialogRef: MatDialogRef<VougeneralComponent>,
    private dialog: MatDialog,
    private globals: GlobalsService,
    private ledService: LedgerService,
    private serService: VoucherSeriesService,
    private vouService: VoucherGeneralService,    
    private sessionServive: SessionStorageService,    
    @Inject(MAT_DIALOG_DATA) public data: TypeVoucherGeneral,   ){
  }

  SeriesList: TypeVoucherSeries[] = [];
  LedList: TypeLedger[] = [];
  ImageSource: FileHandle[] = [];
  PaymentModeLedgers: TypeLedger[] = [];
  
  SeriesNameValid: boolean = true;
  DocNoValid: boolean = true;
  ClientNameValid: boolean = true;
  NettAmountValid: boolean = true;
  

  ngOnInit(){
    this.ledService.getLedgers(0,0,0).subscribe(data =>{
      this.LedList = JSON.parse(data.apiData);      
    })
    // this.serService.getVoucherSeries(0,this.data.Series.VouType.VouTypeSno).subscribe(data =>{
    //   this.SeriesList = JSON.parse(data.apiData);
    //   this.getSeries(this.SeriesList[0]);
    // })

    this.ledService.getPaymentModes().subscribe(data=>{
      this.PaymentModeLedgers = JSON.parse(data.apiData);
    });

    if (this.data.VouTypeSno == 0) { this.data.VouTypeSno = 2; this.getVoucherType() }
  }

  ValidateInputs(): boolean{        
    if (!this.data.Series.SeriesSno || this.data.Series.SeriesSno == 0){ this.SeriesNameValid = false; this.globals.SnackBar("error", "Invalid Series details",1000); return false; }
    if (!this.data.Vou_No || this.data.Vou_No == ''){ this.DocNoValid = false; this.globals.SnackBar("error", "Invalid Document Number",1000); return false; }
    // if (!this.data.Client.ClientSno || this.data.Client.ClientSno == 0){ this.ClientNameValid = false; this.globals.SnackBar("error", "Invalid Client details",1000); return false; }
    // if (!this.data.NettAmount || this.data.NettAmount == 0){ this.NettAmountValid = false; this.globals.SnackBar("error", "Invalid Nett Amount",1000); return false; }

    return true;
   }


  SaveVoucher(){
    if (this.ValidateInputs() == false){ return; }
    
    if (this.data.PaymentModes.length == 0){
      this.data.PaymentModes.push ({ PmSno:0, TransSno:0, "Ledger": this.PaymentModeLedgers[0], "Amount" : this.data.Amount, "Remarks":"", Trans_Type:2 })
    }
        
    // All Xmls
    this.data.ImageDetailXML  = this.globals.GetImageXml(this.ImageSource,this.sessionServive.GetCompany().CompSno,this.data.Series.VouType.VouTypeSno );
    this.data.PaymentModesXML = this.globals.GetPaymentModeXml( this.data.PaymentModes,this.data.Series.VouType);

    console.log(this.data.PaymentModesXML);
    
    

    this.vouService.saveVoucherGeneral(this.data).subscribe(data=>{
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

  
  getVoucherType(){        
    this.serService.getVoucherSeries(0,this.data.VouTypeSno).subscribe(data=>{      
      this.SeriesList = JSON.parse(data.apiData);
      this.getSeries(this.SeriesList[0]);
    })
  }

  getSeries($event: TypeVoucherSeries){    
    this.data.Series = $event;
    this.vouService.getVoucherNumber($event.SeriesSno).subscribe(data =>{
      console.log(data);
      
      this.data.Vou_No = data.apiData;      
    })
  }

  getLedger($event: TypeLedger){
    this.data.Ledger = $event;
  }

  OpenPaymentModes(){
    
    // if (this.data.NettAmount == 0) { this.globals.SnackBar("error","Nett Amount is zero!!",1000); return; }
    const dialogRef = this.dialog.open(PaymodesComponent, 
      { 
        panelClass:['rightdialogMat'],        
        position:{"right":"0","top":"0" },              
        maxWidth: 'none',        
        data: {"Amount": this.data.Amount, "PaymentModeList": this.data.PaymentModes, "Trans_Type": 2 } ,
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
