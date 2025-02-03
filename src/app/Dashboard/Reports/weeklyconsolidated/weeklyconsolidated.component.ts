import { Component, input } from '@angular/core';
import { GlobalsService } from '../../../global.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { TypeTransaction } from '../../Services/transaction.service';
import { ReportService } from '../../Services/reports.service';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';

@Component({
  selector: 'app-weeklyconsolidated',
  imports: [MatSelect, MatOption, TableviewComponent, CommonModule, FormsModule, IntToDatePipe],
  templateUrl: './weeklyconsolidated.component.html',
  styleUrl: './weeklyconsolidated.component.scss',
  animations: [
    trigger('myAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: .9 })),
      transition('void => *', [
        animate('1000ms ease-in')
      ]),
      transition('* => void', [
        animate('1000ms ease-out')
      ])
    ])
  ]
})
@AutoUnsubscribe 
export class WeeklyconsolidatedComponent {
  VouTypeSno: number = 0;
  VouTypeName: string = "";
  TransList: any[] = [];
  
  FromDate: number = 0;
  ToDate: number = 0;

  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"WeekStartDate", Data_Type:"date" }, 
    {Field_Name:"WeekEndDate", Data_Type:"date" },     
    {Field_Name:"Count", Data_Type:"number" },     
    {Field_Name:"NettAmount", Data_Type:"number" }, 
  ]
  
  TotalFields: string[] = ["Count", "NettAmount"]
  
  constructor(private globals: GlobalsService, private repService: ReportService ) {}
  state = 'void';
  
  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.VouTypeSno = 11;
    let newDate = new Date();          
    this.FromDate =  this.globals.DateToInt (new Date((newDate.getMonth() == 0 ? newDate.getFullYear() -1 :newDate.getFullYear()).toString() +  '/' + (newDate.getMonth() == 0 ? 12 : newDate.getMonth()).toString() + "/" + newDate.getDate().toString()));          
    this.ToDate = this.globals.DateToInt (new Date());
    this.GenerateWeeklyreport();
  }

  GenerateWeeklyreport(){        
    this.VouTypeName = this.globals.GetVouTypeName(this.VouTypeSno);
    this.repService.getWeeklyConsolidated( this.FromDate, this.ToDate, this.VouTypeSno).subscribe(data =>{      
      this.TransList = JSON.parse(data.apiData);
      console.log(this.TransList);
      
    })
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

}
