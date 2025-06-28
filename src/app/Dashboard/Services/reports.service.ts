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

    getClientHistory(ClientSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "ClientSno" :  ClientSno  }; 
      return this.dataService.HttpGet(postdata, "/getClientHistory");                
    } 

    getRecentTransactions(RowCount: number): Observable<TypeHttpResponse> {
      let postdata ={ "RowCount" :  RowCount, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getRecentTransactions");                
    } 

    getPendingDocuments(VouTypeSno: number, ClientSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "VouTypeSno" :  VouTypeSno, "ClientSno" :  ClientSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
        return this.dataService.HttpGet(postdata, "/getPendingDocuments");                
    } 
    
    getPendingGrins( ClientSno: number): Observable<TypeHttpResponse> {
      let postdata ={"ClientSno" :  ClientSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getPendingGrins");                
    } 

    getStockReport(GrpSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "GrpSno": GrpSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getStockReport");                
    } 

    getBarCodeStock(): Observable<TypeHttpResponse> {
      let postdata ={ "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getBarCodeStock");                
    } 
    
    getAssayRecords(RecordSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "RecordSno": RecordSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getAssayRecords");                
    }

    getDayBook(FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
      let postdata ={ "FromDate" :  FromDate, "ToDate": ToDate, "CompSno" :  this.sessionService.GetCompany().CompSno }; 
      return this.dataService.HttpGet(postdata, "/getDayBook");                
    }

    getLedgerBook(LedSno: number,  FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
      let postdata ={ "LedSno": LedSno, "FromDate" :  FromDate, "ToDate": ToDate, "CompSno" :  this.sessionService.GetCompany().CompSno }; 
      return this.dataService.HttpGet(postdata, "/getLedgerBook");                
    }

    getWeeklyConsolidated(FromDate: number, ToDate: number, VouTypeSno: number ): Observable<TypeHttpResponse> {
      let postdata ={ "FromDate": FromDate, "ToDate": ToDate,  "VouTypeSno" :  VouTypeSno, "CompSno" : this.sessionService.GetCompany().CompSno  }; 
      return this.dataService.HttpGet(postdata, "/getWeeklyConsolidated");                
    } 

    getBarCodeHistory(BarCodeSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "BarCodeSno" :  BarCodeSno  }; 
      return this.dataService.HttpGet(postdata, "/getBarCodeHistory");                
    } 
    
    getItemGroupDetailsofTrans(TransSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "TransSno" :  TransSno  }; 
      return this.dataService.HttpGet(postdata, "/getItemGroupDetailsofTrans");                
    } 

    getBarCodesofTransaction(TransSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "TransSno" :  TransSno  }; 
      return this.dataService.HttpGet(postdata, "/getBarCodesofTransaction");                
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

export interface TypeLedgerBook {
  DetSno: number;
  VouSno: number;
  Vou_Date: number;
  TrackSno: number;
  VouTypeSno: number;
  VouType_Name: string;
  Vou_No: string;
  LedSno: number;
  GrpSno: number;
  Grp_Name: string;
  Led_Name: string;
  Credit: number;
  Debit: number;
  Grp_Nature: number;
  BranchSno: number;
  Narration: number;
  CompSno: number;
}