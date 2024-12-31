import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TypeClient } from '../../Services/client.service';
import { ReportService } from '../../Services/reports.service';
import { TypeTransaction } from '../../Services/transaction.service';
import { CommonModule } from '@angular/common';
import { GlobalsService } from '../../../global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientprofile',
  imports: [MatDialogClose, CommonModule],
  templateUrl: './clientprofile.component.html',
  styleUrl: './clientprofile.component.scss'
})
export class ClientprofileComponent {
  constructor(public dialogRef: MatDialogRef<ClientprofileComponent>,
    private globals: GlobalsService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: TypeClient,
    private repService: ReportService
  ){ }

  PendingList: TypeTransaction[] = [];

  ngOnInit(){
    this.repService.getPendingDocuments(0,this.data.ClientSno).subscribe(data=>{
      this.PendingList = JSON.parse(data.apiData);
      this.PendingList.map(trans=>{
        trans.Series = JSON.parse(trans.Series_Json)[0];
      })      
      
    })
  }

  OpenDocument(vouTypeSno: number){
    switch (vouTypeSno) {
      case this.globals.VTypAdvancePurchase:
          this.router.navigate(['dashboard/transactions/'+ this.globals.VTypGRN]);
          this.dialogRef.close();
        break;
      case this.globals.VTypGRN:
          this.router.navigate(['dashboard/transactions/'+ this.globals.VTypBuyingContract]);
          this.dialogRef.close();
        break;
      case this.globals.VTypDeliveryDoc:
        this.router.navigate(['dashboard/transactions/'+ this.globals.VTypSalesInvoice]);
        this.dialogRef.close();
      break;
    }
  }
}
 