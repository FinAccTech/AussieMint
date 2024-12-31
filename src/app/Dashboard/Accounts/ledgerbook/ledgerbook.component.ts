import { Component, ElementRef, ViewChild } from '@angular/core';
import { ReportService, TypeLedgerBook } from '../../Services/reports.service';
import { GlobalsService } from '../../../global.service';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';
import { LedgerService, TypeLedger } from '../../Services/ledger.service';
import { SelectionlistComponent } from '../../Widgets/selectionlist/selectionlist.component';

@Component({
  selector: 'app-ledgerbook',
  imports: [MatMenu, MatMenuTrigger, FormsModule, CommonModule, IntToDatePipe, SelectionlistComponent],
  templateUrl: './ledgerbook.component.html',
  styleUrl: './ledgerbook.component.scss'
})
export class LedgerbookComponent {
  constructor(private globals: GlobalsService, private ledService: LedgerService, private repService: ReportService){}
  
  @ViewChild('TABLE')  table!: ElementRef;
  
  FromDate: number = 0;
  ToDate: number  = 0;
  Opening_Balance: number = 0;
  Closing_Balance: number = 0;
  LedList: TypeLedger[] = [];
  SelectedLedger!: TypeLedger;  
  LedgerBooklist:       TypeLedgerBook[] = [];
      
  ngOnInit(){            
    this.LoadLedList();
    this.FromDate = this.globals.GetMonthFirstDateAsInt();
    this.ToDate = this.globals.DateToInt(new Date());

  }

  LoadLedgerBook(){
    
    this.repService.getLedgerBook(this.SelectedLedger.LedSno, this.FromDate, this.ToDate).subscribe(data=> { 
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
        return;
      }
      else{                        
        this.LedgerBooklist = JSON.parse(data.apiData.ledgerbook);    
        let prevdate = 0;
        this.LedgerBooklist.forEach(vou=>{
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

  LoadLedList(){ 
    this.ledService.getLedgers(0,0,0).subscribe(data =>{
      this.LedList = JSON.parse(data.apiData);
      this.LedList = 
      this.LedList.filter(led=>{
        return (led.Group!.GrpSno == 17 || led.Group!.GrpSno == 21) 
      })
    })
  }

  FilterLedgerBook(){
    this.LoadLedgerBook();
  }
  
  DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
  }

  getLedger($event: TypeLedger){
    this.SelectedLedger = $event;
    this.LoadLedgerBook();
  }

}
