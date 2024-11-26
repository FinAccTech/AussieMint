import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { TypeCompanies } from '../../Types/TypeCompanies';

@Injectable({
  providedIn: 'root'
})

export class CompanyService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getCompanies(UserSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "UserSno" :  UserSno}; 
    return this.dataService.HttpGet(postdata, "/getCompanies");                
  } 

  saveCompany(Comp: TypeCompanies): Observable<TypeHttpResponse> {    
      let postdata = Comp;
      return this.dataService.HttpPost(postdata, "/saveCompany");                
  }

  deleteCompany(CompSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "CompSno" :  CompSno }; 
      return this.dataService.HttpPost(postdata, "/deleteCompany");                
  }

Initialize(){
    let Comp: TypeCompanies = {            
        CompSno: 0,
        Comp_Code: "",
        Comp_Name: "",
        Fin_From: 0,
        Fin_To: 0,
        Books_From: 0,
        Address1: "",
        Address2: "",
        Address3: "",
        City: "",
        State: "",
        Pincode: "",
        Email: "",
        Phone: "",
        License_No: "",
        Hide_Status: 0,
        App_Version: 0,
        Db_Version: 0,
        Status: 0,
        CommMasters: 0,
    }
    return Comp
}

}



