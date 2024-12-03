import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { AreaService, TypeArea } from './area.service';
import { FileHandle } from '../../Types/file-handle';

@Injectable({
  providedIn: 'root'
})

export class ClientService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService, private areaService: AreaService) { }
  
  getClients(ClientSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "ClientSno": ClientSno, "CompSno" : this.sessionService.GetCompany().CompSno }; 
    return this.dataService.HttpGet(postdata, "/getClients");                
  } 

  saveClient(Clnt: TypeClient): Observable<TypeHttpResponse> {    
      let postdata = Clnt;
      return this.dataService.HttpPost(postdata, "/saveClient");                
  }

  deleteClient(ClientSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "ClientSno" :  ClientSno }; 
      return this.dataService.HttpPost(postdata, "/deleteClient");                
  }

  getClientImages(ClientSno: number): Observable<TypeHttpResponse> {
    let postdata ={"CompSno" :  this.sessionService.GetCompany().CompSno,  "ClientSno" :  ClientSno}; 
    return this.dataService.HttpGet(postdata, "/getClientImages");                
}

Initialize(){    
    let Client: TypeClient = {            
        ClientSno: 0,
        Client_Code: "",
        Client_Name: "",
        Address: "",
        City: "",
        Pincode: "",
        State: "",
        Mobile: "",
        Client_Type: 0,
        Client_Cat: 0,
        Sex: 0,
        Dob: 0,
        Create_Date: 0,
        Issue_Date: 0,
        Expiry_Date: 0,
        Email: "",
        Id_Number: "",
        Gst_Number: "",
        Director_Name: "",
        Remarks: "",
        Images_Json: "",
        ImagesSource: [],
        Profile_Image: "",
        Area: this.areaService.Initialize(),
        Blocked: 0,
        UserSno: this.sessionService.GetUser().UserSno,
        CompSno: this.sessionService.GetCompany().CompSno,
        Name: "",
        Details: ""
    }
    return Client
}
}

export interface TypeClient {
    ClientSno: number;
    Client_Code: string;
    Client_Name: string;
    Address: string;
    City: string;
    Pincode: string;
    State: string;
    Mobile: string;
    Client_Type: number;
    Client_Cat: number;
    Sex: number;
    Dob: number;
    Create_Date: number;
    Issue_Date: number;
    Expiry_Date: number;
    Email: string;
    Id_Number: string;
    Gst_Number: string;
    Director_Name: string;
    Remarks: string;
    Profile_Image: string;
    Area: TypeArea;
    Blocked: number;
    ImagesSource?: FileHandle[];
    Images_Json: string;
    ImageDetailXML?: string;    
    TempImage?: string;
    UserSno: number;
    CompSno: number;   
    Name: string;
    Details: string;
}


