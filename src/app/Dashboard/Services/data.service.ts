import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { catchError, map, retry, } from 'rxjs';
import { AutoUnsubscribe } from '../../auto-unsubscribe.decorator';

@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class DataService {

  baseApiURL:string = "https://finaccsaas.com/AussieMint/data/RestApi.php/app";

  constructor( private http: HttpClient) { 
  
  }
    
  HandleError(error: HttpErrorResponse):any{    
  
  }

  HttpPost(PostData: any, ApiSuffix: string)
  {   
      let postdata: string =JSON.stringify(PostData);     
      let params = new HttpParams()
      .set('data', postdata)
              
      let apiURL: string = this.baseApiURL + ApiSuffix;
    
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');      
      header.set("content-type", "text/html; charset=UTF-8");      
      
      let data = this.http.get<any>(apiURL, { params })
      
        .pipe(map(datarecd => {                            
            return ( datarecd);                        
        }),        
      );      
      return data;      
  }

  HttpGet(PostData: any, ApiSuffix: string)
  {    
    //this.progressService.sendUpdate("start","Loading...");
    let DbName = sessionStorage.getItem("sessionClientDbName")!;                                             
    let postdata: string =JSON.stringify(PostData); 
    let apiURL = "";
    let params = new HttpParams()

    .set('data', postdata)    
    apiURL = this.baseApiURL + ApiSuffix;
    
    let header = new HttpHeaders();
    header.set("content-type", "charset=UTF-8");
    let data = this.http.get<any>(apiURL, { params })
        .pipe(    
          map(datarecd => {                                
            return ( datarecd);                        
        }),                
        );        
    return data;
  }

  }
