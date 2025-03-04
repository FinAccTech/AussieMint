import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { IGroupService, TypeItemGroup } from './igroup.service';

@Injectable({
  providedIn: 'root'
})

export class ItemService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService, private grpService: IGroupService) { }
  
  getItems(ItemSno: number, GrpSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "ItemSno": ItemSno, "GrpSno" :  GrpSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getItems");                
  } 

  saveItem(Itm: TypeItem): Observable<TypeHttpResponse> {    
      let postdata = Itm;
      return this.dataService.HttpPost(postdata, "/saveItem");                
  }

  deleteItem(ItemSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "ItemSno" :  ItemSno }; 
      return this.dataService.HttpPost(postdata, "/deleteItem");                
  }
  
  getStdItemByCode(Item_Code:string): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno" : this.sessionService.GetCompany().CompSno, "Item_Code" : Item_Code }; 
    return this.dataService.HttpGet(postdata, "/getStdItemByCode");                
  } 

  getRefiningReceiptItems(): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getRefiningReceiptItems");                
  } 
  
  getBarCodedItems(): Observable<TypeHttpResponse> {
    let postdata ={ "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getBarCodedItems");                
  } 

Initialize(){    
    let Item: TypeItem = {            
        ItemSno: 0,
        Item_Code: "",
        Item_Name: "",
        IGroup: this.grpService.Initialize(),
        Require_LabTest: 0,
        Remarks: "",
      Active_Status: 0,
        Create_Date: 0,
        Taxable: 0,
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details: ""
    }
    return Item
}

}

export interface TypeItem {
    ItemSno: number;
    Item_Code?: string;
    Item_Name: string;
    IGroup?: TypeItemGroup;
    Require_LabTest?: number;
    Remarks?: string;
    Active_Status?: number;
    Create_Date?: number;
    Taxable?: number,
    UserSno?: number;
    CompSno?: number;   
    Name?: string;
    Details?: string;
}


