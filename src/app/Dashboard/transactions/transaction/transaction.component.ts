import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { TransactionService, TypeDocHeader, TypeTransaction } from '../../Services/transaction.service';
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
import { ReportService } from '../../Services/reports.service';
import { LedgerService, TypeLedger } from '../../Services/ledger.service';
import { ItemService, TypeItem } from '../../Services/item.service';
import { UomService } from '../../Services/uom.service';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PrintbarcodeComponent } from '../../Widgets/printbarcode/printbarcode.component';

@Component({ 
  selector: 'app-transaction',
  standalone: true,
  imports: [TitleheaderComponent, DocheaderComponent, ClientcardComponent, ItemGridComponent, DocfooterComponent, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.scss',
  animations: [
    trigger('myAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [
        animate('1000ms ease-in')
      ]),
      transition('* => void', [
        animate('1000ms ease-out')
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
  DocFooter!:       TypeDocFooter;  
  ImageSource:      FileHandle[] = [];

  EnableTaxCols:      boolean   = false;
  EnableAmountCols:   boolean   = false;
  EnablePaymentCols:  boolean   = false;
  StockSelection:     boolean   = false;
  EnableBarCode:      boolean   = false; 
  GenerateBarCode:    boolean   = false;
  NeedMoreInfo:       boolean   = true;
  PaymentModeLedgers: TypeLedger[] = [];

  @Input() ChildTransaction!:TypeTransaction;
  @Output() actionEvent = new EventEmitter<string>();

  constructor(
    private transService:   TransactionService, 
    private globals:        GlobalsService, 
    private clntService:    ClientService,    
    private sessionService: SessionStorageService,
    private repService:     ReportService,
    private ledService:     LedgerService,
    private iteService: ItemService,
    private umService: UomService,
    private dialog: MatDialog,
  ){
    this.DocHeader        = transService.InitializeDocHeader();  
    this.SelectedClient   = clntService.Initialize();                
    this.DocFooter        = transService.InitializeDocFooter();
  }

  ngOnInit(){             
    setTimeout(() => { 
      this.state = '*';
    }, 0);   
    this.SetChildProperties();
    this.VouTypeName = this.globals.GetVouTypeName(this.ChildTransaction.Series.VouType.VouTypeSno);    
    this.ledService.getPaymentModes().subscribe(data=>{
      this.PaymentModeLedgers = JSON.parse(data.apiData);
    });    
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
        switch (this.ChildTransaction.Series.VouType.VouTypeSno) {
          case this.globals.VTypBuyingContract:
            this.ClearDocument(true);     
            if (Object.keys($event.Trans).length === 0) { return; }
            this.LoadRefDocument($event.Trans);   
            break;        
          case this.globals.VTypRCTI:
            this.ClearDocument(true);     
            if (Object.keys($event.Trans).length === 0) { return; }
            this.LoadRefDocument($event.Trans);   
            break;
          case this.globals.VTypSalesInvoice:
            this.ClearDocument(true);     
            if (Object.keys($event.Trans).length === 0) { return; }
            this.LoadRefDocument($event.Trans);   
            break;
          case this.globals.VTypMeltingReceipt:
            this.LoadStandardItems(this.globals.VTypMeltingReceipt);
            break;
          case this.globals.VTypRefiningReceipt:
            this.LoadStandardItems(this.globals.VTypRefiningReceipt);
            break;
          case this.globals.VTypCastingReceipt:
            this.LoadStandardItems(this.globals.VTypCastingReceipt);
            break;
        }                
        break;
      case "BarReference":
        this.ClearDocument(true);
        if (Object.keys($event.Trans).length === 0) { return; }
        break;
      case "PrintBarCode":
        this.PrintBarCode();
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
    this.ChildTransaction.Payment_Type  = this.DocHeader.Payment_Type;
    this.ChildTransaction.Due_Date      = this.DocHeader.Due_Date!;
    this.ChildTransaction.RefSno        = this.DocHeader.Reference.TransSno;
    this.ChildTransaction.BarCodeRefSno = this.DocHeader.BarReference.RecordSno;
    this.ChildTransaction.Ref_Amount    = this.DocHeader.Ref_Amount;

    if (this.DocHeader.PaymentModes.length == 0){
      this.DocHeader.PaymentModes.push ({ PmSno:0, TransSno:0, Ledger: this.PaymentModeLedgers[0], Amount : this.DocFooter.NettAmount, Remarks:"", Trans_Type:1 })
    }
    this.ChildTransaction.PaymentModes  = this.DocHeader.PaymentModes;

    //From Client Component Fields
    this.ChildTransaction.Client  = this.SelectedClient;

    //From Item Grid Component Fields
    this.ChildTransaction.GridItems = this.GridItems;

    //From Footer Component Fields
    this.ChildTransaction.Remarks         = this.DocFooter.Remarks;
    this.ChildTransaction.Print_Remarks   = this.DocFooter.Print_Remarks;
    this.ChildTransaction.TaxPer          = this.DocFooter.TaxPer;
    this.ChildTransaction.TaxAmount       = this.DocFooter.TaxAmount;
    this.ChildTransaction.RevAmount       = this.DocFooter.RevAmount;
    this.ChildTransaction.NettAmount      = this.DocFooter.NettAmount;

    this.ChildTransaction.Doc_Balance_Amt = this.DocFooter.NettAmount - this.DocHeader.AdvanceAmount;

    this.ChildTransaction.ImageSource     = this.ImageSource;
    //All Xmls
    this.ChildTransaction.ItemDetailXML   = this.globals.GetItemXml(this.GridItems);
    this.ChildTransaction.ImageDetailXML  = this.globals.GetImageXml(this.ImageSource, this.sessionService.GetCompany().CompSno, this.ChildTransaction.Series.VouType.VouTypeSno );
    this.ChildTransaction.PaymentModesXML = this.globals.GetPaymentModeXml( this.ChildTransaction.PaymentModes,this.ChildTransaction.Series.VouType);

    this.transService.saveTransaction(this.ChildTransaction).subscribe(data=>{
      if (data.queryStatus == 1){
        this.globals.SnackBar("info", "Transaction saved successfully!!",1500);
        this.actionEvent.emit("iexitwithchanges");
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
    this.DocHeader.Payment_Type   = this.ChildTransaction.Payment_Type;
    this.DocHeader.Ref_Amount     = this.ChildTransaction.Ref_Amount;

    if ( (this.ChildTransaction.TransSno !== 0) && (this.ChildTransaction.RefSno !==0)){
      this.transService.getTransactions(this.ChildTransaction.RefSno,0,0,0,0).subscribe(data=>{
        this.DocHeader.Reference    = JSON.parse(data.apiData)[0];
      });
    } 
    
    // if ( (this.ChildTransaction.TransSno !== 0) && (this.ChildTransaction.BarCodeRefSno !==0)){
    //   this.repService.getAssayRecords(this.ChildTransaction.BarCodeRefSno).subscribe(data=>{
    //     this.DocHeader.BarReference    = JSON.parse(data.apiData)[0];
    //   });
    // }

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

    this.DocFooter.AdvanceAmount  = this.ChildTransaction.NettAmount - this.ChildTransaction.Doc_Balance_Amt;    
  }

  LoadRefDocument(Trans: TypeTransaction){       
         
    Trans.Client = JSON.parse(Trans.Client_Json)[0];
    Trans.GridItems = JSON.parse(Trans.Items_Json);
    if (Trans.Images_Json){
      Trans.ImageSource = JSON.parse(Trans.Images_Json);
    }
    else{
      Trans.ImageSource = [];
    }
    
    //For Client Component Fields
    this.SelectedClient           =  this.ChildTransaction.Client  = Trans.Client;

    //For Item Grid Component Fields
    console.log(Trans.GridItems);
    
    if (Trans.GridItems){
      this.GridItems                = this.ChildTransaction.GridItems = Trans.GridItems;
    }
    else{
      this.GridItems                = this.ChildTransaction.GridItems = [];
    }

    this.ImageSource = this.ChildTransaction.ImageSource = Trans.ImageSource;
    //For Footer Component Fields
    this.DocFooter.Remarks        = this.ChildTransaction.Remarks = Trans.Remarks;
    this.DocFooter.Print_Remarks  = this.ChildTransaction.Print_Remarks = Trans.Print_Remarks;
    this.DocFooter.TaxPer         = this.ChildTransaction.TaxPer = Trans.TaxPer;
    this.DocFooter.TaxAmount      = this.ChildTransaction.TaxAmount = Trans.TaxAmount;
    this.DocFooter.RevAmount      = this.ChildTransaction.RevAmount = Trans.RevAmount;
    this.DocFooter.NettAmount     = this.ChildTransaction.NettAmount = Trans.NettAmount;
  }

  LoadStandardItems(VouTypeSno: number){
    switch (VouTypeSno) {
      case this.globals.VTypMeltingReceipt:
        this.iteService.getStdItemByCode('MB').subscribe(data =>{
          let meltedBar: TypeItem = JSON.parse(data.apiData)[0];
          this.umService.getStdUomByCode('GMS').subscribe(data=>{
            let GmsUom = JSON.parse(data.apiData)[0];
            this.GridItems = [
              {
                BarCode:    {BarCodeSno:0, BarCode_No: ""},
                DetSno:     0,
                Item:       meltedBar,
                Item_Desc:  "",
                Karat:      0,
                Purity:     0,
                Qty:        1,
                GrossWt:    0,
                StoneWt:    0,
                Wastage:    0,
                NettWt:     0,
                Uom:        GmsUom,
                Rate:       0,
                Amount:     0,
              }
            ]
            this.ChildTransaction.GridItems = this.GridItems;
          })          
        })        
        break;
    
      case this.globals.VTypRefiningReceipt:
        this.iteService.getRefiningReceiptItems().subscribe(data =>{
          let RefineItems: TypeItem[] = JSON.parse(data.apiData);
          this.umService.getStdUomByCode('GMS').subscribe(data=>{
            let GmsUom = JSON.parse(data.apiData)[0];
            RefineItems.forEach(itm=>{

              this.GridItems.push(
                {
                  BarCode:    {BarCodeSno:0, BarCode_No: ""},
                  DetSno:     0,
                  Item:       itm,
                  Item_Desc:  "",
                  Karat:      0,
                  Purity:     0,
                  Qty:        1,
                  GrossWt:    0,
                  StoneWt:    0,
                  Wastage:    0,
                  NettWt:     0,
                  Uom:        GmsUom,
                  Rate:       0,
                  Amount:     0,
                }
              )
            })
            this.ChildTransaction.GridItems = this.GridItems;
          })          
        })       
                
      break;

      case this.globals.VTypCastingReceipt:
        this.iteService.getStdItemByCode('CB').subscribe(data =>{
          let meltedBar: TypeItem = JSON.parse(data.apiData)[0];
          this.umService.getStdUomByCode('GMS').subscribe(data=>{
            let GmsUom = JSON.parse(data.apiData)[0];
            this.GridItems = [
              {
                BarCode:    {BarCodeSno:0, BarCode_No: ""},
                DetSno:     0,
                Item:       meltedBar,
                Item_Desc:  "",
                Karat:      0,
                Purity:     0,
                Qty:        1,
                GrossWt:    0,
                StoneWt:    0,
                Wastage:    0,
                NettWt:     0,
                Uom:        GmsUom,
                Rate:       0,
                Amount:     0,
              }
            ]
            this.ChildTransaction.GridItems = this.GridItems;
          })          
        })       
        break;
    }
  }

  NewClientChanged($event: TypeClient){    
    this.DocHeader.Client = $event;
    this.GetDocHeaderRefList(this.DocHeader.Client.ClientSno);
  }
  
   ValidateInputs(): boolean{        
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

   SetChildProperties(){
    switch (this.ChildTransaction.Series.VouType.VouTypeSno) {
      case this.globals.VTypPurchaseOrder:
        this.EnableAmountCols= true;
        this.EnablePaymentCols = true;
        this.EnableBarCode = false;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypAdvancePurchase).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypGRN:        
        this.EnableBarCode = false;
        this.StockSelection = false;        
        // this.repService.getPendingDocuments(this.globals.VTypPurchaseOrder).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypBuyingContract:
        this.EnableAmountCols= true;
        this.EnablePaymentCols = true; 
        this.EnableBarCode = false;
        this.GenerateBarCode  = true;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypGRN).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypRCTI:
        this.EnableAmountCols= true;
        this.EnablePaymentCols = true;
        this.EnableBarCode = false;
        this.GenerateBarCode  = true;
        this.StockSelection = false;
        this.EnableTaxCols = true;
        // this.repService.getPendingDocuments(this.globals.VTypGRN).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
        break;

      case this.globals.VTypSalesOrder:
        this.EnableAmountCols= true;
        this.EnablePaymentCols = true;
        this.EnableBarCode = true;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypAdvanceSales).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypDeliveryDoc:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        this.StockSelection = true;
        // this.repService.getPendingDocuments(this.globals.VTypSalesOrder).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
        break;
      case this.globals.VTypSalesInvoice:
        this.EnableAmountCols= true;
        this.EnablePaymentCols = true;
        this.EnableBarCode = true;
        this.StockSelection = true;
        this.EnableTaxCols = true;
        // this.repService.getPendingDocuments(this.globals.VTypDeliveryDoc).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypMeltingIssue:
        this.EnableAmountCols= true;        
        this.EnableBarCode = true;
        this.StockSelection = true;
        break;

      case this.globals.VTypMeltingReceipt:
        this.EnableAmountCols= true;
        this.EnableBarCode = false;
        this.GenerateBarCode  = true;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypMeltingIssue).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypRefiningIssue:
        this.EnableAmountCols= true;
        this.EnableBarCode = true; 
        this.StockSelection = true;
        break;

      case this.globals.VTypRefiningReceipt:
        this.EnableAmountCols= true;
        this.EnableBarCode = false;
        this.GenerateBarCode  = true;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypRefiningIssue).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypCastingIssue:
        this.EnableAmountCols= false;
        this.EnableBarCode = true;
        this.StockSelection = true;
        break;

      case this.globals.VTypCastingReceipt:
        this.EnableAmountCols= false;
        this.EnableBarCode = false;
        this.GenerateBarCode  = true;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypCastingIssue).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;

      case this.globals.VTypJobworkInward:
        this.EnableAmountCols= true;
        this.EnableBarCode = false;
        this.StockSelection = false;
      break;

      case this.globals.VTypJobworkDelivery:
        this.EnableAmountCols= true;
        this.EnableBarCode = false;
        this.StockSelection = true;
        // this.repService.getPendingDocuments(this.globals.VTypJobworkInward).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;
 
      case this.globals.VTypLabTestingIssue:
        this.EnableAmountCols= false;
        this.EnableBarCode = false;
        this.StockSelection = true;
        this.repService.getAssayRecords(0).subscribe(data=>{
          this.DocHeader.BarRefList = JSON.parse(data.apiData);
        })
      break;

      case this.globals.VTypLabTestingReceipt:
        this.EnableAmountCols= false;
        this.EnableBarCode = false;
        this.StockSelection = false;
        // this.repService.getPendingDocuments(this.globals.VTypLabTestingIssue).subscribe(data => {
        //   this.DocHeader.RefList = JSON.parse (data.apiData);
        // })
      break;
      
    }
   }
  
   GetDocHeaderRefList(ClientSno: number){
    switch (this.ChildTransaction.Series.VouType.VouTypeSno) {
      case this.globals.VTypGRN:
        this.DocHeader.RefList = [];
        this.repService.getPendingDocuments(this.globals.VTypAdvancePurchase, ClientSno).subscribe(data => {          
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
        break;

      case this.globals.VTypBuyingContract:
        this.DocHeader.RefList = [];
        this.repService.getPendingDocuments(this.globals.VTypGRN, ClientSno).subscribe(data => {                      
            let pdList = JSON.parse (data.apiData);            
            
            this.repService.getPendingDocuments(this.globals.VTypAdvancePurchase, ClientSno).subscribe(data => {              
                let adplist = JSON.parse (data.apiData);              
                this.DocHeader.RefList = [...pdList, ...adplist];              
            })
        })
        break;

      case this.globals.VTypRCTI:
        this.DocHeader.RefList = [];
        this.repService.getPendingGrins(ClientSno).subscribe(data => {                  
          let pdList = JSON.parse (data.apiData);
          
          this.repService.getPendingDocuments(this.globals.VTypAdvancePurchase, ClientSno).subscribe(data => {              
              let adplist = JSON.parse (data.apiData);              
              this.DocHeader.RefList = [...pdList, ...adplist];              
          })
        })
        break;

      case this.globals.VTypDeliveryDoc:
        this.DocHeader.RefList = [];
        this.repService.getPendingDocuments(this.globals.VTypAdvanceSales, ClientSno).subscribe(data => {          
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
        break;

      case this.globals.VTypSalesInvoice:
        this.DocHeader.RefList = [];
        this.repService.getPendingDocuments(this.globals.VTypDeliveryDoc, ClientSno).subscribe(data => {                      
            let pdList = JSON.parse (data.apiData);
            this.repService.getPendingDocuments(this.globals.VTypAdvanceSales, ClientSno).subscribe(data => {              
                let adplist = JSON.parse (data.apiData);              
                this.DocHeader.RefList = [...pdList, ...adplist];              
            })
        })
        break;

      case this.globals.VTypMeltingReceipt:
        this.DocHeader.RefList = [];
        this.repService.getPendingDocuments(this.globals.VTypMeltingIssue, ClientSno).subscribe(data => {          
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
        break;

      case this.globals.VTypRefiningReceipt:
      this.DocHeader.RefList = [];
      this.repService.getPendingDocuments(this.globals.VTypRefiningIssue, ClientSno).subscribe(data => {          
        this.DocHeader.RefList = JSON.parse (data.apiData);
      })
      break;

      case this.globals.VTypCastingReceipt:
      this.DocHeader.RefList = [];
      this.repService.getPendingDocuments(this.globals.VTypCastingIssue, ClientSno).subscribe(data => {          
        this.DocHeader.RefList = JSON.parse (data.apiData);
      })
      break;

      case this.globals.VTypJobworkDelivery:
        this.DocHeader.RefList = [];
        this.repService.getPendingDocuments(this.globals.VTypJobworkInward, ClientSno).subscribe(data => {          
          this.DocHeader.RefList = JSON.parse (data.apiData);
        })
        break;

    }
   }

  PrintBarCode(){
      const dialogRef = this.dialog.open(PrintbarcodeComponent, 
            {
              width: '30vw',
              maxWidth: 'none',
              data: "",        
              panelClass: "dialogMat"
            });      
            dialogRef.disableClose = true; 
            dialogRef.afterClosed().subscribe(result => {        
                        
            });       
    }

}
