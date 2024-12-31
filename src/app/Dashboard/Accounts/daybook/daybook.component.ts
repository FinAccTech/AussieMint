import { Component, ElementRef, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { GlobalsService } from '../../../global.service';
import { ReportService, TypeLedgerBook } from '../../Services/reports.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-daybook',
  standalone: true,
  imports:[MatMenuTrigger, MatMenu, FormsModule, IntToDatePipe, CommonModule],
  templateUrl: './daybook.component.html',
  styleUrls: ['./daybook.component.scss']
})

@AutoUnsubscribe
export class DaybookComponent {
  constructor(private globals: GlobalsService, private repService: ReportService){}
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  Daybooklist:       TypeLedgerBook[] = [];
      
  ngOnInit(){    
    this.LoadDayBook(999,999);
  }

  LoadDayBook(FromDate: number, ToDate: number){
    
    this.repService.getDayBook(FromDate, ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.Daybooklist = JSON.parse(data.apiData.daybooklist);    
        let prevdate = 0;
        this.Daybooklist.forEach(vou=>{
          if (vou.Vou_Date == prevdate){            
            vou.Vou_Date = 0;            
          }
          else{
            prevdate = vou.Vou_Date;
          }
          
        })

        this.FromDate = data.apiData.FromDate;
        this.ToDate = data.apiData.ToDate;
        this.Opening_Balance = Number(data.apiData.OpenBal);
        this.Closing_Balance = Number(data.apiData.CloseBal);
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError,error);
      return;             
    });
  }

  FilterDayBook(){
    this.LoadDayBook(this.FromDate,this.ToDate);
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}


}
