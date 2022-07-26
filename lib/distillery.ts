import { IDistilleryActionTypes, IDistilleryOptions } from './types';
import * as combineReducers from 'combine-reducers';
import { createReducer } from './reducer-factories';
import { Barrel } from './barrel';
import { isArray, kebabCase, keyBy } from 'lodash';
import { createSelector } from 'reselect';
import { DistilleryService } from './service';
import { Blend } from './blend';

export class Distillery {
	apiService: DistilleryService;
	private _store: any;
	private _http: any;
	private barrels: Barrel[];
	private catalog = {};
	private cellar = {};
	private blendsCellar = {};
	private blends: Blend[];
	private options: IDistilleryOptions = {
		apiUrl: '/api',
		varieties: 'varieties',
		blends: 'blends',
		cellar: 'cellar',
		map: (state) => state[this.options.cellar],
	};

	constructor(options?) {
		this.options = { ...this.options, ...options };
	}

	getCellar(reducerMap: { [key: string]: any }) {
		return {
			...reducerMap,
			[this.options.cellar]: combineReducers({
				[this.options.varieties]: combineReducers({ ...this.cellar }),
				[this.options.blends]: combineReducers({ ...this.blendsCellar }),
			}),
		};
	}

	fillCellar(supply: Barrel | Barrel[]) {
		this.barrels = (isArray(supply) ? supply : [supply]) as Barrel[];
		this.barrels.forEach(barrel => this.registerBarrel(barrel));
		return this;
	}

	fillBlendMap(supply: Blend | Blend[]) {
		this.blends = (isArray(supply) ? supply : [supply]) as Blend[];
		this.blends.forEach(blend => this.registerBlend(blend));
		return this;
	}

	connect(store: any, http: any) {
		this._store = store;
		this._http = http;
		this.apiService = new DistilleryService(http, this.options.apiUrl);
		this.barrels.forEach(barrel => barrel.connect(store, http, this.apiService));
		this.blends.forEach(blend => blend.connect(store, http, this.apiService));
	}

	private registerBarrel(barrel: Barrel) {
		barrel.map = createSelector(this.options.map, (cellar) => cellar[this.options.varieties][barrel.name]);
		barrel.types = this.createActionTypes(barrel.name, this.options.varieties);
		this.cellar[barrel.name] = createReducer(barrel.types);
	}

	private registerBlend(blend: Blend) {
		blend.varietiesMap = createSelector(this.options.map, (cellar) => cellar[this.options.varieties]);
		blend.types = this.createActionTypes(blend.name, this.options.blends);
		blend.barrels = this.barrels;
		this.blendsCellar[blend.name] = createReducer(blend.types);
	}

	private createActionTypes(typeName: string, namePrefix?: string): IDistilleryActionTypes {
		return {
			GET: this.registerActionType(namePrefix, typeName, 'Get'),
			GET_SUCCESS: this.registerActionType(namePrefix, typeName, 'Get', 'Success'),
			GET_LIST: this.registerActionType(namePrefix, typeName, 'GetList'),
			GET_LIST_SUCCESS: this.registerActionType(namePrefix, typeName, 'GetList', 'Success'),
			CREATE: this.registerActionType(namePrefix, typeName, 'Create'),
			CREATE_SUCCESS: this.registerActionType(namePrefix, typeName, 'Create', 'Success'),
			REMOVE: this.registerActionType(namePrefix, typeName, 'Remove'),
			REMOVE_SUCCESS: this.registerActionType(namePrefix, typeName, 'Remove', 'Success'),
			UPDATE: this.registerActionType(namePrefix, typeName, 'Update'),
			UPDATE_SUCCESS: this.registerActionType(namePrefix, typeName, 'Update', 'Success'),
			SELECT: this.registerActionType(namePrefix, typeName, 'Select'),
			CLEAR: this.registerActionType(namePrefix, typeName, 'Clear'),
			CHANGE: this.registerActionType(namePrefix, typeName, 'Change'),
			FAILED: this.registerActionType(namePrefix, typeName, 'Failed'),
		};
	}

	private registerActionType(...strings: string[]) {
		const stringsToLower = strings.map(s => kebabCase(s));
		const remaining = stringsToLower.length > 0 ? `/${stringsToLower.join('/')}` : '';
		const full = `@distillerx${remaining}`;
		if (this.catalog[full]) {
			throw new Error(`Action type "${full}" is not unique"`);
		}
		this.catalog[full] = true;
		return full;
	}

}
