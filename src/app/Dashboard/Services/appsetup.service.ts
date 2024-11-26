import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { TypeAppSetup } from '../../Types/TypeAppSetup';

@Injectable({
  providedIn: 'root'
})

export class AppSetupService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService) { }
  
  getAppSetup(SetupSno: number, CompSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "SetupSno" :  SetupSno, "CompSno" : CompSno }; 
    return this.dataService.HttpGet(postdata, "/getAppSetup");                
  } 

  saveAppSetup(Stp: TypeAppSetup): Observable<TypeHttpResponse> {    
      let postdata = Stp;
      return this.dataService.HttpPost(postdata, "/saveAppSetup");                
  }

  
Initialize(){
    let IGrp: TypeAppSetup = {            
        SetupSno:0,
        
        AreaCode_AutoGen: 0,
        AreaCode_Prefix: "",
        AreaCode_CurrentNo: 0,
    
        ClientCode_AutoGen: 0,
        ClientCode_Prefix: "",
        ClientCode_CurrentNo: 0,
    
        GrpCode_AutoGen: 0,
        GrpCode_Prefix: "",
        GrpCode_CurrentNo: 0,
    
        ItemCode_AutoGen: 0,
        ItemCode_Prefix: "",
        ItemCode_CurrentNo: 0,
      
        UomCode_AutoGen: 0,
        UomCode_Prefix: "",
        UomCode_CurrentNo: 0,

        Images_Mandatory: 0,
      
        Allow_DuplicateItems: 0,
        Disable_AddLess: 0,       
        Entries_LockedUpto: 0,
        Enable_Authentication: 0,
        Enable_OldEntries: 0,
        MobileNumberMandatory: 0,        
        CompSno: this.sessionService.GetCompany().CompSno,
    }
    return IGrp
}

}

