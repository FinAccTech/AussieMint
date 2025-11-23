import { Component, effect, EventEmitter, input, Output } from '@angular/core';
import { TypeDocFooter } from '../../../Types/TypeDocFooter';
import { FormsModule } from '@angular/forms';
import { NumberInputDirective } from "../../Directives/NumberInput";

@Component({
  selector: 'app-docfooter',
  imports: [FormsModule, NumberInputDirective],
  templateUrl: './docfooter.component.html',
  styleUrl: './docfooter.component.scss'
}) 
export class DocfooterComponent {
  
  DocFooter = input<TypeDocFooter>();
  EnableAmountCols  = input.required();
  EnableTaxCols     = input.required();
  AdvanceAmount     = input();
  VouTypeSno = input.required();
  
  @Output() actionEvent = new EventEmitter<any>();
  
  ClearDocument(){ 
    this.actionEvent.emit( {"Action":"Clear"});
  }

  SaveDocument(){
    this.actionEvent.emit( {"Action":"Save"});
  }
  
  SetNettPrice(){
    this.DocFooter()!.NettPrice  = this.DocFooter()!.SpotPrice - (this.DocFooter()!.SpotPrice * (this.DocFooter()!.BuyBackPrice / 100));
  }
} 
