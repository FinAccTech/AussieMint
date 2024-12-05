import { Component } from '@angular/core';
import { ClientService, TypeClient } from '../../Services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { ClientComponent } from './client/client.component';
import { TableviewComponent } from '../../Widgets/tableview/tableview.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-clients',
    imports: [TableviewComponent],
    templateUrl: './clients.component.html',
    styleUrl: './clients.component.scss',
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

export class ClientsComponent {

  constructor(private clientService: ClientService, private dialog: MatDialog, private globals: GlobalsService) {}
  state = 'void';
  ClientsList: TypeClient[] = [];
  FieldNames: string[] = ["#", "Client_Code", "Client_Name", "City", 'Profile_Image', "Mobile","State", "Area_Name", "Actions"]
  RemoveSignal: number = 0;

  ngOnInit(){
    setTimeout(() => { 
      this.state = '*';
    }, 0);  
    this.clientService.getClients(0).subscribe(data =>{
      if (data.queryStatus == 1){
        this.ClientsList = JSON.parse(data.apiData);    
      }
      else{
        this.globals.SnackBar("error",data.apiData,2000);
      }        
    })  
  }
  
  AddNewClient(){
      this.OpenClient(this.clientService.Initialize());
  }

  OpenClient(Clnt: TypeClient){       
    //if (!this.globals.GetUserRight(this.auth.LoggedUserRights, this.globals.FormIdClientClients, this.globals.UserRightEdit)) { this.globals.SnackBar("error", "You are not authorized for this operation."); return; }     
    let Sno = Clnt.ClientSno; 
    const dialogRef = this.dialog.open(ClientComponent, 
      {
        panelClass:['rightdialogMat'],        
        position:{"right":"0","top":"0" },              
        maxWidth: 'none',        
        data: Clnt,                
      });      

      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (Sno !== 0) { return; }
          this.ClientsList.push(result);          
        }        
      });  
  } 

  DeleteClient(Clnt: TypeClient, index: number){    
    this.clientService.deleteClient(Clnt.ClientSno).subscribe(data=>{
      if (data.queryStatus == 1){        
        this.RemoveSignal = index;
        this.globals.SnackBar("info", "Client deleted Successfully", 1500);
      }
      else{
        this.globals.SnackBar("error", data.apiData, 1500);
      }
    })
  }

  handleActionFromTable($event: any){ 
    //Open Client   
    if ($event.Action == 1){
      this.OpenClient($event.Data);
    }
    else if ($event.Action == 2){
      //Delete Client
      this.globals.QuestionAlert("Are you sure you want to delete this Record").subscribe(data=>{
        if (data == 1){
          this.DeleteClient($event.Data,$event.Index);
        }
      });
      
    }
  }
  
}
