import { Component, effect, EventEmitter, Input, input, Output, signal, Signal ,  } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { ClientService, TypeClient } from '../../Services/client.service';
import { SelectionlistComponent } from '../selectionlist/selectionlist.component';
import { CommonModule } from '@angular/common';

@AutoUnsubscribe
@Component({
  selector: 'app-clientcard',
  templateUrl: './clientcard.component.html',
  styleUrls: ['./clientcard.component.scss'],
  standalone: true,
  imports: [CommonModule, SelectionlistComponent, ]
})
export class ClientcardComponent {

  SelectedClient = input<TypeClient>();
  @Output() onChangedClient = new EventEmitter<TypeClient>();

  constructor(private dialog: MatDialog, private clntService: ClientService) {
    effect(() => {
        //console.log(this.SelectedClient());        
        
    })
  }
  ClientList!:      TypeClient[];
  
  ngOnInit(){ 
    this.LoadParties();            
  }

 
  LoadParties(){        
    this.clntService.getClients(0). subscribe(data => {      
      this.ClientList = JSON.parse (data.apiData);               
      this.ClientList.map(clnt=>{
        if (clnt.Images_Json){        
          clnt.ImagesSource = JSON.parse (clnt.Images_Json);
        }
      })
    });     
  }
  
  isObject(value: any): value is object { return value !== null && typeof value === 'object' && !Array.isArray(value); }

  getClient($event: TypeClient){        
    this.SelectedClient()!.ClientSno = $event.ClientSno;    
    this.SelectedClient()!.Client_Code= $event.Client_Code;
    this.SelectedClient()!.Client_Name= $event.Client_Name
    this.SelectedClient()!.Address= $event.Address;
    this.SelectedClient()!.City= $event.City;
    this.SelectedClient()!.Pincode= $event.Pincode;
    this.SelectedClient()!.State= $event.State;
    this.SelectedClient()!.Mobile= $event.Mobile;
    this.SelectedClient()!.Client_Type= $event.Client_Type;
    this.SelectedClient()!.Client_Cat= $event.Client_Cat;
    this.SelectedClient()!.Sex = $event.Sex;
    this.SelectedClient()!.Dob = $event.Dob;
    this.SelectedClient()!.Create_Date = $event.Create_Date;
    this.SelectedClient()!.Issue_Date = $event.Issue_Date;
    this.SelectedClient()!.Expiry_Date = $event.Expiry_Date;
    this.SelectedClient()!.Email = $event.Email;
    this.SelectedClient()!.Id_Number = $event.Id_Number;
    this.SelectedClient()!.Gst_Number = $event.Gst_Number;
    this.SelectedClient()!.Director_Name = $event.Director_Name;
    this.SelectedClient()!.Remarks = $event.Remarks;    
    this.SelectedClient()!.Area = $event.Area;
    this.SelectedClient()!.Blocked = $event.Blocked;
    this.SelectedClient()!.ImagesSource = $event.ImagesSource;
    this.SelectedClient()!.ImageDetailXML = $event.ImageDetailXML;
    this.SelectedClient()!.Profile_Image = $event.Profile_Image;
    this.SelectedClient()!.ImagesSource = $event.ImagesSource;
    this.SelectedClient()!.TempImage = $event.TempImage;
    this.SelectedClient()!.UserSno = $event.UserSno;
    this.SelectedClient()!.CompSno = $event.CompSno;
    this.SelectedClient()!.Name = $event.Name;
    this.SelectedClient()!.Details = $event.Details;   
    this.SelectedClient()!.Commision = $event.Commision;       
    
    this.onChangedClient.emit(this.SelectedClient());
    
  }

  getNewMaster($event: TypeClient){    
    this.LoadParties();         
  }
  
  // OpenSlider(){
  //   const dialogRef = this.dialog.open(ImagesliderComponent, 
  //     { 
  //       width:"50vw",        
  //       data: this.ClientImages , 
  //     });
      
  //     dialogRef.disableClose = true;      
  // }
 
}
