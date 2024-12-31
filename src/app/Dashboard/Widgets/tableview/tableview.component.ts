import { Component, effect, EventEmitter, Input, input, Output, signal } from '@angular/core';
import { TypeItemGroup } from '../../Services/igroup.service';
import { _isNumberValue } from '@angular/cdk/coercion';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../Pipes/search.pipe';
import { CommonModule } from '@angular/common';
import { MatOption, MatSelect } from '@angular/material/select';
import { TypeTransaction } from '../../Services/transaction.service';
import { GlobalsService } from '../../../global.service';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';

interface PagedData{
  PageNumber: number;
  PageData: TypeTransaction[];
}

interface TypeTotal{
  name: string;
  value: any;
}
@Component({
    selector: 'app-tableview',
    standalone: true,    
    imports: [CommonModule, FormsModule, SearchPipe, MatSelect, MatOption, IntToDatePipe],
    templateUrl: './tableview.component.html',
    styleUrl: './tableview.component.scss'
})


export class TableviewComponent { 
  DataSource  = input.required<any[]>();
  
  FieldNames  = input.required<TypeFieldInfo[]>();

  @Input() EnableDateSelection: boolean = false;
  @Input() FromDate: number = 0;
  @Input() ToDate: number = 0;
  @Input() RowsPerPage: number = 5;

  TotalFields = input<string[]>();
  Totals: number[] = [];
  TotalsArray: TypeTotal[] = [];


  RemoveSignal = input(0);

  DataList: any[] = [];
  PagedDataList: PagedData[] = [];

// For pagination and Selection
  
  TotalPages: number = 0;
  CurrentPage: number = 0;

 @Output() actionEvent = new EventEmitter<any>();

 constructor(private globals: GlobalsService){
  effect(() => {            
    this.DataList     = this.DataSource();      
    this.DoPagination();

    if (this.RemoveSignal() !== 0){        
      this.DataList.splice(this.RemoveSignal(),1);
    }      
  })
 }

  
  searchText: string = "";

  ngOnInit(){
              
  }

 EditRecord(row: any){
  this.actionEvent.emit( {"Action":1, "Data": row});
 }

 DeleteRecord(row: any, i: number){
  this.actionEvent.emit( {"Action":2, "Data": row, "Index": i });
 }

 PrintRecord(row: any, i: number){
  this.actionEvent.emit( {"Action":3, "Data": row, });
 }

 FilterRecords(){
  this.actionEvent.emit({"Action":"Filter","FromDate":this.FromDate,"ToDate":this.ToDate });
 }

 SelectRecord(row: any){
  this.actionEvent.emit( {"Action":"Select", "Data": row, });
 }

 DoPagination(){  
  this.TotalPages = Math.ceil (this.DataSource().length / this.RowsPerPage);           
  this.PagedDataList = [];
  let newPage: TypeTransaction[] = [];
  let i = 0;
  let pageNumber = 1;
  
  this.DataList.forEach(row=>{      
    if (i == this.RowsPerPage){        
      this.PagedDataList.push({PageNumber: pageNumber, PageData: newPage});
      pageNumber++;
      newPage = [];
      i=0;
    }
    newPage.push(row);            
    i++;
  })

  if (newPage.length > 0){
    this.PagedDataList.push({PageNumber: pageNumber, PageData: newPage});
  }
  this.SetTotals();
 }

 SetTotals(){  
  if (!this.PagedDataList || this.PagedDataList.length < 1  || !this.TotalFields() || this.TotalFields()!.length < 1 ){
    return;
  }

    let a = 0;
    this.TotalFields()!.forEach(fld =>{
      this.Totals[a] = 0;
      for (let i= 0; i < this.PagedDataList[this.CurrentPage].PageData.length; i++ ){      
        let row = this.PagedDataList[this.CurrentPage].PageData[i];
        let colVal = Object.entries(row).find(([key, val]) => key === fld)?.[1];     
        this.Totals[a] += +colVal;    }
      a++;
    })
    
  //Iterating through Fieldnames and checking Total field is included in that and forming a new totals array with the totals
    a = 0;
    this.TotalsArray = [];
    this.FieldNames().forEach(element=>{      
      if (this.TotalFields()!.includes(element.Field_Name) ){
        this.TotalsArray.push({name:element.Field_Name, value:  this.Totals[a].toFixed(2)  })
        a++;
      }      
      else{
        this.TotalsArray.push({name:element.Field_Name, value:"{#Total#}"})
      }       
    });
    
  //Forming a Row with the totals array as string and converting that into Json object and pushing it to DataList array
    let strarr = "{";
    this.TotalsArray.forEach(tot=>{
      strarr += '"'+tot.name+'":"'+tot.value + '", ';
    })
    strarr = strarr.substring(0, strarr.length-2);
    strarr += "}";    
    
    this.PagedDataList[this.CurrentPage].PageData.push( JSON.parse (strarr));
 }

 SetCurrentPage(type: number){
  switch (type) {
    case 1:
      if (this.CurrentPage == 0) return;
      this.CurrentPage = 0;  
      this.DoPagination();
      break;
    case 2:
      if (this.CurrentPage !==0){
        this.CurrentPage--;        
        this.DoPagination();
      }
      break;      
    case 3:
      if (this.CurrentPage !== this.TotalPages-1){
        this.CurrentPage++; 
        this.DoPagination(); 
      }      
      break;
    case 4:
      if (this.CurrentPage = this.TotalPages - 1) return;
      this.CurrentPage = this.TotalPages-1;
      this.DoPagination();
      break;    
  }
 }

 DateToInt($event: any): number{        
  return this.globals.DateToInt( new Date ($event.target.value));
}

 isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value));
}
}
