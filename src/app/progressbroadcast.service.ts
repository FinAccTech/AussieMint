import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { AutoUnsubscribe } from './auto-unsubscribe.decorator';
import { ProgressComponent } from './Progress/progress.component';

@Injectable({
  providedIn: 'root'
})
@AutoUnsubscribe
export class ProgressbroadcastService {

  constructor(private dialog: MatDialog) { }

  private subjectName = new Subject<any>(); //need to create a subject
    
  sendUpdate(action: string, text: string) { //the component that wants to update something, calls this fn    
      this.subjectName.next({action: action }); //next() will feed the value in Subject            
      if (action === "start")
      {
        this.StartProgress(text);
      }      
  }

  getUpdate(): Observable<any> { //the receiver component calls this function 
      return this.subjectName.asObservable(); //it returns as an observable to which the receiver funtion will subscribe
  }

  StartProgress(text: string){
    const dialogRef = this.dialog.open(ProgressComponent, 
      {
        hasBackdrop: false,
        data: {text},
      });      
      dialogRef.disableClose = true; 
  }
}



