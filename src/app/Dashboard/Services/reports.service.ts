import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';

@Injectable({
  providedIn: 'root'
})

export class ReportService {
  constructor(private sessionService: SessionStorageService,    
    private dataService: DataService
) { }

    getPendingDocuments(VouTypeSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "VouTypeSno" :  VouTypeSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
        return this.dataService.HttpGet(postdata, "/getPendingDocuments");                
    } 

    getStockReport(GrpSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "GrpSno": GrpSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getStockReport");                
  } 
    
}


export interface TypeStockReport{
  ItemSno : number;
  Item_Name: string;
  Karat: number;
  Purity: number;
  UomSno: number;
  Uom_Name: string;
  Qty: number;
  GrossWt: number;
  StoneWt: number;
  Wastage: number;
  NettWt: number;
}