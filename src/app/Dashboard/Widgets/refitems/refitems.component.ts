import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { TypeTransaction } from '../../Services/transaction.service';

@Component({
  selector: 'app-refitems',
  imports: [MatDialogClose],
  standalone : true,
  templateUrl: './refitems.component.html',
  styleUrl: './refitems.component.scss'
})


export class RefitemsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: TypeTransaction,){
    
  }

  ngOnInit(){
    
  }
}
 