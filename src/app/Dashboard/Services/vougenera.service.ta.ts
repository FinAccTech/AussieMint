import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { IGroupService, TypeItemGroup } from './igroup.service';
import { FileHandle } from '../../Types/file-handle';
import { TypeVoucherSeries } from './vouseries.service';
import { LedgerService, TypeLedger } from './ledger.service';
import { TransactionService, TypePaymentModes } from './transaction.service';

@Injectable({
  providedIn: 'root'
})

export class VoucherGeneralService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService, private ledService: LedgerService) { }
  
getVouchersGeneral(VouSno: number, FromDate: number, ToDate: number, VouTypeSno: number, SeriesSno: number, Cancel_Status: number ): Observable<TypeHttpResponse> {
  let postdata ={ "VouSno" :  VouSno, "CompSno" : this.sessionService.GetCompany().CompSno , "FromDate": FromDate, "ToDate": ToDate, "VouTypeSno": VouTypeSno, "SeriesSno": SeriesSno, "Cancel_Status": Cancel_Status }; 
  return this.dataService.HttpGet(postdata, "/displayVoucherGeneral");          
}

saveVoucherGeneral(Vou: TypeVoucherGeneral): Observable<TypeHttpResponse>  {              
    let postdata = Vou;		
    return this.dataService.HttpPost(postdata, "/insertVoucherGeneral");  
}

deleteVoucherGeneral(VouSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno": this.sessionService.GetCompany().CompSno , "VouSno" :  VouSno}; 
    return this.dataService.HttpPost(postdata, "/deleteVoucher");                
}

getVoucherNumber(SeriesSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "SeriesSno" :  SeriesSno}; 
    return this.dataService.HttpGet(postdata, "/getVoucherNumber");                
}


InitializeVoucherGeneral () { 
    let Voucher: TypeVoucherGeneral = {
        VouSno:             0,		
        VouTypeSno:         0,
        Series:             {SeriesSno:0, Series_Name:"",VouType:{VouTypeSno:0, VouType_Name:"",Stock_Type:0, Cash_Type: 0 }},
        Vou_No:             "",
        Vou_Date:           DateToInt(new Date()) ,
        Narration:          "",
                
        UserSno:            this.sessionService.GetUser().UserSno,
        CompSno:            this.sessionService.GetCompany().CompSno,
        Cancel_Status:      0,
        Cancel_Date:        0,
        Cancel_Remarks:     "",

        PaymentModes:       [],
        PaymentModes_Json:  "",
        PaymentModesXML:    "",

        Ledger: this.ledService.Initialize(),
        Ledger_Json: "",

        Amount: 0,
        ImageDetailXML: "",
        fileSource:         [],
        Series_Json:        "",
        VouDetails_Json:    "",
        ImageSource: [],
        Images_Json:        "",
        Name:               "",
        Details:            ""
      }

      return Voucher;
}
}


export interface TypeVoucherGeneral{
    VouSno: number;		
    VouTypeSno: number;
    Series: TypeVoucherSeries;
    Vou_No: string;
    Vou_Date: number;
    Narration: string;
    
    UserSno: number;
    CompSno: number;
    Cancel_Status: number;
    Cancel_Date: number;
    Cancel_Remarks: string;                
    
    PaymentModes:       TypePaymentModes[];
    PaymentModes_Json:  string;
    PaymentModesXML:    string;

    Ledger: TypeLedger;
    Ledger_Json: string;
    Amount: number;
    ImageDetailXML: string;
    fileSource: FileHandle[];
    Series_Json: string;        
    VouDetails_Json: string;
    ImageSource: FileHandle[];
    Images_Json: string;
    Name: string;
    Details: string;
}

function DateToInt(inputDate: Date)
  {
    let month: string = (inputDate.getMonth() + 1).toString();    
    let day: string = inputDate.getDate().toString();    
    if (month.length == 1) { month = "0" + month }
    if (day.length == 1) {day = "0" + day }
    return parseInt (inputDate.getFullYear().toString() + month + day);
  }