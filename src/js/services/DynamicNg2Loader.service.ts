import { ApplicationRef, ComponentFactoryResolver, NgZone, Injector, Type, ComponentRef } from '@angular/core';

export class DynamicNg2Loader {
	private appRef: ApplicationRef;
	private componentFactoryResolver: ComponentFactoryResolver;
	private zone: NgZone;

	constructor(private injector: Injector) {
		this.appRef = injector.get(ApplicationRef);
		this.zone = injector.get(NgZone);
		this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
	}

	loadComponentAtDom<T>(component: Type<T>, dom: Element, onInit?: (component: T) => void): ComponentRef<T> {
		let componentRef: ComponentRef<T>;
		this.zone.run(() => {
			try {
				const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
				componentRef = componentFactory.create(this.injector, [], dom);
				if (onInit) {
					onInit(componentRef.instance);
				}
				this.appRef.attachView(componentRef.hostView);
			} catch (e) {
				console.error('Unable to load component', component, 'at', dom);
				throw e;
			}
		});
		return componentRef;
	}
}
