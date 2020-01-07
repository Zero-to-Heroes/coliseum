import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ReplayLoaderComponent } from '../../components/replay-loader.component';

// init({
// 	dsn: 'https://fe35eae785af4971a767bc8d4c1fe791@sentry.io/1532731',
// 	enabled: process.env.NODE_ENV === 'production',
// 	release: process.env.APP_VERSION,
// });

@NgModule({
	bootstrap: [ReplayLoaderComponent],
	imports: [
		BrowserModule,
		HttpClientModule,
		LoggerModule.forRoot({
			level: NgxLoggerLevel.WARN,
		}),
	],
	declarations: [ReplayLoaderComponent],
	providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }, HttpClient],
	entryComponents: [ReplayLoaderComponent],
})
export class LoaderModule {}
