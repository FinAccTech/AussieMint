import { Directive, HostListener, HostBinding, Input, ElementRef, OnInit, OnChanges, SimpleChange, AfterViewInit } from '@angular/core';


@Directive({
  selector: '[NumberInput]',
  exportAs: 'numberInput'
})
export class NumberInputDirective {
  private _isFocus = false;

  // @Input('NumberInput') srcEvent: any;
  @Input('MaxValue') MaxValue!: any;
  @Input('Decimals') Decimals!: any;

  @HostBinding('class.is-focus')
  get isFocus() {
    return this._isFocus;
  }
  constructor(private eleRef: ElementRef) { }
 
  @HostListener('ngModelChange', ['$event']) onChange(event: any) {
    // "event" will be the value of the input
    
}

  @HostListener('focus')
  onFocus() {            
    if (this.eleRef.nativeElement.value == 0)
    {
        this.eleRef.nativeElement.value = '';
    }    
  }

  @HostListener('keyup')
  onKeyUp() {                
    
    if (this.MaxValue == 0) return;    
    if (+this.eleRef.nativeElement.value > +this.MaxValue)
    {
        this.eleRef.nativeElement.value = '';
    }    
  }

  @HostListener('change')
  onchange() {                
        
    if (this.Decimals){
      let numValue = parseFloat (this.eleRef.nativeElement.value);        
      this.eleRef.nativeElement.value = numValue.toFixed(this.Decimals);
  }     
  }

  @HostListener('blur')  
  onBlur() {
    if (this.eleRef.nativeElement.value == '')
    {
        this.eleRef.nativeElement.value = 0;
    }
    else{        
        if (this.Decimals){
            let numValue = parseFloat (this.eleRef.nativeElement.value);        
            this.eleRef.nativeElement.value = numValue.toFixed(this.Decimals);
        }        
    }
  }
  

  // @HostListener('keydown', ['$event'])
  // onKeyDown(e: any) {        
  //   if (e.key === "Enter")
  //   {
  //     const ele = e.srcElement.nextElementSibling;   
  //     if (ele == null) {
  //       return;
  //     } else {
  //       ele.focus();
  //     }
  //   }    
  // }

}