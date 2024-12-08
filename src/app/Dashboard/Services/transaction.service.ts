import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { TypeVoucherSeries, VoucherSeriesService } from './vouseries.service';
import { LedgerService, TypeLedger } from './ledger.service';
import { ClientService, TypeClient } from './client.service';
import { FileHandle } from '../../Types/file-handle';
import { TypeGridItem } from '../../Types/TypeGridItem';
import { TypeDocFooter } from '../../Types/TypeDocFooter';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {
  constructor(private sessionService: SessionStorageService,
    private seriesService: VoucherSeriesService,
    private clntService: ClientService,
    private ledService: LedgerService,
    private dataService: DataService
) { }

    getTransactions(TransSno: number, VouTypeSno: number, SeriesSno: number, FromDate: number, ToDate: number): Observable<TypeHttpResponse> {
        let postdata ={ "TransSno": TransSno, "VouTypeSno" :  VouTypeSno, "CompSno" : this.sessionService.GetCompany().CompSno, "SeriesSno" :SeriesSno, "FromDate": FromDate, "ToDate": ToDate }; 
        return this.dataService.HttpGet(postdata, "/getTransactions");                
    } 

    saveTransaction(trans: TypeTransaction): Observable<TypeHttpResponse> {    
        let postdata = trans;
        return this.dataService.HttpPost(postdata, "/saveTransaction");                
    }

    deleteTransaction(TransSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "TransSno" :  TransSno }; 
        return this.dataService.HttpPost(postdata, "/deleteTransaction");                
    }

    getVoucherNumber(SeriesSno: number): Observable<TypeHttpResponse> {
        let postdata ={ "SeriesSno" :  SeriesSno}; 
        return this.dataService.HttpGet(postdata, "/getVoucherNumber");                
    }


    InitializeTransaction () { 
    let Transaction: TypeTransaction = {
        TransSno:           0,
        Trans_No:           "",
        Trans_Date:         DateToInt(new Date()),
        IsOpen:             0,        
        Series:             this.seriesService.Initialize(),
        Client:             this.clntService.Initialize(),
    
        Due_Date:           DateToInt(new Date()),
        RefSno:             0,
        BarCodeRefSno:      0,
        TotAmount:          0,
        TaxPer:             0,
        TaxAmount:          0,
        RevAmount:          0,
        NettAmount:         0,
    
        Remarks:            "",
        Print_Remarks:      "",
    
        Locked:             0, 
        UserSno:            this.sessionService.GetUser().UserSno,
        CompSno:            this.sessionService.GetCompany().CompSno,
        VouSno:             0,

        PaymentModes:       [],
        GridItems:          [],

        Series_Json:        "",
        Client_Json:        "",
        PaymentModes_Json:  "",
        Items_Json:         "",
        Images_Json:        "",

        ItemDetailXML:      "",
        ImageDetailXML:     "",
        PaymentModesXML:    "",
        ImageSource:        [],

        Name:               "",
        Details:            "",
      }
      return Transaction;
    }

InitializeDocHeader(){
    let Doc: TypeDocHeader = {            
        TransSno:       0,
        Trans_No:       "",
        Series:         this.seriesService.Initialize(),
        Trans_Date:     0,
        Due_Date:       0,
        Reference:      this.InitializeTransaction(),
        RefList:        [],
        PaymentModes:   [],
    }
    return Doc
}

InitializeDocFooter(){
    let docfooter: TypeDocFooter = {Remarks:"", Print_Remarks: "", TotalAmount:0, TaxPer:10, TaxAmount:0, RevAmount:0, NettAmount:0}
    return docfooter;
}

InitializePaymentModes(){
    let Pmode:      TypePaymentModes = {            
        PmSno:      0,
        TransSno:   0,
        Ledger:     this.ledService.Initialize(),
        Amount:     0,
        Remarks:    "",
    }
    return Pmode
}

}

export  interface TypeDocHeader{
    TransSno:           number;
    Trans_No:           string;
    Series:             TypeVoucherSeries;
    Trans_Date:         number;
    Due_Date?:          number;
    Reference:          TypeTransaction;
    RefList:            TypeTransaction[];
    PaymentModes:       TypePaymentModes[];
}


export interface TypePaymentModes{
    PmSno:      number;
    TransSno:   number;
    Ledger:     TypeLedger;
    Amount:     number;
    Remarks:    string
}

export interface TypeTransaction{
    TransSno:           number,
    Trans_No:           string,
    Trans_Date:         number,    
    IsOpen:             number;    
    Series:             TypeVoucherSeries,
    Client:             TypeClient,
    
    Due_Date:           number,
    RefSno:             number,
    BarCodeRefSno:      number,
    TotAmount:          number,
    TaxPer:             number,
    TaxAmount:          number,
    RevAmount:          number,
    NettAmount:         number,
  
    Remarks:            string,
    Print_Remarks:      string,
  
    Locked:             number,    
    UserSno:            number,
    CompSno:            number,
    VouSno:             number;
    
    PaymentModes:       TypePaymentModes[];
    GridItems:          TypeGridItem[];
    Series_Json:        string;
    Client_Json:        string;
    PaymentModes_Json:  string;
    Items_Json:         string;
    Images_Json:        string;
    
    ItemDetailXML:      string;
    ImageDetailXML:     string;
    PaymentModesXML:    string;
    ImageSource:        FileHandle[];

    Name:               string;
    Details:            string;
}

export interface TypeAssayRecord{
    RecordSno:          number;
    BarCodeSno:         number;
    BarCode_No:         string;
    ItemSno:            number;
    Item_Name:          string;
    Trans_No:           string;
    Trans_Date:         string;
    Client_Name:        string;
    Assay_Status:       number;
    IssueTransSno:      number;
    IssueTrans_No:      string;
    ReceiptTransSno:    number;
    ReceiptTrans_No:    string;
}

function DateToInt(inputDate: Date)
{
  let month: string = (inputDate.getMonth() + 1).toString();    
  let day: string = inputDate.getDate().toString();    
  if (month.length == 1) { month = "0" + month }
  if (day.length == 1) {day = "0" + day }
  return parseInt (inputDate.getFullYear().toString() + month + day);
}