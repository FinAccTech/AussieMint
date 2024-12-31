
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CustomHttpInterceptor } from './http-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [  { provide: HTTP_INTERCEPTORS,
    useClass: CustomHttpInterceptor,
    multi: true
},
provideHttpClient(withInterceptorsFromDi()), 
provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes, withHashLocation()),provideAnimations(), provideHttpClient(), provideAnimationsAsync(),
   ]
};


export class AppModule {}

