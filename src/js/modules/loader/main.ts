import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'zone.js';
import { LoaderModule } from './loader.module';

platformBrowserDynamic().bootstrapModule(LoaderModule);
