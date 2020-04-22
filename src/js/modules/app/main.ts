import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'zone.js';
import { AppComponent } from '../../components/app.component';
import { DynamicNg2Loader } from '../../services/DynamicNg2Loader.service';
import { AppModule } from './app.module';

console.log('starting coliseum boostrap');

if (process.env.NODE_ENV === 'production') {
	enableProdMode();
}

let ng2Loader;
platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.then(ng2ModuleRef => {
		ng2Loader = new DynamicNg2Loader(ng2ModuleRef.injector);
		const container = document.getElementById('externalPlayer');
		if (!container) {
			console.log(
				'container not present yet, wont retry. Please manually inject the replay viewer by calling window.coliseum.init()',
			);
			return;
		}
		ng2Loader.loadComponentAtDom(AppComponent, container);
	})
	.catch(err => console.log(err));

const initInternal = callback => {
	try {
		const container = document.getElementById('externalPlayer');
		if (!container) {
			console.warn('container not present yet, retrying');
			setTimeout(() => initInternal(callback), 1000);
			return;
		}
		callback(container);
	} catch (e) {
		console.error('[main] Exception in initInternal', e);
	}
};

const initColiseum = async () => {
	console.log('request to manually inject coliseum');
	return new Promise<void>((resolve, reject) => {
		initInternal(container => {
			ng2Loader.loadComponentAtDom(AppComponent, container);
			resolve();
		});
	});
};

const existingColiseum = window['coliseum'] || {};
window['coliseum'] = Object.assign(existingColiseum, {
	init: initColiseum,
});
