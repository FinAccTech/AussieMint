
import { Component, Inject, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ProgressbroadcastService } from '../progressbroadcast.service';

@Component({
  selector: 'app-progress',
  template: `
                <div>                        
                  <img src="assets/images/progress.gif" height="200" width="300" />                    
                </div>
            `,
  styleUrls: ['./progress.component.scss']
})

export class ProgressComponent { 
  subscriptionName: Subscription;

  constructor(  @Inject(MAT_DIALOG_DATA) public data: any,    
                public dialogRef: MatDialogRef<ProgressComponent>,
                private progressService: ProgressbroadcastService 
             )
             {
                this.subscriptionName = this.progressService.getUpdate().subscribe
                        (message => { //message contains the data sent from service
                            if (message.action === "stop")             
                            {
                              this.dialogRef.close(); 
                            }             
                        });
            }

  ngOnDestroy(){
    this.subscriptionName.unsubscribe();
  }
  
}
