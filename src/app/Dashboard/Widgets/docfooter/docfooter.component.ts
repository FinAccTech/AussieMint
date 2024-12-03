import { Component, effect, EventEmitter, input, Output } from '@angular/core';
import { TypeDocFooter } from '../../../Types/TypeDocFooter';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-docfooter',
  imports: [FormsModule],
  templateUrl: './docfooter.component.html',
  styleUrl: './docfooter.component.scss'
})
export class DocfooterComponent {
  
  DocFooter = input<TypeDocFooter>();
  EnableAmountCols = input.required();

  @Output() actionEvent = new EventEmitter<any>();
  
  ClearDocument(){
    this.actionEvent.emit( {"Action":"Clear"});
  }

  SaveDocument(){
    this.actionEvent.emit( {"Action":"Save"});
  }
  
}
