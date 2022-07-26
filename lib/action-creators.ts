import { IDistilleryAction, IDistilleryActionTypes, IResponse } from './types';

export const get = (types: IDistilleryActionTypes, id: any): IDistilleryAction => {
	const data = id;
	return { type: types.GET, data };
};

export const getSuccess = (types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
	return { type: types.GET_SUCCESS, data };
};

export const getList = (types: IDistilleryActionTypes): IDistilleryAction => {
	return { type: types.GET_LIST };
};

export const getListSuccess = (types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
	return { type: types.GET_LIST_SUCCESS, data };
};

export const failed = (types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
	return { type: types.FAILED, data };
};

export const create = (types: IDistilleryActionTypes, entity: any): IDistilleryAction => {
	const data = entity;
	return { type: types.CREATE, data };
};

export const createSuccess = (types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
	return { type: types.CREATE_SUCCESS, data };
};

export const update = (types: IDistilleryActionTypes, id: any, what: any): IDistilleryAction => {
	const data = { id, ...what };
	return { type: types.UPDATE, data };
};

export const updateSuccess = (types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
	return { type: types.UPDATE_SUCCESS, data };
};

export const remove = (types: IDistilleryActionTypes, id: any): IDistilleryAction => {
	const data = { id };
	return { type: types.REMOVE, data };
};

export const removeSuccess = (types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
	return { type: types.REMOVE_SUCCESS, data };
};

export const change = (types: IDistilleryActionTypes, data: any | any[]): IDistilleryAction => {
	return { type: types.CHANGE, data };
};

export const select = (types: IDistilleryActionTypes, id: any): IDistilleryAction => {
	const data = id;
	return { type: types.SELECT, data };
};

export const clear = (types: IDistilleryActionTypes): IDistilleryAction => {
	return { type: types.CLEAR };
};

export const UNDO_ACTION = 'UNDO_ACTION';

export const undo = (action: any) => {
	return {type: UNDO_ACTION, data: action};
};
// export const //  = getView(types: IDistilleryActionTypes): IDistilleryAction => {
// // 	return { type: API_ACTION_VIEWS_TYPES[name].GET};
// // }
// //
// 	export;
// const //  = getViewSuccess(types: IDistilleryActionTypes, data: IResponse): IDistilleryAction => {
// // 	return { type: API_ACTION_VIEWS_TYPES[name].GET_SUCCESS, data};
// // }
//
// 	export;
