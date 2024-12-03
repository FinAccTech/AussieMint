import { Component, Inject } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProgressbroadcastService } from '../../progressbroadcast.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, HeaderComponent, RouterOutlet,],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
    subscriptionName: Subscription;
    Progress: boolean = false;

    constructor(  private progressService: ProgressbroadcastService )
               {
                  this.subscriptionName = this.progressService.getUpdate().subscribe
                          (message => { //message contains the data sent from service
                            if (message.action === "start")    {
                                this.Progress = true;
                            }
                            else if (message.action === "stop")             
                            {
                                this.Progress = false;
                            }             
                          });
              }
  
    ngOnDestroy(){
      this.subscriptionName.unsubscribe();
    }
}  
