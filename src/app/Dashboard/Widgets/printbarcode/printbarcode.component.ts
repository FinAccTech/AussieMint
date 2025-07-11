import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { ReportService } from '../../Services/reports.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';

@AutoUnsubscribe
@Component({
  selector: 'app-printbarcode',
  imports: [MatDialogClose],
  templateUrl: './printbarcode.component.html',
  styleUrl: './printbarcode.component.scss'
})

export class PrintbarcodeComponent {

  constructor(
      public dialogRef: MatDialogRef<PrintbarcodeComponent>,
      private repService: ReportService,
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
        })
      }
    }

    SelectItem($event:any, index: number){
      this.PrintableItems[index].Selected  = $event.target.checked;
    }

    PrintBarCodes(){
      console.log(this.PrintableItems);
      let StrHtml = "";
        this.PrintableItems.forEach(item=>{
          if (item.Selected == true){
            StrHtml += '<p style="font-family : IDAutomationHC39M Free Version"> *' + item.BarCode + '* </p> ';
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
