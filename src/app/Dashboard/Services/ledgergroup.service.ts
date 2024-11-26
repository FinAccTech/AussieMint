import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';

@Injectable({
  providedIn: 'root'
})

export class LedgerGroupService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getLedgerGroups(GrpSno: number, ): Observable<TypeHttpResponse> {
    let postdata ={ "GrpSno": GrpSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getLedgerGroups");                
  } 

  saveLedgerGroup(grp: TypeLedgerGroup): Observable<TypeHttpResponse> {    
      let postdata = grp;
      return this.dataService.HttpPost(postdata, "/saveLedgerGroup");                
  }

  deleteLedgerGroup(GrpSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "GrpSno" :  GrpSno }; 
      return this.dataService.HttpPost(postdata, "/deleteLedgerGroup");                
  }

  Initialize(){
    let LedgerGroup: TypeLedgerGroup = {
        GrpSno:0,
        Grp_Code: "AUTO",
        Grp_Name: "",            
        GroupUnder: {"GrpSno":0, "Grp_Code":"", "Grp_Name":""},
        Grp_Level: 0,
        Grp_Desc: "",
        Grp_Nature: 0,
        Affect_Gp: false,
        Remarks: "",
        IsStd: false,
        Created_Date: 0,       
        Name: "",
        Details:""
    }
    return LedgerGroup
}

}

export interface TypeLedgerGroup{
    GrpSno: number;
    Grp_Code: string;
    Grp_Name: string;    
    GroupUnder?: TypeLedgerGroup;
    Grp_Level?: number;
    Grp_Desc?: string;
    Grp_Nature?: number
    Affect_Gp?: boolean;
    Remarks?: string;
    IsStd?: boolean;    
    Created_Date?: number;    
    Name?: string;
    Details?: string;
}
