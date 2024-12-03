import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { TransactionService, TypeDocHeader, TypePaymentModes, TypeTransaction } from '../../Services/transaction.service';
import { ClientService, TypeClient } from '../../Services/client.service';
import { TypeGridItem } from '../../../Types/TypeGridItem';
import { FileHandle } from '../../../Types/file-handle';
import { GlobalsService } from '../../../global.service';
import { TitleheaderComponent } from '../../Widgets/titleheader/titleheader.component';
import { DocheaderComponent } from '../../Widgets/docheader/docheader.component';
import { ClientcardComponent } from '../../Widgets/partycard/clientcard.component';
import { ItemGridComponent } from '../../Widgets/item-grid/item-grid.component';
import { DocfooterComponent } from '../../Widgets/docfooter/docfooter.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeDocFooter } from '../../../Types/TypeDocFooter';
import { SessionStorageService } from '../../../session-storage.service';
import { TypeVoucherTypes } from '../../Services/vouseries.service';
import { ReportService } from '../../Services/reports.service';

@Component({ 
  selector: 'app-transaction',
  standalone: true,
  imports: [TitleheaderComponent, DocheaderComponent, ClientcardComponent, ItemGridComponent, DocfooterComponent],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss',
  animations: [
    trigger('myAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [
        animate('300ms ease-in')
      ]),
      transition('* => void', [
        animate('300ms ease-out')
      ])
    ])
  ]
})

@AutoUnsubscribe

export class TransactionComponent {
  state = 'void';   
  VouTypeName: string = "";

  DocHeader!:       TypeDocHeader;  
  SelectedClient!:  TypeClient;  
  GridItems:        TypeGridItem[] = [];  
  DocFooter!:      TypeDocFooter;  
  ImageSource:      FileHandle[] = [];

  
  EnableAmountCols: boolean = false;
  EnableBarCode: boolean = false;

  NeedMoreInfo:     boolean = true;

  @Input() ChildTransaction!:TypeTransaction;
  @Output() actionEvent = new EventEmitter<string>();

  constructor(private transService: TransactionService, 
    private globals: GlobalsService, 
    private clntService: ClientService,    
    private sessionService: SessionStorageService,
    private repService: ReportService,
  ){
    this.DocHeader      =  transService.InitializeDocHeader();  
    this.SelectedClient = clntService.Initialize();            
    this.DocFooter      = transService.InitializeDocFooter();
  }

  ngOnInit(){     
    setTimeout(() => { 
      this.state = '*';
    }, 0);  

    this.SetChildProperties();

    this.VouTypeName = this.globals.GetVouTypeName(this.ChildTransaction.Series.VouType.VouTypeSno);    
    this.LoadDocument();    
  }

  handleActionFromChild($event: any){     
    switch ($event.Action) {
      case 'Clear':
        this.globals.QuestionAlert("Are you sure you want to Clear this Document").subscribe(data=>{
          if (data == 1){
            this.ClearDocument(false);          
          }
        });              
        break;      

      case 'Save':
        this.SaveDocument();     
        break;

      case "iexit":
        this.actionEvent.emit("iexit");
        break;

      case "RefTransaction": 
        this.ClearDocument(true);
        if (Object.keys($event.Trans).length === 0) { return; }
        this.LoadRefDocument($event.Trans);
        break;
    }    
  }

  ClearDocument(AvoidDocHeader: boolean){    
    this.SelectedClient = this.clntService.Initialize();
    this.GridItems      = [];
    if (AvoidDocHeader == false){
      this.DocHeader      = this.transService.InitializeDocHeader();
    }
    this.DocHeader.Series.VouType.VouTypeSno = this.ChildTransaction.Series.VouType.VouTypeSno;
    this.DocFooter      = this.transService.InitializeDocFooter();
    this.ImageSource    = [];
  }

  SaveDocument(){
    if (this.ValidateInputs() == false){ return; }
    
    this.ChildTransaction.Series        = this.DocHeader.Series;
    this.ChildTransaction.Trans_No      = this.DocHeader.Trans_No;
    this.ChildTransaction.Trans_Date    = this.DocHeader.Trans_Date;
    this.ChildTransaction.Due_Date      = this.DocHeader.Due_Date!;
    this.ChildTransaction.RefSno        = this.DocHeader.Reference.TransSno;
    this.ChildTransaction.PaymentModes  = this.DocHeader.PaymentModes;

    //From Client Component Fields
    this.ChildTransaction.Client  = this.SelectedClient;

    //From Item Grid Component Fields
    this.ChildTransaction.GridItems = this.GridItems;

    //From Footer Component Fields
    this.ChildTransaction.Remarks       = this.DocFooter.Remarks;
    this.ChildTransaction.Print_Remarks = this.DocFooter.Print_Remarks;
    this.ChildTransaction.TaxPer        = this.DocFooter.TaxPer;
    this.ChildTransaction.TaxAmount     = this.DocFooter.TaxAmount;
    this.ChildTransaction.RevAmount     = this.DocFooter.RevAmount;
    this.ChildTransaction.NettAmount    = this.DocFooter.NettAmount;

    this.ChildTransaction.ImageSource   = this.ImageSource;
    //All Xmls
    this.ChildTransaction.ItemDetailXML   = this.GetItemXml();
    this.ChildTransaction.ImageDetailXML  = this.GetImageXml();
    this.ChildTransaction.PaymentModesXML = this.GetPaymentModeXml( this.ChildTransaction.PaymentModes,this.ChildTransaction.Series.VouType);

    this.transService.saveTransaction(this.ChildTransaction).subscribe(data=>{
      if (data.queryStatus == 1){
        this.globals.SnackBar("info", "Transaction saved successfully!!",1500);
        this.actionEvent.emit("iexit");
      }
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    })
    
  }

