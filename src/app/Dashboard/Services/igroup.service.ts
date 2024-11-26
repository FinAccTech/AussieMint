import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';

@Injectable({
  providedIn: 'root'
})

export class IGroupService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getIGrps(GrpSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "GrpSno" :  GrpSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getItemGroups");                
  } 

  saveIGrp(Grp: TypeItemGroup): Observable<TypeHttpResponse> {    
      let postdata = Grp;
      return this.dataService.HttpPost(postdata, "/saveItemGroup");                
  }

  deleteIGrp(GrpSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "GrpSno" :  GrpSno }; 
      return this.dataService.HttpPost(postdata, "/deleteItemGroup");                
  }

Initialize(){
    let IGrp: TypeItemGroup = {            
        GrpSno: 0,
        Grp_Code: "",
        Grp_Name: "",
        Market_Rate: 0,
        Remarks: "",
        Active_Status: 0,
        Create_Date: 0,
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details: ""
    }
    return IGrp
}

}

export interface TypeItemGroup {
    GrpSno: number;
    Grp_Code: string;
    Grp_Name: string;
    Market_Rate: number;
    Remarks: string;
    Active_Status: number;
    Create_Date: number;
    UserSno: number;
    CompSno: number;   
    Name: string;
    Details: string;
}


