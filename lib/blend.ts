import { IBlendSchema, IDistilleryActionTypes } from './types';
import { DistilleryService } from './service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import { isArray } from 'lodash';
import { Barrel } from './barrel';
import * as actionCreators from './action-creators';
import { createSelector } from 'reselect';

export class Blend {
	types: IDistilleryActionTypes;
	barrels: Barrel[];

	private _apiService: DistilleryService;
	private _store: any;
	private _http: any;
	private _varietiesMap: (state: any) => any;

	get name() { return this.schema.name; }

	set varietiesMap(varietiesMap) { this._varietiesMap = varietiesMap; }

	constructor(private schema: IBlendSchema) {}

	connect(store: any, http: any, apiService: DistilleryService) {
		this._store = store;
		this._http = http;
		this._apiService = apiService;
	}

	// TODO [?] make view to be saved in store
	get(params: any = {}, options: any = {}) {
		return this._apiService.getView(this.schema.urlTemplate, params)
			.take(1)
			.switchMap((result) => {
				const data = result.data;
				const mappings = this.schema.mappings;
				return this.processViewMappings(mappings, data);
			});
	}

	private processViewMappings(mappings: any, data: any): Observable<any> {
		const selectors = [];
		if (isArray(mappings)) {
			mappings.forEach((mapping) => {
				selectors.push(this.processViewMapping(mapping, data));
			});
		} else {
			selectors.push(this.processViewMapping(mappings, data));
		}
		const observables = selectors.map(selector => this._store.select(selector));
		return Observable.combineLatest(observables);
	}

	private processViewMapping(mapping, data) {
		const from = mapping.from || mapping;
		const barrel: Barrel = mapping.to || from;
		const fromProp = typeof from === 'string' ? from : from.name;
		const collection = isArray(data) ? data : data[fromProp];
		let entities = isArray(collection) ? collection : [collection];
		entities = barrel.format(entities);
		const ids = entities.map(entity => entity.id.toString());
		this._store.dispatch(actionCreators.getListSuccess(barrel.types, { data: entities }));
		return createSelector(this._varietiesMap, (varietiesDomain) => {
			const list = varietiesDomain[barrel.name].dictionary;
			return Object.keys(list).filter(id => ids.includes(id)).map(id => list[id]);
		});
	}
}