  LoadDocument(){
    //For Doc Header Component Fields
    this.DocHeader.TransSno       = this.ChildTransaction.TransSno;
    this.DocHeader.Series         = this.ChildTransaction.Series;
    this.DocHeader.Trans_No       = this.ChildTransaction.Trans_No;
    this.DocHeader.Trans_Date     = this.ChildTransaction.Trans_Date;
    this.DocHeader.Due_Date       = this.ChildTransaction.Due_Date;

    if ( (this.ChildTransaction.TransSno !== 0) && (this.ChildTransaction.RefSno !==0)){
      this.transService.getTransactions(this.ChildTransaction.RefSno,0,0,0,0).subscribe(data=>{
        this.DocHeader.Reference    = JSON.parse(data.apiData)[0];
      });
    }
    
    this.DocHeader.PaymentModes   = this.ChildTransaction.PaymentModes;
    
    //For Client Component Fields
    this.SelectedClient           = this.ChildTransaction.Client;

    //For Item Grid Component Fields
    this.GridItems                = this.ChildTransaction.GridItems;

    this.ImageSource = this.ChildTransaction.ImageSource;
    //For Footer Component Fields
    this.DocFooter.Remarks        = this.ChildTransaction.Remarks;
    this.DocFooter.Print_Remarks  = this.ChildTransaction.Print_Remarks;
    this.DocFooter.TaxPer         = this.ChildTransaction.TaxPer;
    this.DocFooter.TaxAmount      = this.ChildTransaction.TaxAmount;
    this.DocFooter.RevAmount      = this.ChildTransaction.RevAmount;
    this.DocFooter.NettAmount     = this.ChildTransaction.NettAmount;    
  }

  LoadRefDocument(Trans: TypeTransaction){
    console.log(Trans);
    
    Trans.Client = JSON.parse(Trans.Client_Json)[0];
    Trans.GridItems = JSON.parse(Trans.Items_Json);
    if (Trans.Images_Json){
      Trans.ImageSource = JSON.parse(Trans.Images_Json);
    }
    console.log(Trans);

    //For Client Component Fields
    this.SelectedClient           =  this.ChildTransaction.Client  = Trans.Client;

    //For Item Grid Component Fields
    this.GridItems                = this.ChildTransaction.GridItems = Trans.GridItems;

    this.ImageSource = this.ChildTransaction.ImageSource = Trans.ImageSource;
    //For Footer Component Fields
    this.DocFooter.Remarks        = this.ChildTransaction.Remarks = Trans.Remarks;
    this.DocFooter.Print_Remarks  = this.ChildTransaction.Print_Remarks = Trans.Print_Remarks;
    this.DocFooter.TaxPer         = this.ChildTransaction.TaxPer = Trans.TaxPer;
    this.DocFooter.TaxAmount      = this.ChildTransaction.TaxAmount = Trans.TaxAmount;
    this.DocFooter.RevAmount      = this.ChildTransaction.RevAmount = Trans.RevAmount;
    this.DocFooter.NettAmount     = this.ChildTransaction.NettAmount = Trans.NettAmount;
  }

