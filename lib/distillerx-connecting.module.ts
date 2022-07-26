import { NgModule } from '@angular/core';
import { Store } from '@ngrx/store';
import { Distillery } from './distillery';
import { Http } from '@angular/http';

@NgModule({})
export class DistillerxConnectingModule {

	static forRoot(distillery: Distillery) {
		return {
			ngModule: DistillerxConnectingModule,
			providers: [
				{ provide: Distillery, useValue: distillery },
			],
		};
	}

	constructor(
		private store: Store<any>,
		distillery: Distillery,
		http: Http) {
		distillery.connect(store, http);
	}
}
