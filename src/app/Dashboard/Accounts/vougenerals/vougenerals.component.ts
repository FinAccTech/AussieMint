import { Component } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { TypeFieldInfo } from '../../../Types/TypeFieldInfo';
import { VougeneralComponent } from "./vougeneral/vougeneral.component";
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { TypeVoucherGeneral, VoucherGeneralService } from '../../Services/vougenera.service.ta';

@Component({
  selector: 'app-vougenerals',
  standalone: true,
  imports: [TableviewComponent, VougeneralComponent] ,
  templateUrl: './vougenerals.component.html',
  styleUrl: './vougenerals.component.scss',
  animations: [
      trigger('myAnimation', [
        state('void', style({ opacity: 0 })),
        state('*', style({ opacity: 1 })),
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
export class VougeneralsComponent {
 VouList: TypeVoucherGeneral[]= [];
  FieldNames: TypeFieldInfo[] = [
      {Field_Name:"#", Data_Type:"string" }, 
      {Field_Name:"Vou_No", Data_Type:"string" }, 
      {Field_Name:"Vou_Date", Data_Type:"date" }, 
      {Field_Name:"VouType_Name", Data_Type:"string" }, 
      {Field_Name:"Amount", Data_Type:"number"},       
      {Field_Name:"Actions", Data_Type:"object" }, 
    ]
  TotalFields: string[] = ["TotNettWt", "NettAmount"]
  RemoveSignal: number = 0;

  constructor(private dialog: MatDialog, private globals: GlobalsService, private vouService: VoucherGeneralService){
    
  }
 
  state = 'void';

  EntryMode: boolean = false;

  ChildVoucher!: TypeVoucherGeneral;

  FromDate: number = 0;
  ToDate: number = 0;


  ngOnInit(){    
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.LoadVoucherList();
  }

  LoadVoucherList(){
    this.vouService.getVouchersGeneral(0,this.FromDate, this.ToDate,0,0,0).subscribe(data=>{
      if (data.queryStatus == 1){
        this.VouList = JSON.parse(data.apiData);
        if (this.FromDate ==0 || this.ToDate == 0){
          this.FromDate = this.ToDate = data.ExtraData;
        }
      } 
      else{
        this.globals.ShowAlert(3,data.apiData);
      }
    }) 
  }

  AddNewTransaction(){    
    let Vou = this.vouService.InitializeVoucherGeneral();    
    this.ChildVoucher = Vou;  
    const dialogRef = this.dialog.open(VougeneralComponent, 
    {
      width: '60vw',
      height: '50vh',
      maxWidth: 'none',
      data: Vou,        
      panelClass: "dialogMat"
    });      
    dialogRef.disableClose = true; 
    dialogRef.afterClosed().subscribe(result => {        
      
      if (result) 
      { 
        // if (Sno !== 0) { return; }
        // this.ItemsList.push(result);          
      }        
    }); 
    
  }

  handleEventFromChild(event: string){
    if (event =="iexit"){
      this.EntryMode= false;
    }
    else if (event =="iexitwithchanges"){
      this.EntryMode= false;
      this.LoadVoucherList();
    }
  }
  
  OpenVoucher(Vou: TypeVoucherGeneral){           
    
    Vou.Series        = JSON.parse(Vou.Series_Json)[0];    
    Vou.PaymentModes  = JSON.parse(Vou.PaymentModes_Json); 
    Vou.Ledger        = JSON.parse(Vou.Ledger_Json)[0]; 

    console.log(Vou.Ledger);
    

    if (Vou.Images_Json){
      Vou.ImageSource   = JSON.parse(Vou.Images_Json);
    }
    else{ Vou.ImageSource = [] }
        
    this.ChildVoucher = Vou;    
    const dialogRef = this.dialog.open(VougeneralComponent, 
      {
        width: '60vw',
        height: '50vh',
        maxWidth: 'none',
        data: Vou,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          // if (Sno !== 0) { return; }
          // this.ItemsList.push(result);          
        }        
      }); 
  } 
 
  DeleteTransaction(Vou: TypeVoucherGeneral, index: number){    
    this.vouService.deleteVoucherGeneral(Vou.VouSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Voucher deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Item   

    switch ($event.Action) {
      case 1:
        this.OpenVoucher($event.Data);  
        break;
      case 2:
        this.globals.QuestionAlert("Are you sure you want to delete this Voucher").subscribe(data=>{
          if (data == 1){
            this.DeleteTransaction($event.Data,$event.Index);
            this.LoadVoucherList();
          }
        });
        break;
      case "Filter":
        this.FromDate = $event.FromDate;
        this.ToDate = $event.ToDate;
        this.LoadVoucherList();
        break;
    }
    
  }

}
