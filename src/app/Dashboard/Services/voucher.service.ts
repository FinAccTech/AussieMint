import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { IGroupService, TypeItemGroup } from './igroup.service';
import { FileHandle } from '../../Types/file-handle';
import { TypeVoucherSeries } from './vouseries.service';
import { TypeLedger } from './ledger.service';

@Injectable({
  providedIn: 'root'
})

export class VouchersService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService, private grpService: IGroupService) { }
  
  getVouchers(VouSno: number, FromDate: number, ToDate: number, VouTypeSno: number, SeriesSno: number, Cancel_Status: number ): Observable<TypeHttpResponse> {
    let postdata ={ "VouSno" :  VouSno, "CompSno" : this.sessionService.GetCompany().CompSno , "FromDate": FromDate, "ToDate": ToDate, "VouTypeSno": VouTypeSno, "SeriesSno": SeriesSno, "Cancel_Status": Cancel_Status }; 
    return this.dataService.HttpGet(postdata, "/getVouchers");          
}

saveVoucher(Vou: TypeVoucher): Observable<TypeHttpResponse>  {              
    let postdata = Vou;		
    return this.dataService.HttpPost(postdata, "/saveVoucher");  
}

deleteVoucher(VouSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno": this.sessionService.GetCompany().CompSno , "VouSno" :  VouSno}; 
    return this.dataService.HttpPost(postdata, "/deleteVoucher");                
}

getVoucherNumber(SeriesSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "SeriesSno" :  SeriesSno}; 
    return this.dataService.HttpGet(postdata, "/getTransactionNumber");                
}

InitializeVoucher () { 
    let Voucher: TypeVoucher = {
        VouSno: 0,		
        VouTypeSno: 0,
        Series: {SeriesSno:0, Series_Name:"",VouType:{VouTypeSno:0, VouType_Name:"",Stock_Type:0, Cash_Type: 0 }},
        Vou_No: "",
        Vou_Date: 0,
        Narration: "",
        TrackSno: 0,
        IsAuto: 0,
        GenType: 0,
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Cancel_Status: 0,
        Cancel_Date: 0,
        Cancel_Remarks: "",
        VouDetailXML: "",
        fileSource: [],
        Series_Json: "",
        VouDetails_Json: "",
        Images_Json: "",
        Name: "",
        Details: ""
      }
      return Voucher;
}
}


export interface TypeVoucher{
    VouSno: number;		
    VouTypeSno: number;
    Series: TypeVoucherSeries;
    Vou_No: string;
    Vou_Date: number;
    Narration: string;
    TrackSno: number;
    IsAuto: number;
    GenType: number;
    UserSno: number;
    CompSno: number;
    Cancel_Status: number;
    Cancel_Date: number;
    Cancel_Remarks: string;                
    VouDetailXML: string;        
    fileSource: FileHandle[];
    Series_Json: string;        
    VouDetails_Json: string;
    Images_Json: string;
    Name: string;
    Details: string;
}

export interface TypeVoucherLedger{
    Type: number;
    Ledger: TypeLedger;
    Debit: number;
    Credit: number
  }