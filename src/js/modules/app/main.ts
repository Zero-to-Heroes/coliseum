import { enableProdMode } from '@angular/core';
import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import { DynamicNg2Loader } from '../../services/DynamicNg2Loader.service';
import { AppComponent } from '../../components/app.component';

if (process.env.NODE_ENV === 'production') {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
		.then((ng2ModuleRef) => {
			console.log('I have a reference to the module ref and injector: ', ng2ModuleRef, ng2ModuleRef.injector);
			const ng2Loader = new DynamicNg2Loader(ng2ModuleRef.injector);
			const container = document.getElementById('externalPlayer');
			console.log('app container', container);
			ng2Loader.loadComponentAtDom(AppComponent, container);
		})
		.catch(err => console.log(err));
