import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { formatDate } from '@angular/common';
import { AutoUnsubscribe } from '../../auto-unsubscribe.decorator';
import { GlobalsService } from '../../global.service';
import { FileHandle } from '../../Types/file-handle';
import { TypeTransaction } from './transaction.service';
import { SessionStorageService } from '../../session-storage.service';
import { ToWords } from 'to-words';

@Injectable({
  providedIn: 'root',
})
@AutoUnsubscribe
export class VoucherprintService {

  constructor(private globals: GlobalsService,private dataService: DataService, private sessionService: SessionStorageService ) {
    
    // const toWords = new ToWords({
    //     localeCode: 'en-IN',
    //     converterOptions: {
    //       currency: true,
    //       ignoreDecimal: false,
    //       ignoreZeroCurrency: false,
    //       doNotAddOnly: false,
    //       currencyOptions: {
    //         // can be used to override defaults for the selected locale
    //         name: 'Rupee',
    //         plural: 'Rupees',
    //         symbol: '₹',
    //         fractionalUnit: {
    //           name: 'Paisa',
    //           plural: 'Paise',
    //           symbol: '',
    //         },
    //       },
    //     },
    //   });
   }

PrintVoucher(Trans: TypeTransaction, PrintStyle: string){    
 
    this.dataService.HttpGetPrintStyle(PrintStyle).subscribe(data=>{        
        let FieldSet = this.GetPrintFields(Trans);                
        let FldList = JSON.parse(data).FieldSet;        
        let Setup: TypePrintSetup = JSON.parse(data).Setup[0];        
        
        let StrHtml = '<div style="position:relative; width:100%; height:100%"; padding:0; margin:0; box-sizing: border-box;>';
    
        StrHtml += this.GetHtmlFromFieldSet(FldList, FieldSet,0,0, false);

        
        if (Setup.PrintCopy == 1){            
             StrHtml += this.GetHtmlFromFieldSet(FldList, FieldSet,Setup.CopyLeftMargin,Setup.CopyTopMargin, true);            
        }


        StrHtml += '</div>';    

        let popupWin;    
        popupWin = window.open();
        popupWin!.document.open();
        popupWin!.document.write(`
           <html> 
                  <head>
                    <style> 
                    
                        @media print {
                            .pagebreak { page-break-before: always; } /* page-break-after works, as well */
                        }

                    </style>
                  </head>
                  <body onload="window.print();window.close()">${StrHtml}</body>
                </html>`
          );
          popupWin!.document.close();        
    });

   }

GetHtmlFromFieldSet(FldList: [], FieldSet: TypePrintFields, LeftMargin: number, TopMargin: number, IsCopy: boolean): string{

    let StrHtml = ``;
    FldList.forEach((fld: any) => {    

        if ((IsCopy == true && (!fld.AvoidCopy || fld.AvoidCopy ==0))  || (IsCopy == false && (!fld.AvoidMain || fld.AvoidMain == 0) ))
        {                
            switch (fld.fldcat) {
            case "main":
                switch (fld.fldtype) {
                case "text":
                    StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; 
                        font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                            ` + fld.fldvalue  + `
                        </div>
                        `;    
                    break;
        
                case "field":
                    // StrHtml += `
                    //     <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                    //         ` + Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1] + `
                    //     </div>
                    //     `;    

                    StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin+ +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;" >
                        ` + (fld.prefix ? fld.prefix + `&nbsp;` : ``) + Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]  + (fld.suffix ? `&nbsp;` + fld.suffix   : ``) + `
                    </div>
                    `;    

                    break;
        
                case "date":
                StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                        ` + this.globals.IntToDateString (this.globals.DateToInt (new Date())) + `
                    </div>
                    `;    
                break;

                case "time":
                    StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                            ` + formatDate(new Date(), 'hh:mm:ss a', 'en-IND' ) + `
                        </div>
                        `;    
                    break;

                case "box":
                    StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border:1px solid "`+ fld.forecolor +`; >                
                    </div>
                    `;    
                    break;
        
                case "hline":
                    StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-top:1px solid "`+ fld.forecolor +`; >                
                    </div>
                    `;    
                    break;
    
                case "vline":
                StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-left:1px solid "`+ fld.forecolor +`; >                
                    </div>
                    `;    
                break;
    
                case "image":
                    StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px;">
                        <img style="width:100%; height:100%" src=" ` + Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]  + `" />
                    </div>
                    `;    
                break;
                
                case "pathimage":
                    StrHtml += `
                    <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px;"; >
                        <img style="width:100%; height:100%" src=" ` + fld.fldvalue + `" />
                    </div>
                    `;    
                break;

                case "numtoword":
                    const toWords = new ToWords();
                    let words = toWords.convert(Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]);  
                                            
                    StrHtml += `
                        <div style="position:absolute;text-wrap: wrap;width:`+ fld.width +`px; left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                            ` +  words  + `      only
                        </div>                      
                        `;    
                    break;
                        
            }
                break;
    
            case "sub":                
                let sno = 0;
                let fldMaxLength = 0;
                
                if ((fld.fldtype == "field") && (fld.alignment) && (fld.alignment == "right") ){
                    FieldSet.ItemDetails.forEach(item=>{
                        if (Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length > fldMaxLength){
                            fldMaxLength = Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length;
                        }
                    });                 
                }

                fld.top = +fld.top + TopMargin;

                
                
                FieldSet.ItemDetails.forEach(item=>{                
                    fld.top = +fld.top + fld.fontsize;        
                    sno++;
                    
                    switch (fld.fldtype) {    
                        
                        case "Sno":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + sno  + `
                            </div>
                            `;    
                        break;

                        case "text":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + fld.fldvalue  + `
                            </div>
                            `;    
                        break;
                
                        case "field":
                            let Emptyspace  = 0;
                            let StrEmptySpace: string = '';
                            if ((fld.alignment) && (fld.alignment == "right")){
                                Emptyspace = fldMaxLength - Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length;                                
                                                                
                                for (let i=0; i<=Emptyspace*2; i++){
                                    StrEmptySpace += '&nbsp;';
                                }
                            }                            
                            
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; text-align:right " >
                                ` + StrEmptySpace + Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1]  + `
                            </div>
                            `;    
                        break;
                
                        case "box":
                        StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border:1px solid "`+ fld.forecolor +`; >                
                            </div>
                            `;    
                        break;
                        
                        case "hline":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-top:1px solid "`+ fld.forecolor +`; >                
                            </div>
                            `;    
                            break;
            
                        case "vline":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-left:1px solid "`+ fld.forecolor +`; >                
                        </div>
                        `;    
                        break;
            
                        case "image":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; ">
                            <img style="width:100%; height:100%" src=" ` + fld.fldvalue + `" />
                        </div>
                        `;    
                        break;
                    }            
                    
                });
                break;
            
            case "compinfo":
                switch (fld.fldvalue.toLowerCase()) {
                    case "address1":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Address1  + `
                        </div>
                        `;    
                        break;                
                    case "address2":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Address2  + `
                        </div>
                        `;    
                        break;
                    case "address3":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Address3  + `
                        </div>
                        `;    
                        break;

                    case "city":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().City  + `
                        </div>
                        `;    
                        break;

                    case "compname":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Comp_Name  + `
                        </div>
                        `;    
                        break;

                    case "email":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Email  + `
                        </div>
                        `;    
                        break;

                    case "licenseno":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().License_No  + `
                        </div>
                        `;    
                        break;

                    case "phone":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Phone  + `
                        </div>
                        `;    
                        break;

                    case "pincode":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().Pincode  + `
                        </div>
                        `;    
                        break;
                    
                    case "state":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.sessionService.GetCompany().State  + `
                        </div>
                        `;    
                        break;
                }
            break;
            }           
        }
      });
    return StrHtml;
}