  GetItemXml(): string{
    var StrItemXML: string = "";  
    StrItemXML = "<ROOT>"
    StrItemXML += "<Transaction>"  
    for (var i=0; i < this.GridItems.length; i++)
    {
        StrItemXML += "<Transaction_Details ";
        StrItemXML += " BarCodeSno='" + this.GridItems[i].BarCode.BarCodeSno + "' ";                 
        StrItemXML += " ItemSno='" + this.GridItems[i].Item.ItemSno + "' ";                 
        StrItemXML += " Item_Desc='" + this.GridItems[i].Item_Desc + "' ";                 
        StrItemXML += " UomSno='" + this.GridItems[i].Uom.UomSno + "' ";                 
        StrItemXML += " Karat='" + this.GridItems[i].Karat + "' ";                 
        StrItemXML += " Purity='" + this.GridItems[i].Purity + "' ";                 
        StrItemXML += " Qty='" + this.GridItems[i].Qty + "' ";             
        StrItemXML += " GrossWt='" + this.GridItems[i].GrossWt + "' ";             
        StrItemXML += " StoneWt='" + this.GridItems[i].StoneWt + "' ";             
        StrItemXML += " Wastage='" + this.GridItems[i].Wastage + "' ";             
        StrItemXML += " NettWt='" + this.GridItems[i].NettWt + "' ";             
        StrItemXML += " PureWt='" + (this.GridItems[i].Purity / 100) * this.GridItems[i].NettWt  + "' ";             
        StrItemXML += " Rate='" + this.GridItems[i].Rate + "' ";             
        StrItemXML += " Amount='" + this.GridItems[i].Amount + "' ";                     
        StrItemXML += " >";
        StrItemXML += "</Transaction_Details>";    
    }   
    StrItemXML += "</Transaction>"
    StrItemXML += "</ROOT>";

    return StrItemXML;
  }

  GetImageXml(): string{
    var StrImageXml: string = "";
    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"    
    for (var i=0; i < this.ImageSource.length; i++)
    {
      if (this.ImageSource[i].DelStatus == 0)
      {
        StrImageXml += "<Image_Details ";
        StrImageXml += " Image_Name='" + this.ImageSource[i].Image_Name + "' ";                         
        StrImageXml += " Image_Url='" + this.globals.getTransactionImagesServerPath( this.sessionService.GetCompany().CompSno, this.ChildTransaction.Series.VouType.VouTypeSno) + "' ";           
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   
    StrImageXml += "</Images>"
    StrImageXml += "</ROOT>";

    return StrImageXml;
  }
  
  GetPaymentModeXml(Pmode: TypePaymentModes[], VouType: TypeVoucherTypes):string{    
    let StrXml = "";
     Pmode.forEach((mode: TypePaymentModes)=>{
       StrXml += '<Voucher_Details ';
         StrXml += 'LedSno="' + mode.Ledger.LedSno + '" ' ;	
         switch (VouType.Cash_Type) {
           case 2:
               StrXml += 'Debit="0" ' ;
               StrXml += 'Credit="' + mode.Amount + '" ' ;	    
               break;
           case 1:
               StrXml += 'Debit="' + mode.Amount + '" ' ;
               StrXml += 'Credit="0" ' ;	    
               break;         
         }
         StrXml += 'PayRemarks="' + mode.Remarks + '" ' ;	    
       StrXml += '>';
       StrXml += '</Voucher_Details> ';
     })    
     return StrXml;		
   }

   SetChildProperties(){
    switch (this.ChildTransaction.Series.VouType.VouTypeSno) {
      case this.globals.VTypPurchaseOrder:
        this.EnableAmountCols= true;
        this.EnableBarCode = false;
        break;    
      case this.globals.VTypBuyingContract:
        this.EnableAmountCols= true;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypPurchaseOrder).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
      break;
      case this.globals.VTypRCTI:
        this.EnableAmountCols= true;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypPurchaseOrder).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
        break;
      case this.globals.VTypSalesOrder:
        this.EnableAmountCols= true;
        this.EnableBarCode = true;
      break;
      case this.globals.VTypDeliveryDoc:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypSalesOrder).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
        break;
      case this.globals.VTypSalesInvoice:
        this.EnableAmountCols= true;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypDeliveryDoc).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
      break;
      case this.globals.VTypMeltingIssue:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        break;
      case this.globals.VTypMeltingReceipt:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypMeltingIssue).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
      break;
      case this.globals.VTypRefiningIssue:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        break;
      case this.globals.VTypRefiningReceipt:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypRefiningIssue).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
      break;
      case this.globals.VTypCastingIssue:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        break;
      case this.globals.VTypCastingReceipt:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        this.repService.getPendingDocuments(this.globals.VTypCastingIssue).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
      break;
      case this.globals.VTypJobworkInward:
        this.EnableAmountCols= false;
        this.EnableBarCode = false;
        break;
      case this.globals.VTypJobworkDelivery:
        this.EnableAmountCols= false;
        this.EnableBarCode = false;
        this.repService.getPendingDocuments(this.globals.VTypJobworkInward).subscribe(data => {
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
      break;
    }
   }

   ValidateInputs(): boolean{        
    console.log(this.ChildTransaction.Client);
    
    if (!this.ChildTransaction.Client.ClientSno || this.ChildTransaction.Client.ClientSno == 0){
      this.globals.SnackBar("error", "Invalid Client details",1000);
      return false;
    }

    if (this.ChildTransaction.GridItems.length == 0){
      this.globals.SnackBar("error", "Invalid Item details",1000);
      return false;
    }

    return true;
   }
}
