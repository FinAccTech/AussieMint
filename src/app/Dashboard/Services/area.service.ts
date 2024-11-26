import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';

@Injectable({
  providedIn: 'root'
})

export class AreaService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getAreas(AreaSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "AreaSno" :  AreaSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getAreas");                
  } 

  saveArea(Grp: TypeArea): Observable<TypeHttpResponse> {    
      let postdata = Grp;
      return this.dataService.HttpPost(postdata, "/saveArea");                
  }

  deleteArea(AreaSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "AreaSno" :  AreaSno }; 
      return this.dataService.HttpPost(postdata, "/deleteArea");                
  }

Initialize(){
    let Area: TypeArea = {            
        AreaSno: 0,
        Area_Code: "",
        Area_Name: "",        
        Remarks: "",
        Active_Status: 0,
        Create_Date: 0,
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details: ""
    }
    return Area
}

}

export interface TypeArea {
    AreaSno: number;
    Area_Code: string;
    Area_Name: string;    
    Remarks: string;
    Active_Status: number;
    Create_Date: number;
    UserSno: number;
    CompSno: number;   
    Name: string;
    Details: string;
}


