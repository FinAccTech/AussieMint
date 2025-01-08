import { AfterViewInit, Component, effect, EventEmitter, input, Output,} from '@angular/core';
import { SelectionlistComponent } from "../selectionlist/selectionlist.component";
import { CommonModule } from '@angular/common';
import { TransactionService, TypeAssayRecord, TypeDocHeader, TypePaymentModes, TypeTransaction } from '../../Services/transaction.service';
import { FormsModule } from '@angular/forms';
import { TypeVoucherSeries, VoucherSeriesService } from '../../Services/vouseries.service';
import { GlobalsService } from '../../../global.service';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';
import { PaymodesComponent } from '../paymodes/paymodes.component';
import { MatDialog } from '@angular/material/dialog';
import { TypeDocFooter } from '../../../Types/TypeDocFooter';
import { MatOption, MatSelect } from '@angular/material/select';

export interface TypeRefDetails{
  DocType: number;
  Doc_No: string;
  Doc_Date: number;
  Doc_Amount: number;
  Doc_Weight: number;
  Doc_Rate: number;
  Doc_Commision: number;
}

@Component({
    selector: 'app-docheader',
    standalone: true,
    imports: [CommonModule, SelectionlistComponent, FormsModule, IntToDatePipe, MatSelect, MatOption],
    templateUrl: './docheader.component.html',
    styleUrl: './docheader.component.scss'
})  

export class DocheaderComponent implements AfterViewInit {
  
  DocHeader = input<TypeDocHeader>(); //For Input
  DocFooter = input.required<TypeDocFooter>(); //For Input
  SeriesList: TypeVoucherSeries[]= [];
  EnableAmountCols = input.required(); 
  RefDetails: TypeRefDetails[] = [];
  // AssayRecordList: TypeAssayRecord[] = [];
  // SelectedAssayItem!: TypeAssayRecord;

  @Output() actionEvent = new EventEmitter<any>();

  constructor(private transService: TransactionService, private serService: VoucherSeriesService, 
    private globals: GlobalsService, private dialog: MatDialog){    
    effect(() =>{      
      this.serService.getVoucherSeries(0, this.DocHeader()!.Series.VouType.VouTypeSno ).subscribe(data=>{
        this.SeriesList = JSON.parse(data.apiData);          
        if (this.DocHeader()!.TransSno == 0){
          this.getSeries(this.SeriesList[0]);      
          this.DocHeader()!.Trans_Date  = this.globals.DateToInt (new Date());
          this.DocHeader()!.Due_Date    = this.globals.DateToInt (new Date());  
        }             
        else{
          
        }
        
      })  
    })    
  }   

  ngAfterViewInit(){  
    if (this.DocHeader()?.TransSno !==0 ){
      setTimeout(() => {
        this.GetRefDetails(this.DocHeader()?.Reference!)
      }, 1000);
    }
  }
  

  getSeries($event: TypeVoucherSeries){
    this.DocHeader()!.Series = $event;    
    this.transService.getVoucherNumber($event.SeriesSno).subscribe(data =>{
      this.DocHeader()!.Trans_No = data.apiData;      
    })
  }
  
  getReference($event: TypeTransaction){  
    this.DocHeader()!.Reference = $event;    
    this.GetRefDetails($event);
    this.actionEvent.emit({"Action": "RefTransaction","Trans": $event});
  }

  GetRefDetails(Ref: TypeTransaction): void{
    this.RefDetails = [];    
    Ref.Series = JSON.parse(Ref.Series_Json)[0];
    
    switch (Ref.Series.VouType.VouTypeSno) {
      case this.globals.VTypAdvancePurchase:
        this.RefDetails.push({ DocType: this.globals.VTypAdvancePurchase, Doc_No: Ref.Trans_No, Doc_Date: Ref.Trans_Date, Doc_Amount: Ref.NettAmount, Doc_Commision: Ref.Commision, Doc_Rate: Ref.Fixed_Price, Doc_Weight: Ref.TotNettWt})
        break;    
      case this.globals.VTypAdvanceSales:
        this.RefDetails.push({ DocType: this.globals.VTypAdvanceSales, Doc_No: Ref.Trans_No, Doc_Date: Ref.Trans_Date, Doc_Amount: Ref.NettAmount, Doc_Commision: Ref.Commision, Doc_Rate: Ref.Fixed_Price, Doc_Weight: Ref.TotNettWt})
        break;    
      case this.globals.VTypGRN:
        this.RefDetails.push({ DocType: this.globals.VTypGRN, Doc_No: Ref.Trans_No, Doc_Date: Ref.Trans_Date, Doc_Amount: Ref.NettAmount, Doc_Commision: Ref.Commision, Doc_Rate: Ref.Fixed_Price, Doc_Weight: Ref.TotNettWt})
        if (Ref.RefSno !== 0){
           this.transService.getTransactions(Ref.RefSno,0,0,0,0).subscribe(data=>{
            let advDetails = JSON.parse(data.apiData)[0];          
            this.RefDetails.push({ DocType: this.globals.VTypAdvancePurchase, Doc_No: advDetails.Trans_No, Doc_Date: advDetails.Trans_Date, Doc_Amount: advDetails.NettAmount, Doc_Commision: advDetails.Commision, Doc_Rate: advDetails.Fixed_Price, Doc_Weight: advDetails.TotNettWt})                          
           })
        }
        break;    
      case this.globals.VTypDeliveryDoc:        
        this.RefDetails.push({ DocType: this.globals.VTypDeliveryDoc, Doc_No: Ref.Trans_No, Doc_Date: Ref.Trans_Date, Doc_Amount: Ref.NettAmount, Doc_Commision: Ref.Commision, Doc_Rate: Ref.Fixed_Price, Doc_Weight: Ref.TotNettWt});
        if (Ref.RefSno !== 0){
          this.transService.getTransactions(Ref.RefSno,0,0,0,0).subscribe(data=>{
            let advDetails = JSON.parse(data.apiData)[0];                      
            this.RefDetails.push({ DocType: this.globals.VTypAdvanceSales, Doc_No: advDetails.Trans_No, Doc_Date: advDetails.Trans_Date, Doc_Amount: advDetails.NettAmount, Doc_Commision: advDetails.Commision, Doc_Rate: advDetails.Fixed_Price, Doc_Weight: advDetails.TotNettWt});
            
          })
        }
        break;    
      default:
        break;
    }    
  }

  getAssayItem($event: TypeAssayRecord){
    this.DocHeader()!.BarReference = $event;
    this.actionEvent.emit({"Action":"BarReference","Trans":$event});
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  OpenPaymentModes(){
    if (this.DocFooter().NettAmount == 0) { this.globals.SnackBar("error","Nett Amount is zero!!",1000); return; }
    const dialogRef = this.dialog.open(PaymodesComponent, 
      { 
        panelClass:['rightdialogMat'],        
        position:{"right":"0","top":"0" },              
        maxWidth: 'none',        
        data: {"Amount": this.DocFooter().NettAmount, "PaymentModeList": this.DocHeader()!.PaymentModes, "Trans_Type": 1} ,
      });
      
      dialogRef.disableClose = true;  
      dialogRef.afterClosed().subscribe((result: TypePaymentModes[]) => {        
        if (result){  
          if (result){                    
            this.DocHeader()!.PaymentModes = result;
          }        
        }      
      }); 
  }
  

}
 