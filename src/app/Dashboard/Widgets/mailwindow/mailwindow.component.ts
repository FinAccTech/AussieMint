import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { TransactionService, TypeTransaction } from '../../Services/transaction.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mailwindow',
  imports: [FormsModule, MatDialogClose],
  templateUrl: './mailwindow.component.html',
  styleUrl: './mailwindow.component.scss'
})

export class MailwindowComponent { 

  ClientEmail: string = "";
  InvalidEmail: boolean = false;

  constructor(public dialogRef: MatDialogRef<MailwindowComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: TypeTransaction,
    private transService: TransactionService
  ){
    
  }

  ngOnInit(){
    this.ClientEmail = JSON.parse(this.data.Client_Json)[0].Email;
  }

  SendEmail(){
    if (this.isValidEmail(this.ClientEmail) == false){
      this.InvalidEmail = true;
      return;
    }
    this.transService.mailDocument(1,this.ClientEmail).subscribe(data =>{
      console.log(data);      
    })
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  
}
