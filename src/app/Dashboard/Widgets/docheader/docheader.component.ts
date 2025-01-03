import { Component, effect, EventEmitter, input, Output,} from '@angular/core';
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

@Component({
    selector: 'app-docheader',
    standalone: true,
    imports: [CommonModule, SelectionlistComponent, FormsModule, IntToDatePipe, MatSelect, MatOption],
    templateUrl: './docheader.component.html',
    styleUrl: './docheader.component.scss'
})  

export class DocheaderComponent {
  
  DocHeader = input<TypeDocHeader>(); //For Input
  DocFooter = input.required<TypeDocFooter>(); //For Input
  SeriesList: TypeVoucherSeries[]= [];
  EnableAmountCols = input.required(); 
  RefDetails:string = "";
  // AssayRecordList: TypeAssayRecord[] = [];
  // SelectedAssayItem!: TypeAssayRecord;

  @Output() actionEvent = new EventEmitter<any>();

  constructor(private transService: TransactionService, private serService: VoucherSeriesService, 
    private globals: GlobalsService, private dialog: MatDialog){    
    effect(() =>{      
      console.log(this.DocHeader());
      
      this.serService.getVoucherSeries(0, this.DocHeader()!.Series.VouType.VouTypeSno ).subscribe(data=>{
        this.SeriesList = JSON.parse(data.apiData);          
        if (this.DocHeader()!.TransSno == 0){
          this.getSeries(this.SeriesList[0]);      
          this.DocHeader()!.Trans_Date  = this.globals.DateToInt (new Date());
          this.DocHeader()!.Due_Date    = this.globals.DateToInt (new Date());  
        }     
      })  
    })    
  }   

  ngOnInit(){      
    // this.repService.getAssayRecords().subscribe(data=>{
    //   this.AssayRecordList = JSON.parse(data.apiData);
    // })
  }
  

  getSeries($event: TypeVoucherSeries){
    this.DocHeader()!.Series = $event;    
    this.transService.getVoucherNumber($event.SeriesSno).subscribe(data =>{
      this.DocHeader()!.Trans_No = data.apiData;      
    })
  }
  
  getReference($event: TypeTransaction){        
    this.RefDetails = "";
    this.DocHeader()!.Reference = $event;    
    this.RefDetails = "Amount: " +  (+$event.NettAmount).toFixed(2);
    this.actionEvent.emit({"Action":"RefTransaction","Trans":$event});
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
 