GetPrintFields(Trans: TypeTransaction){
    let PrintFields = this.IntializePrintFields();
    //console.log(Trans);
    
    PrintFields.TransSno        =  Trans.TransSno,
    PrintFields.Trans_No        =  Trans.Trans_No;
    PrintFields.Series_Name     =  Trans.Series.Series_Name;
    PrintFields.Trans_Date      =  this.globals.IntToDateString (Trans.Trans_Date);
    PrintFields.Due_Date        =  this.globals.IntToDateString (Trans.Due_Date);
    PrintFields.Reference       =  Trans.RefSno.toString();
    PrintFields.Payment_Type    =  (Trans.Payment_Type == 0 ? 'Cash' : 'Credit');
    PrintFields.Remarks         =  Trans.Remarks;
    PrintFields.Print_Remarks   =  Trans.Print_Remarks;
    PrintFields.TotQty          =  0;
    PrintFields.TotGrossWt      =  0;
    PrintFields.TotNettWt       =  0;
    PrintFields.TotAmount       =  Trans.TotAmount;
    PrintFields.TaxPer          =  Trans.TaxPer;
    PrintFields.TaxAmount       =  Trans.TaxAmount;
    PrintFields.RevAmount       =  Trans.RevAmount;
    PrintFields.NettAmount      =  Trans.NettAmount;

    
    PrintFields.ClientSno               = Trans.Client.ClientSno;
    PrintFields.Client_Code             = Trans.Client.Client_Code;
    PrintFields.Client_Name             = Trans.Client.Client_Name;
    PrintFields.Client_Address          = Trans.Client.Address;
    PrintFields.Client_Suburb           = Trans.Client.City;
    PrintFields.Client_Post_Code        = Trans.Client.Pincode;
    PrintFields.Client_State            = Trans.Client.State;
    PrintFields.Client_Mobile           = Trans.Client.Mobile;
    PrintFields.Client_Sex              = Trans.Client.Sex == 0 ? 'Male' : 'Female' ;
    PrintFields.Client_Dob              = this.globals.IntToDateString(Trans.Client.Dob);
    PrintFields.Client_Issue_Date       = this.globals.IntToDateString(Trans.Client.Issue_Date);
    PrintFields.Client_Expiry_Date      = this.globals.IntToDateString(Trans.Client.Expiry_Date);
    PrintFields.Client_Id_Number        = Trans.Client.Id_Number;
    PrintFields.Client_Director_Name    = Trans.Client.Director_Name;
    PrintFields.Client_Email            = Trans.Client.Email;
    PrintFields.Client_Gst_No           = Trans.Client.Gst_Number;
    PrintFields.Client_Remarks          = Trans.Client.Remarks;
    PrintFields.Client_Profile_Image    = Trans.Client.Profile_Image;

    if (Trans.Items_Json && Trans.Items_Json !==''){
        let itemList = JSON.parse(Trans.Items_Json);
        console.log(itemList);
        
        itemList.forEach((it:any)=>{
            PrintFields.ItemDetails.push({BarCodeSno: it.BarCodeSno,
                BarCode_Name: it.BarCode.BarCode_Name,
                ItemSno: it.Item.ItemSno,
                Item_Name: it.Item.Item_Name,
                Item_Desc: it.Item_Desc,
                Karat: it.Karat,
                Purity: it.Purity,   
                Qty: it.Qty,
                Gross_Wt: it.GrossWt,
                Stone_Wt: it.StoneWt,
                Wastage: it.Wastage,
                Nett_Wt: it.NettWt,
                UomSno: it.Uom.UomSno,
                Uom_Name: it.Uom.Uom_Name,
                Rate: it.Rate,
                Amount: it.Amount });            
        })                
    }

    if (Trans.Images_Json && Trans.Images_Json !==''){
        let imgList = JSON.parse(Trans.Images_Json);
        imgList.forEach((img:FileHandle) =>{            
            PrintFields.ItemImages. push (img);
        })
    }

    if (Trans.Client.Images_Json && Trans.Client.Images_Json !==''){
        let imgList = JSON.parse(Trans.Client.Images_Json);
        imgList.forEach((img:FileHandle) =>{
            PrintFields.Client_Images.push(img);
        })
    }
    
    return PrintFields;
   }

   IntializePrintFields(){
    let PrintFields: TypePrintFields = {
        TransSno: 0,
        Trans_No: "",
        Series_Name: "",
        Trans_Date: "",
        Due_Date: "",
        Reference: "",
        Payment_Type: "",
        Remarks: "",
        Print_Remarks: "",
        TotQty: 0,
        TotGrossWt: 0,
        TotNettWt: 0,
        TotAmount: 0,
        TaxPer: 0,
        TaxAmount: 0,
        RevAmount: 0,
        NettAmount: 0,
        ItemImages: [],
        ItemDetails: [],

        ClientSno: 0,
        Client_Code: "",
        Client_Name: "",
        Client_Address: "",
        Client_Suburb: "",
        Client_Post_Code: "",
        Client_State: "",
        Client_Mobile: "",
        Client_Sex: "",
        Client_Dob: "",
        Client_Issue_Date: "",
        Client_Expiry_Date: "",
        Client_Id_Number: "",
        Client_Director_Name: "",
        Client_Email: "",
        Client_Gst_No: "",
        Client_Remarks: "",
        Client_Profile_Image: "",
        Client_Images: [],
    }
    return PrintFields
   }
}

