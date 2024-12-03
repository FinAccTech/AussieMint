import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Location           } from '@angular/common';

@Component({
  selector: 'app-titleheader',
  imports: [],
  templateUrl: './titleheader.component.html',
  styleUrl: './titleheader.component.scss'
})

export class TitleheaderComponent {
  @Input() Title: string = "";

  constructor(private location: Location ){

  }
  
  @Output() actionEvent = new EventEmitter<any>();

  GoBack(){
    this.location.back();
  }

  ClearDocument(){
    this.actionEvent.emit( {"Action":"Clear"});
  }

  SaveDocument(){
    this.actionEvent.emit( {"Action":"Save"});
  }

  CloseDocument(){
    this.actionEvent.emit({"Action":"iexit"});
  }
}
