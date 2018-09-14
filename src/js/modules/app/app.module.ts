import { NgModule, ErrorHandler }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule }    from '@angular/http';

import { AppComponent }  from '../../components/app.component';

@NgModule({
	bootstrap: [AppComponent],
	imports: [
		BrowserModule,
		HttpModule,
		BrowserAnimationsModule
	],
	declarations: [
		AppComponent
	],
	providers: [
	]
})
export class AppModule { }
