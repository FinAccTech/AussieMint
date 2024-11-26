import { Component, effect, input, model, signal } from '@angular/core';
import { SelectionlistComponent } from "../selectionlist/selectionlist.component";
import { CommonModule } from '@angular/common';
import { TransactionService, TypeDocHeader } from '../../Services/transaction.service';
import { FormsModule } from '@angular/forms';
import { TypeVoucherSeries, TypeVoucherTypes, VoucherSeriesService } from '../../Services/vouseries.service';
import { GlobalsService } from '../../../global.service';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';

@Component({
  selector: 'app-docheader',
  standalone: true,
  imports: [ CommonModule, SelectionlistComponent, FormsModule, IntToDatePipe],
  templateUrl: './docheader.component.html',
  styleUrl: './docheader.component.scss'
})

export class DocheaderComponent {
  
  DocHeader = input<TypeDocHeader>(); //For Input
  SeriesList: TypeVoucherSeries[]= [];

  //modelDocHeader = model<TypeDocHeader>();  //For Output
  // DocHeader!: TypeDocHeader;
  
  constructor(private transService: TransactionService, private serService: VoucherSeriesService, private globals: GlobalsService){    
    effect(() =>{
       console.log(this.DocHeader());    
    })    
  }
  

  ngOnInit(){  
    this.serService.getVoucherSeries(0, this.DocHeader()!.Series.VouType.VouTypeSno ).subscribe(data=>{
      this.SeriesList = JSON.parse(data.apiData);  
      if (this.DocHeader()!.TransSno == 0){
        //this.getSeries(this.SeriesList[0]);      
      }
      
    })  
  }
  

  getSeries($event: TypeVoucherSeries){
    this.DocHeader()!.Series = $event;    
  }
  
  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
}
 