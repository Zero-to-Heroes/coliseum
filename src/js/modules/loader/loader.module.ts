import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ReplayLoaderComponent } from '../../components/replay-loader.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@NgModule({
	bootstrap: [ReplayLoaderComponent],
	imports: [
        BrowserModule,
        HttpClientModule,
		LoggerModule.forRoot({ 
			level: process.env.NODE_ENV === 'production' ? NgxLoggerLevel.WARN : NgxLoggerLevel.DEBUG 
        }),
	],
	declarations: [
		ReplayLoaderComponent,
    ],
	providers: [
        Location, 
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        HttpClient,
	],
	entryComponents: [
		ReplayLoaderComponent
	]
})
export class LoaderModule {
 }
