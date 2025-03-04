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
        //let postdata = trans;
        
         let postdata = {             
            "BarCodeRefSno" :trans.BarCodeRefSno,
            // "Client" : {"ClientSno": trans.Client.ClientSno} ,
            "Client" : trans.Client,
            "Client_Json" :"",
            "Commision": trans.Commision,
            "CompSno":trans.CompSno,
            "Details"  :"",         
            "Due_Date" :trans.Due_Date,           
            "Fixed_Price" :trans.Fixed_Price,           
            "GridItems": trans.GridItems,
            "ImageDetailXML" : trans.ImageDetailXML,
            "ImageSource" :  trans.ImageSource,
            "Images_Json" : "",
            "IsOpen" : trans.IsOpen,
            "ItemDetailXML": trans.ItemDetailXML,
            "Items_Json" :  "",
            "Locked" :  trans.Locked,
            "Name" : trans.Name,
            "NettAmount" : trans.NettAmount,
            "PaymentModes" :  trans.PaymentModes,
            "PaymentModesXML" :  trans.PaymentModesXML,
            "PaymentModes_Json" :  "",
            "Payment_Type" :  trans.Payment_Type,
            "PrintReference" :  trans.PrintReference,
            "PrintReference_Json" : "",
            "Print_Remarks" : trans.Print_Remarks,
            "Ref_Amount": trans.Ref_Amount,
            "Doc_Balance_Amt": trans.Doc_Balance_Amt,
            "RefSno" : trans.RefSno,
            "Remarks":  trans.Remarks,
            "RevAmount": trans.RevAmount,            
            "Series" : trans.Series,
            "Series_Json" :  "",
            "TaxAmount" :  trans.TaxAmount,
            "TaxPer" :  trans.TaxPer,
            "TotAmount" : trans.TotAmount ,
            "TotGrossWt" : trans.TotGrossWt,
            "TotNettWt" :  trans.TotNettWt,
            "TotPureWt" :  trans.TotPureWt,
            "TotQty" : trans.TotQty,
            "TotStoneWt" :  trans.TotStoneWt,
            "TotWastage" : trans.TotWastage,
            "TransSno" : trans.TransSno,
            "Trans_Date" : trans.Trans_Date,
            "Trans_No" : trans.Trans_No,
            "UserSno" : trans.UserSno,
            "VouSno": trans.VouSno,
        }
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

    mailDocument(TransSno: number, Email: string): Observable<TypeHttpResponse>{
        let postdata ={ "TransSno" :  TransSno, "Email": Email}; 
        return this.dataService.HttpGet(postdata, "/mailDocument");     
    }

    InitializeTransaction () { 
    let Transaction: TypeTransaction = {
        TransSno:           0,
        Trans_No:           "",
        Trans_Date:         DateToInt(new Date()),
        IsOpen:             0,        
        Series:             this.seriesService.Initialize(),
        Payment_Type:       0,
        Client:             this.clntService.Initialize(),
    
        Due_Date:           DateToInt(new Date()),
        RefSno:             0,
        PrintReference:     [],
        PrintReference_Json: "",
        BarCodeRefSno:      0,
        TotAmount:          0,
        TaxPer:             0,
        TaxAmount:          0,
        RevAmount:          0,
        NettAmount:         0,
    
        Fixed_Price:        0,
        Commision:          0,

        Remarks:            "",
        Print_Remarks:      "",
    
        Ref_Amount:         0,
        Doc_Balance_Amt:    0,

        TotQty:             0,
        TotGrossWt:         0,
        TotStoneWt:         0,
        TotWastage:         0,
        TotNettWt:          0,
        TotPureWt:          0,

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
        BarReference:   this.InitializeAssayRecord(),
        BarRefList:     [],
        PaymentModes:   [],
        Ref_Amount:     0,
        Payment_Type:   0,
        Client:         this.clntService.Initialize(),
        AdvanceAmount:  0
    }
    return Doc
}

InitializeDocFooter(){
    let docfooter: TypeDocFooter = {Remarks:"", Print_Remarks: "", TotalAmount:0, TaxPer:10, TaxAmount:0, RevAmount:0, NettAmount:0, AdvanceAmount:0}
    return docfooter;
}

InitializePaymentModes(){
    let Pmode:      TypePaymentModes = {            
        PmSno:      0,
        TransSno:   0,
        Trans_Type: 1,
        Ledger:     this.ledService.Initialize(),
        Amount:     0,
        Remarks:    "",
    }
    return Pmode
}

InitializeAssayRecord(){
    let aRecord:      TypeAssayRecord = {            
        RecordSno:          0,
        BarCodeSno:         0,
        BarCode_No:         "",
        ItemSno:            0,
        Item_Name:          "",
        Karat:              0,
        Purity:             0,
        Item_Desc:          "",
        Qty:                0,
        GrossWt:            0,
        StoneWt:            0,
        Wastage:            0,
        NettWt:             0,
        UomSno:             0,
        Uom_Name:           "",
        Trans_No:           "",
        Trans_Date:         0,
        ClientSno:          0,
        Client_Name:        "",
        Assay_Status:       0,
        IssueTransSno:      0,
        IssueTrans_No:      "",
        ReceiptTransSno:    0,
        ReceiptTrans_No:    "",
    }
    return aRecord
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
    BarReference:       TypeAssayRecord;
    BarRefList:         TypeAssayRecord[];
    PaymentModes:       TypePaymentModes[];
    Ref_Amount:         number;
    Payment_Type:       number;
    Client:             TypeClient;
    AdvanceAmount:      number;
}


export interface TypePaymentModes{
    PmSno:      number;
    TransSno:   number;
    Trans_Type: number;
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
    Payment_Type:       number;
    Client:             TypeClient,
    
    Due_Date:           number,
    RefSno:             number,
    PrintReference:     any,
    PrintReference_Json: string,
    BarCodeRefSno:      number,
    TotAmount:          number,
    TaxPer:             number,
    TaxAmount:          number,
    RevAmount:          number,
    NettAmount:         number,
  
    Fixed_Price:        number,
    Commision:          number,
    Remarks:            string,
    Print_Remarks:      string,
  
    Ref_Amount:         number,
    Doc_Balance_Amt:    number,

    TotQty:             number,
    TotGrossWt:         number,
    TotStoneWt:         number,
    TotWastage:         number,
    TotNettWt:          number,
    TotPureWt:          number,

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
    Karat:              number;
    Purity:             number;
    Item_Desc:          string;
    Qty:                number;
    GrossWt:            number;
    StoneWt:            number;
    Wastage:            number;
    NettWt:             number;
    UomSno:             number;
    Uom_Name:           string;    
    Trans_No:           string;
    Trans_Date:         number;
    ClientSno:          number;
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