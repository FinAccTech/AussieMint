import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { ItemService, TypeItem } from '../../Services/item.service';
import { ItemComponent } from './item/item.component';
import { IGroupService } from '../../Services/igroup.service';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-items',
    imports: [TableviewComponent],
    templateUrl: './items.component.html',
    styleUrl: './items.component.scss',
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

export class ItemsComponent {

  constructor(private itemService: ItemService, private grpService: IGroupService, private dialog: MatDialog, private globals: GlobalsService) {}
  state = 'void';
  ItemsList: TypeItem[] = [];
  FieldNames: string[] = ["#", "Item_Code", "Item_Name", "Grp_Name", "Active_Status", "Actions"]
  RemoveSignal: number = 0;

  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.itemService.getItems(0,0).subscribe(data =>{
      if (data.queryStatus == 1){
        this.ItemsList = JSON.parse(data.apiData);          
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })  
  }
  
  AddNewItem(){
      this.OpenItem(this.itemService.Initialize());
  }

  OpenItem(Itm: TypeItem){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdItemItems, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Itm.ItemSno; 
    const dialogRef = this.dialog.open(ItemComponent, 
      {
        data: Itm,        
        panelClass: "dialogMat"
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.ItemsList.push(result);          
        }        
      });  
  } 

  DeleteItem(Itm: TypeItem, index: number){    
    this.itemService.deleteItem(Itm.ItemSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Item deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Item   
    if ($event.Action == 1){
      this.OpenItem($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Item
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteItem($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
