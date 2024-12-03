import { Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { menuTree } from './MenuTree';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { SessionStorageService } from '../../session-storage.service';
import { TypeCompanies } from '../../Types/TypeCompanies';
import { MatDialog } from '@angular/material/dialog';
import { CompaniesComponent } from '../Settings/companies/companies.component';

@Component({
    selector: 'app-header',
    imports: [RouterLink, MatMenu, MatMenuTrigger],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    animations: [
        trigger('openClose', [
            // ...
            state('open', style({
                // height: '200px',
                opacity: 1,
            })),
            state('closed', style({
                // height: '100px',
                opacity: 0.8,
            })),
            transition('open => closed', [animate('5s')]),
            transition('closed => open', [animate('2.5s')]),
        ]),
    ]
})

export class HeaderComponent {

  private subscriptionName: Subscription;
  SelectedCompany!: TypeCompanies;

  constructor(@Inject(DOCUMENT) private document: any, private router: Router, private sessionService: SessionStorageService, private dialog: MatDialog) {
    this.subscriptionName= sessionService.getCompUpdate().subscribe
    (compname => { //message contains the data sent from service            
      this.SelectedCompany = compname;
    });
  }
  
  TreeData = menuTree;

  Expanded: boolean[] = [];
  Active: boolean[] = [];
  elem: any;
  IsFullScreen: boolean = false;
  
  @ViewChild('menu1') menu1!: ElementRef;
  
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: any): void {
     if (!this.menu1.nativeElement.contains(event.target)) {
        // clicked outside => close dropdown list
        for (var a=0; a<=this.TreeData.length; a++)
          {
             this.Expanded[a] = false; 
          }  
     }
  }

  ngOnInit(){
    this.elem = document.documentElement;
    this.Active[0] = true;
    this.SelectedCompany = this.sessionService.GetCompany();
  }
  
  OpenCompanies(){
    const dialogRef = this.dialog.open(CompaniesComponent,   
      {        
        data: "", 
        height: '50%',  
        width: '50%',                  
      });      
      //dialogRef.disableClose = true;  
      dialogRef.afterClosed().subscribe(result => {             
      }); 
  }

  Expandme(menu: any, i: number){
    if (menu.Caption == "Home"){
      this.router.navigate(['dashboard']);
      return;
    }

    this.Active[i] = true;
    this.Expanded[i] = !this.Expanded[i];
    for (var a=0; a<=this.TreeData.length; a++)
      {
        if (a!==i){ this.Expanded[a] = false; }
        if (a!==i){ this.Active[a] = false; }
      }  
  }

  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
    this.IsFullScreen = true;
  }

  /* Close fullscreen */
  closeFullscreen() {    
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
    this.IsFullScreen = false;
  }
  
  Logout(){
    sessionStorage.clear();
    this.router.navigate(['']);
  }
}
