import { Observable } from 'rxjs/Observable';

export interface IDistilleryOptions {
	apiUrl: string;
	varieties?: string;
	blends?: string;
	cellar?: string;
	map?: (state: any) => any;
}

export interface IResponseMetadata {
	remaining: number;
}

export interface IResponse {
	data: any;
	metadata?: IResponseMetadata;
	errors?: any;
}

export interface ILoadingState {
	isLoading?: boolean;
	error?: any;
}

export interface IDictionary<T> {
	[key: string]: T;
}

export interface IBarrelOptions {
	local?: boolean;
	isOptimistic?: boolean;
}

export interface IBarrelService {
	format(drink: any): any;
}

export interface IBarrelSchema {
	name: string;
	url: string;
	service?: IBarrelService;
}
export interface IBlendSchema {
	name: string;
	urlTemplate: string;
	mappings: any;
}

export interface IDistilleryAction {
	type: string;
	data?: any;
}

export interface IDistilleryActionTypes {
	GET: string;
	GET_SUCCESS: string;
	GET_LIST: string;
	GET_LIST_SUCCESS: string;
	CREATE: string;
	CREATE_SUCCESS: string;
	REMOVE: string;
	REMOVE_SUCCESS: string;
	UPDATE: string;
	UPDATE_SUCCESS: string;
	SELECT: string;
	CLEAR: string;
	CHANGE: string;
	FAILED: string;
}