interface TypePrintFields {
    TransSno: number;
    Trans_No: string;
    Series_Name: string;
    Trans_Date: string;
    Due_Date: string;
    Reference: string;
    Payment_Type: string;
    Remarks: string;
    Print_Remarks: string;
    TotQty: number;
    TotGrossWt: number;
    TotNettWt: number;
    TotAmount: number;
    TaxPer: number;
    TaxAmount: number;
    RevAmount: number;
    NettAmount: number;
    ItemImages: FileHandle[];
    ItemDetails: TypeItemFields[];

    ClientSno: number;
    Client_Code: string;
    Client_Name: string;
    Client_Address: string;
    Client_Suburb: string;
    Client_Post_Code: string;
    Client_State: string;
    Client_Mobile: string;
    Client_Sex: string;
    Client_Dob: string;
    Client_Issue_Date: string;
    Client_Expiry_Date: string;
    Client_Id_Number: string;
    Client_Director_Name: string;
    Client_Email: string;
    Client_Gst_No: string;
    Client_Remarks: string;    
    Client_Profile_Image: string;
    Client_Images: FileHandle[];
}

interface TypeItemFields {
    BarCodeSno: number;
    BarCode_Name: string;    
    ItemSno: number;
    Item_Name: string;
    Item_Desc: string;
    Karat: number;
    Purity: number;    
    Qty: number;    
    Gross_Wt: string;
    Stone_Wt: string;
    Wastage: number;
    Nett_Wt: string;
    UomSno: number;
    Uom_Name: string;
    Rate: number;
    Amount: number;    
}

interface TypePrintSetup{
    LeftMargin: number;
    TopMargin: number;
    PageWidth:number;
    PageHeight: number;
    PrintCopy: number;
    CopyLeftMargin: number;
    CopyTopMargin: number;    
}