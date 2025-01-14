import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';

@Injectable({
  providedIn: 'root'
})

export class UomService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getUoms(UomSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "UomSno": UomSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getUoms");                
  } 

  saveUom(Um: TypeUom): Observable<TypeHttpResponse> {    
      let postdata = Um;
      return this.dataService.HttpPost(postdata, "/saveUom");                
  }

  deleteUom(UomSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "UomSno" :  UomSno }; 
      return this.dataService.HttpPost(postdata, "/deleteUom");                
  }

  getStdUomByCode(Uom_Code:string): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno" : this.sessionService.GetCompany().CompSno, "Uom_Code" : Uom_Code }; 
    return this.dataService.HttpGet(postdata, "/getStdUomByCode");                
  } 

Initialize(){    
    let Uom: TypeUom = {            
        UomSno: 0,
        Uom_Code: "",
        Uom_Name: "",
        BaseUom: {UomSno:0, Uom_Code:"", Uom_Name:""},
        Base_Qty: 0,
        Remarks: "",
        Active_Status: 0,
        Create_Date: 0,
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details: ""
    }
    return Uom
}

}

export interface TypeUom {
    UomSno: number;
    Uom_Code?: string;
    Uom_Name: string;
    BaseUom?: TypeUom;
    Base_Qty?: number;    
    Remarks?: string;
    Active_Status?: number;
    Create_Date?: number;
    UserSno?: number;
    CompSno?: number;   
    Name?: string;
    Details?: string;
}


