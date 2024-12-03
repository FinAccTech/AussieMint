import { Component, Inject } from '@angular/core';
import { ClientService, TypeClient } from '../../../Services/client.service';
import { FileHandle } from '../../../../Types/file-handle';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../../global.service';
import { AreaService } from '../../../Services/area.service';
import { ImagesComponent } from '../../../Widgets/images/images.component';
import { WebcamComponent } from '../../../Widgets/webcam/webcam.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { IntToDatePipe } from '../../../../Pipes/int-to-date.pipe';
import { SessionStorageService } from '../../../../session-storage.service';

@Component({
    selector: 'app-client',
    imports: [CommonModule, FormsModule, MatSelect, MatOption, MatTab, MatTabGroup, IntToDatePipe, MatDialogClose],
    templateUrl: './client.component.html',
    styleUrl: './client.component.scss'
})

export class ClientComponent {
    
  Client!:         TypeClient;    
      
  // For Validations  
  ClientNameValid: boolean = true;
  MobNumberValid: boolean = true;
  CodeAutoGen: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ClientComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeClient,        
    private globals: GlobalsService,
    private clientService: ClientService,
    private areaService: AreaService,
    private sessionService: SessionStorageService
  ) 
  {
    this.Client = data;          
  } 

  ngOnInit(): void {                        
    if (this.sessionService.GetAppSetup().ClientCode_AutoGen == 1){         
      if (this.Client.ClientSno == 0){      
        this.CodeAutoGen = true;
        this.Client.Client_Code="AUTO";
      }
      else{                
        if(this.Client.Images_Json){        
          this.Client.ImagesSource =  JSON.parse(this.Client.Images_Json);        
        }
        else{
          this.Client.ImagesSource = [];
        }
      }
    }    
  }

  SaveClient(){            

    if (this.ValidateInputs() == false) {return};    
    
    var StrImageXml: string = "";

    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"
    
    for (var i=0; i < this.Client.ImagesSource!.length; i++)
    {
      if (this.Client.ImagesSource![i].DelStatus == 0)
      {
        StrImageXml += "<Image_Details ";
        StrImageXml += " Image_Name='" + this.Client.ImagesSource![i].Image_Name + "' ";                 
        StrImageXml += " Image_Url='" + this.globals.getClientImagesServerPath(this.sessionService.GetCompany().CompSno) + "' ";             
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }      
    }   

    StrImageXml += "</Images>" 
    StrImageXml += "</ROOT>"

    this.Client.ImageDetailXML = StrImageXml;
    this.Client.ImagesSource = this.Client.ImagesSource;
    
    // if (pty.Client.TempImage){
    //   pty.Client.TempImage = this.TransImages[0].Image_File;
    // }

    this.clientService.saveClient(this.Client).subscribe(data => {            
      
        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          this.Client.ClientSno = data.RetSno;
          this.globals.SnackBar("info", this.Client.ClientSno == 0 ? "Client Created successfully" : "Client updated successfully",1500);          
          this.CloseDialog(this.Client);
        }
    },  
    error => {      
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  CloseDialog(pty: TypeClient)  {
    this.dialogRef.close(pty); 
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }

  ValidateInputs(): boolean{           
    if (!this.Client.Client_Name!.length )  { this.ClientNameValid = false;  return false; }  else  {this.ClientNameValid = true; }        
    // if (!this.Client.Mobile || this.Client.Mobile!.length < 10)  { this.MobNumberValid = false;  return false; }  else  {this.MobNumberValid = true; }        
    return true;
  }
  
  OpenImagesCreation(){
    var img = this.Client.ImagesSource; 

    const dialogRef = this.dialog.open(ImagesComponent, 
      { 
        width:"70vw",
        height:"60vh",        
        maxWidth: 'none',        
        data: {img}, 
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {
        if (result){
          this.Client.ImagesSource = result;
        }         
      }); 
  }

  
  selectFile($event: any)
  { 
    if ($event.target.files)
    {      
        const file = $event?.target.files[0];        
        var reader = new FileReader();
        reader.readAsDataURL($event.target.files[0]);
        reader.onload = (event: any) => {
          const fileHandle: FileHandle ={
            Image_Name: file.name,
            Image_File: event.target.result,             
            Image_Url: this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(file),              
            ),
            SrcType:0,
            DelStatus:0
          };          
          this.Client.ImagesSource![0] = (fileHandle);    
        }
      
    }    
    
  }

  RemoveProfileImage(){  
    this.Client.ImagesSource![0].Image_File = null!;
    this.Client.ImagesSource![0].Image_Url = "";
    this.Client.ImagesSource![0].SrcType = 2;
    this.Client.ImagesSource!.splice(0,1);    
  }
  
  OpenWebCam(){        
    const dialogRef = this.dialog.open(WebcamComponent, 
      {
        // width:"45vw",
        // height:"100vh",
        // position:{"right":"0","top":"0" },
        data: "",
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
            this.Client.ImagesSource = result;
        }        
      });      
  } 
}
