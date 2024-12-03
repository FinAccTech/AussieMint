import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';

@Injectable({
  providedIn: 'root'
})

export class VoucherSeriesService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getVoucherTypes(VouTypeSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "VouTypeSno" :  VouTypeSno,}; 
    return this.dataService.HttpGet(postdata, "/getVoucherTypes");                
  } 

  getVoucherSeries(SeriesSno: number, VouTypeSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "SeriesSno" :  SeriesSno, "VouTypeSno": VouTypeSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getVoucherSeries");                
  } 

  saveVoucherSeries(Grp: TypeVoucherSeries): Observable<TypeHttpResponse> {    
      let postdata = Grp;
      return this.dataService.HttpPost(postdata, "/saveVoucherSeries");                
  }

  deleteVoucherSeries(SeriesSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "SeriesSno" :  SeriesSno }; 
      return this.dataService.HttpPost(postdata, "/deleteVoucherSeries");                
  }

Initialize(){
    let Series: TypeVoucherSeries = {            
        SeriesSno: 0,
        VouType: {VouTypeSno:0, VouType_Name:"", Stock_Type:0, Cash_Type:0},
        Series_Name: "",
        Num_Method: 0, 
        Allow_Duplicate:0, 
        Start_No: 0, 
        Current_No: 0, 
        Prefix: "",
        Suffix: "",
        Width: 0, 
        Prefill: "",
        Print_Voucher: 0, 
        Print_On_Save: 0, 
        Show_Preview: 0, 
        Print_Style: "",
        IsStd: 0, 
        IsDefault: 0, 
        Active_Status: 0, 
        Create_Date: 0, 
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details: ""
    }
    return Series
}

}

export interface TypeVoucherSeries {
    SeriesSno: number;
    VouType: TypeVoucherTypes;
    Series_Name: string;
    Num_Method?:number;
    Allow_Duplicate?:number;
    Start_No?:number;
    Current_No?:number;
    Prefix?: string;
    Suffix?: string;
    Width?: number;
    Prefill?: string;
    Print_Voucher?:number;
    Print_On_Save?:number;
    Show_Preview?:number;
    Print_Style?: string;
    IsStd?:number;
    IsDefault?:number;
    Active_Status?:number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;   
    Name?: string;
    Details?: string;
}

export interface TypeVoucherTypes{
    VouTypeSno: number;
    VouType_Name: string;
    Stock_Type: number;
    Cash_Type: number;
}
