
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { AutoUnsubscribe } from '../../auto-unsubscribe.decorator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})

@AutoUnsubscribe
export class SnackbarComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SnackbarComponent>,    
    @Inject(MAT_DIALOG_DATA) public data: any,        
  ) 
  {

  }

  ngOnInit(): void {    
    
  }


  CloseDialog()  {
    this.dialogRef.close();
  }

  
}
