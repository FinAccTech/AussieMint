import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { LedgerGroupService, TypeLedgerGroup } from './ledgergroup.service';

@Injectable({
  providedIn: 'root'
})

export class LedgerService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService, private grpService: LedgerGroupService) { }
  
  getLedgers(LedSno: number, GrpSno: number, ExcludeGrpSno: number ): Observable<TypeHttpResponse> {
    let postdata ={ "LedSno": LedSno, "GrpSno": GrpSno, "ExcludeGrpSno": ExcludeGrpSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getLedgers");                
  } 

  saveLedger(led: TypeLedger): Observable<TypeHttpResponse> {    
      let postdata = led;
      return this.dataService.HttpPost(postdata, "/saveLedger");                
  }

  deleteLedger(LedSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "LedSno" :  LedSno }; 
      return this.dataService.HttpPost(postdata, "/deleteLedger");                
  }

  getPaymentModes(): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno" :  this.sessionService.GetCompany().CompSno}; 
    return this.dataService.HttpGet(postdata, "/getPaymentModes");                
  }

  getStandardLedgers(): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno" :  this.sessionService.GetCompany().CompSno}; 
    return this.dataService.HttpGet(postdata, "/getStandardLedgers");                
  }


  Initialize(){
    let Ledger: TypeLedger = {
        LedSno:0,
        Led_Code: "AUTO",
        Led_Name: "",            
        Group: this.grpService.Initialize(),
        OpenSno: 0,
        Opening_Balance:0,
        AcType: 0,
        Led_Desc: "",
        IsStd: false,
        Std_No: 0,
        Created_Date: 0,     
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details:""
    }
    return Ledger
}

}

export interface TypeLedger{
    LedSno: number;
    Led_Code: string;
    Led_Name: string;    
    Group?: TypeLedgerGroup;
    OpenSno?: number;
    Opening_Balance?: number;
    AcType?: number;
    Led_Desc?: string;
    IsStd?: boolean;    
    Std_No?: number
    Created_Date?: number;    
    CompSno: number;
    UserSno: number;    
    Name?: string;
    Details?: string;
}

