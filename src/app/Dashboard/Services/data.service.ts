import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { catchError, delay, map, Observable, retry, } from 'rxjs';
import { AutoUnsubscribe } from '../../auto-unsubscribe.decorator';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';

@Injectable()
export class DelayInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(request);
    return next.handle(request).pipe(delay(5000));
  }
}

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

  HttpGetPrintStyle(printstyle: string){    
    //this.progressService.sendUpdate("start","Loading...");
    let data = this.http.get<any>("https://finaccsaas.com/AussieMint/PrintStyles/getPrintStyles.php?stylename="+ printstyle, { })
    .pipe(map(datarecd => {                      
      //this.progressService.sendUpdate("stop","");    
        return ( datarecd);                        
    }),
    );    
    return data;
  }

HttpSavePrintStyle(StyleName: string, JsonContent: string, savetype:string)
  {       
      //this.progressService.sendUpdate("start","Progress...");
      
      let postdata: string =JSON.stringify({"StyleName": StyleName, "JsonContent":JsonContent, "savetype":savetype }); 
    
      let params = new HttpParams()
      .set('data', postdata)
      
        
      let apiURL = "https://finaccsaas.com/AussieMint/PrintStyles/savePrintStyle.php";
    
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');      
      header.set("content-type", "text/html; charset=UTF-8");      
      // let data = this.http.post<any>(apiURL, params) ;
      let data = this.http.get<any>(apiURL, { params })
        .pipe(map(datarecd => {                      
        //  this.progressService.sendUpdate("stop","");    
            return ( datarecd);                        
        }),
        );      
      return data;      
  }

  HttpgetFileList(StyleName: string, JsonContent: string)
  {       
      //this.progressService.sendUpdate("start","Progress...");
      
      let postdata: string =JSON.stringify({"StyleName": StyleName, "JsonContent":JsonContent }); 
    
      let params = new HttpParams()
      .set('data', postdata)
      
        
      let apiURL = "https://finaccsaas.com/AussieMint/PrintStyles/getFilesList.php";
    
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');      
      header.set("content-type", "text/html; charset=UTF-8");      
      // let data = this.http.post<any>(apiURL, params) ;
      let data = this.http.get<any>(apiURL, { params })
        .pipe(map(datarecd => {                      
        //  this.progressService.sendUpdate("stop","");    
            return ( datarecd);                        
        }),
        );      
      return data;      
  }

  }
