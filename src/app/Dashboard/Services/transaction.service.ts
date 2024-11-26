import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { SessionStorageService } from '../../session-storage.service';
import { TypeVoucherSeries, VoucherSeriesService } from './vouseries.service';
import { LedgerService, TypeLedger } from './ledger.service';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {

  constructor(private dataService: DataService, private sessionService: SessionStorageService, 
    private seriesService: VoucherSeriesService,
    private ledService: LedgerService,
) { }
  
 

InitializeDocHeader(){
    let Doc: TypeDocHeader = {            
        TransSno: 0,
        Trans_No: "",
        Series: this.seriesService.Initialize(),
        Trans_Date: 0,
        Due_Date: 0,
        RefSno: 0,
        PaymentModes: this.InitializePaymentModes(),
    }
    return Doc
}

InitializePaymentModes(){
    let Pmode: TypePaymentModes = {            
        PmSno: 0,
        TransSno: 0,
        Ledger: this.ledService.Initialize(),
        Amount: 0,
        Details: "",
    }
    return Pmode
}

}



export  interface TypeDocHeader{
    TransSno: number;
    Trans_No: string;
    Series: TypeVoucherSeries;
    Trans_Date: number;
    Due_Date?: number;
    RefSno?: number;
    PaymentModes: TypePaymentModes;
}


export interface TypePaymentModes{
    PmSno: number;
    TransSno: number;
    Ledger: TypeLedger;
    Amount: number;
    Details: string
}