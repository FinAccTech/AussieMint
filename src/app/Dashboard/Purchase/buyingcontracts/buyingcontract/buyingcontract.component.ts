import { Component, signal } from '@angular/core';
import { DocheaderComponent } from "../../../Widgets/docheader/docheader.component";
import { FormsModule } from '@angular/forms';
import { TransactionService, TypeDocHeader } from '../../../Services/transaction.service';
import { GlobalsService } from '../../../../global.service';
import { ClientcardComponent } from '../../../Widgets/partycard/clientcard.component';
import { ClientService, TypeClient } from '../../../Services/client.service';

@Component({
  selector: 'app-buyingcontract',
  standalone: true,
  imports: [DocheaderComponent, FormsModule, ClientcardComponent],
  templateUrl: './buyingcontract.component.html',
  styleUrl: './buyingcontract.component.scss'
}) 

export class BuyingcontractComponent {
  DocHeader!: TypeDocHeader;
  
  SelectedClient!: TypeClient;
  SignalClient = signal(this.SelectedClient);

  constructor(private transService: TransactionService, private globals: GlobalsService, private clntService: ClientService){
    this.DocHeader  =  transService.InitializeDocHeader();  // {TransSno:0, Trans_No:"VC0003", Trans_Date: this.globals.DateToInt (new Date()) , Series:{ SeriesSno:0, Series_Name:"", VouType:{VouTypeSno: 11,VouType_Name:"Buying Contract" }},PaymentModes:{PmSno:0, TransSno:0, Amount:0, Details:""} };
    this.DocHeader.Series.VouType.VouTypeSno = this.globals.VTypBuyingContract;
    this.DocHeader.Trans_Date = this.globals.DateToInt (new Date());
    this.DocHeader.Due_Date = this.globals.DateToInt (new Date());
    this.SelectedClient  = clntService.Initialize();
  }

  ShowParty(){
    console.log(this.SelectedClient);    
  }

  ngOnInit(){
    
  }
}
 