import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { ReportService } from '../../Services/reports.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { FormsModule } from '@angular/forms';
import { NumberInputDirective } from '../../Directives/NumberInput';
import { TransactionService } from '../../Services/transaction.service';

@AutoUnsubscribe
@Component({
  selector: 'app-printbarcode',
  imports: [MatDialogClose, FormsModule, NumberInputDirective],
  templateUrl: './printbarcode.component.html',
  styleUrl: './printbarcode.component.scss'
})

export class PrintbarcodeComponent {

  FontSize: number = 0;
  MarginLeft: number = 0;
  MarginTop: number = 0;
  AllItemsSelected: boolean = false;


  constructor(
      public dialogRef: MatDialogRef<PrintbarcodeComponent>,
      private repService: ReportService,
      private transService: TransactionService,
      @Inject(MAT_DIALOG_DATA) public data: number,                
    )  {}

    PrintableItems: any[] = [];

    ngOnInit(){
      if (this.data !==0 && this.data)
      {
        this.repService.getBarCodesofTransaction(this.data).subscribe(data=>{          
          JSON.parse (data.apiData).forEach((bar:any)=>{
            this.PrintableItems.push({"Selected": false,"BarCode": bar.BarCode_No })
          })          

          this.transService.getBarCodeSettings().subscribe(data=>{
            const Settings = JSON.parse(data.apiData)[0];
            this.FontSize = +Settings.Font_Size;
            this.MarginLeft = +Settings.Margin_Left;
            this.MarginTop = +Settings.Margin_Top;
          })
            
        })
      }
    }

    SelectItem($event:any, index: number){
      this.PrintableItems[index].Selected  = $event.target.checked;
    }

    SelectAllItems(){
      if (this.AllItemsSelected){      
        this.AllItemsSelected = false;  
        this.PrintableItems.forEach(item=>{
          item.Selected = false;
        });
      }
      else{
        this.AllItemsSelected = true;
        this.PrintableItems.forEach(item=>{
          item.Selected = true;
        });
      }
    }

    SaveSettings(){
      this.transService.UpdateBarCodeSettings(this.FontSize, this.MarginLeft, this.MarginTop).subscribe(data=>{        
      });
    }

    PrintBarCodes(){
      
      let StrHtml = "";
        this.PrintableItems.forEach(item=>{
          if (item.Selected == true){
            StrHtml += '<div style="width: 100%; display: flex;align-items: center; justify-content: center;">';
              StrHtml += '<p style="font-family : IDAutomationHC39M Free Version; font-size:'+ this.FontSize + 'px; margin-left:' + this.MarginLeft  + 'px; margin-top:'+  this.MarginTop + 'px;"> *' + item.BarCode + '* </p> ';
            StrHtml += '</div>'
          }
        });
        console.log(StrHtml);
        

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

    }
}
