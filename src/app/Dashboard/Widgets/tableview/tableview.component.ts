import { Component, effect, EventEmitter, Input, input, Output, signal } from '@angular/core';
import { TypeItemGroup } from '../../Services/igroup.service';
import { _isNumberValue } from '@angular/cdk/coercion';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../Pipes/search.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tableview',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchPipe],
  templateUrl: './tableview.component.html',
  styleUrl: './tableview.component.scss'
})

export class TableviewComponent {
  DataSource = input.required<any[]>();
  FieldNames  = input.required<string[]>();
  RemoveSignal = input(0);

  DataList: any[] = [];

 constructor(){
  effect(() => {
    this.DataList = this.DataSource();
    if (this.RemoveSignal() !== 0){        
      this.DataList.splice(this.RemoveSignal(),1);
    }      
  })
 }

  @Output() actionEvent = new EventEmitter<any>();
  
  // FieldNames: string[] = []
  searchText: string = "";

  ngOnInit(){
     
    // Object.keys(this.DataSource()[0]).forEach(x=>{
    //   if (!_isNumberValue(x)){
    //     this.FieldNames.push(x); 
    //   }      
    // });

    // this.FieldNames.push("Actions");
    
    
  }

 EditRecord(row: any){
  this.actionEvent.emit( {"Action":1, "Data": row});
 }

 DeleteRecord(row: any, i: number){
  this.actionEvent.emit( {"Action":2, "Data": row, "Index": i });
 }

}
