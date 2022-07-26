import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/take';
import { IBarrelOptions, IBarrelSchema, IDistilleryActionTypes } from './types';
import { isNil, isArray, values } from 'lodash';
import * as actionCreators from './action-creators';
import { DistilleryService } from './service';
import { v4 } from 'uuid';
import { undo } from './action-creators';
import { createSelector } from 'reselect';

export class Barrel {
	types: IDistilleryActionTypes;
	private _apiService: DistilleryService;
	private _store: any;
	private _http: any;
	private _map: (state: any) => any;

	get name() { return this.schema.name; }

	set map(map: any) { this._map = map; }

	constructor(private schema: IBarrelSchema) { }

	connect(store: any, http: any, apiService: DistilleryService) {
		this._store = store;
		this._http = http;
		this._apiService = apiService;
	}

	getById(id: string, options: IBarrelOptions = {}) {
		const selector = createSelector(this._map, (map: any) => map.dictionary[id]);
		this.make('get', null, [id], options).subscribe(() => { });
		return this._store.select(selector);
	}

	find(filter: any = {}, options: IBarrelOptions = {}) {
		if (!options.local) {
			this.make('getList', filter, [], options).subscribe(() => { });
		}
		const filterKeys = Object.keys(filter);
		const selector = createSelector(this._map, (map: any) => map.dictionary);
		return this._store.select(selector)
			.map(values)
			.map((list: any[]) => list.filter((item: any) =>
				!filterKeys.find((key: any) => item[key] !== filter[key])));
	}

	create(data: any, options: IBarrelOptions = {}) {
		options = this.buildOptions(options, { isOptimistic: true });
		const dataToSend = { ...data, id: v4() };
		if (!options.local) {
			return this.make('create', null, [dataToSend], options);
		}
	}

	remove(id: string, options: IBarrelOptions = {}) {
		options = this.buildOptions(options, { isOptimistic: true });
		if (!options.local) {
			return this.make('remove', null, [id], options);
		}
	}

	update(id: string, data: any, options: IBarrelOptions = {}) {
		options = this.buildOptions(options, { isOptimistic: true });
		if (!options.local) {
			return this.make('update', null, [id, data], options);
		} else {
			const successResponseDataImitation = { data: { id, ...data } };
			const successAction = actionCreators.updateSuccess(this.types, successResponseDataImitation);
			this._store.dispatch(successAction);
			return Observable.of(successResponseDataImitation.data).take(1);
		}
	}

	getState() {
		const selector = createSelector(this._map, map => map.loadingStates.global);
		return this._store.select(selector);
	}

	getStateById(id: string) {
		const selector = createSelector(this._map, map => map.loadingStates.byId[id]);
		return this._store.select(selector);
	}

	format(data: any) {
		const service = this.schema.service;
		if (service && service.format) {
			return isArray(data) ? data.map(service.format) : service.format(data);
		}
		return data;
	}

	private make(methodName: string, filter: any, data: any[], options: any = {}) {
		const successActionName = `${methodName}Success`;
		const startAction = (actionCreators as any)[methodName](this.types, ...data);
		const successResponseDataImitation = {
			data: startAction.data,
		};
		const successAction = (actionCreators as any)[successActionName](this.types, successResponseDataImitation);
		if (options.isOptimistic) {
			this._store.dispatch(successAction);
		} else {
			this._store.dispatch(startAction);
		}

		const isCreating = methodName === 'create';
		// remove and preserve id prop from data, because id is faked
		let _id;
		if (isCreating) {
			const { id, ...rest } = data[0];
			_id = id;
			data[0] = rest;
		}
		const url = this.schema.url || this.schema.name;
		const serviceObs = this._apiService[methodName](url, ...data, filter)
			.take(1)
			.map((result: any) => {
				result.data = this.format(result.data);
				return result;
			})
			.do((result: any) => {
				if (isCreating || !options.isOptimistic) {
					if (isCreating) {
						result._id = _id;
					}
					const realSuccessAction = (actionCreators as any)[successActionName](this.types, result);
					this._store.dispatch(realSuccessAction);
				}
			})
			.catch((error: Error) => {
				if (options.isOptimistic) {
					this._store.dispatch(undo(successAction));
				}
				const errorData = {
					data: {
						id: startAction.data.id,
					},
					message: error.message,
				};
				this._store.dispatch(actionCreators.failed(this.types, errorData));
				throw error;
			});
		if (options.isOptimistic) {
			serviceObs.subscribe(() => { });
		}
		return options.isOptimistic ? Observable.of(successAction.data) : serviceObs;
	}

	private buildOptions(options: IBarrelOptions, defaultMap) {
		const result = options = { ...options };
		if (!defaultMap) return result;
		return Object.keys(defaultMap).reduce((memo, key) => {
			memo[key] = this.byDefault(memo[key], defaultMap[key]);
			return memo;
		}, options);
	}

	private byDefault(value, defaultValue) {
		return isNil(value) ? defaultValue : value;
	}

}
