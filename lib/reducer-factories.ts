import * as combineReducers from 'combine-reducers';
import { keyBy } from 'lodash';
import {
	IDistilleryAction,
	IDistilleryActionTypes,
	ILoadingState,
	IResponse,
	IDictionary,
} from './types';
import { UNDO_ACTION } from './action-creators';

const getIdFromResponse = (response: IResponse) => response.data.id;

export const createGlobalLoadingStateReducer = (types: IDistilleryActionTypes) =>
	(state: ILoadingState = { isLoading: false }, action: IDistilleryAction) => {
		const payload = action.data;
		switch (action.type) {
			case types.GET_LIST:
			case types.GET:
			case types.CREATE:
			case types.UPDATE:
			case types.REMOVE: {
				return { ...state, isLoading: true, error: null };
			}
			case types.GET_SUCCESS:
			case types.GET_LIST_SUCCESS:
			case types.CREATE_SUCCESS:
			case types.REMOVE_SUCCESS:
			case types.UPDATE_SUCCESS: {
				return { ...state, isLoading: false, error: null };
			}
			case types.FAILED: {
				return { ...state, isLoading: false, error: payload.message };
			}
			default:
				return state;
		}
	};

export const createLoadingStatesByIdReducer = (types: IDistilleryActionTypes) =>
	(state: IDictionary<ILoadingState> = {}, action: IDistilleryAction) => {
		const payload = action.data;
		switch (action.type) {
			case types.GET:
			case types.CREATE:
			case types.UPDATE:
			case types.REMOVE: {
				return {
					...state,
					[payload.id]: { isLoading: true, error: null },
				};
			}
			case types.GET_SUCCESS: {
				return {
					...state,
					[getIdFromResponse(payload)]: { isLoading: false, error: null },
				};
			}
			case types.CREATE_SUCCESS: {
				const { [payload._id]: alreadyCreated, ...rest } = state;
				return {
					...rest,
					[getIdFromResponse(payload)]: { isLoading: false, error: null },
				};
			}
			case types.GET_LIST_SUCCESS: {
				const rawEntities = payload.data;
				const newLoadingStates = rawEntities.map(entity => entity.id).reduce((memo, id) => {
					memo[id] = { isLoading: false };
					return memo;
				}, {});
				return {
					...state,
					...newLoadingStates,
				};
			}
			case types.UPDATE_SUCCESS: {
				return {
					...state,
					[getIdFromResponse(payload)]: { isLoading: false, error: null },
				};
			}
			case types.REMOVE_SUCCESS: {
				const { [getIdFromResponse(payload)]: deleted, ...rest } = state;
				return rest;
			}
			case types.FAILED: {
				return {
					...state,
					[getIdFromResponse(payload)]: { isLoading: false, error: payload.message },
				};
			}
			default:
				return state;
		}
	};
export const createDictionaryReducer = (types: IDistilleryActionTypes) =>
	(state: IDictionary<any> = {}, action: IDistilleryAction) => {
		const payload = action.data;
		switch (action.type) {
			case types.GET_LIST_SUCCESS: {
				const rawEntities = payload.data;
				const newEntities = keyBy(rawEntities, 'id');
				return { ...state, ...newEntities };
			}
			case types.GET_SUCCESS: {
				return {
					...state,
					[getIdFromResponse(payload)]: payload.data,
				};
			}
			case types.CREATE_SUCCESS: {
				const { [payload._id]: alreadyCreated, ...rest } = state;
				return {
					...rest,
					[getIdFromResponse(payload)]: payload.data,
				};
			}
			case types.UPDATE_SUCCESS: {
				return {
					...state,
					[getIdFromResponse(payload)]: { ...state[getIdFromResponse(payload)], ...payload.data },
				};
			}
			case types.REMOVE_SUCCESS: {
				const { [getIdFromResponse(payload)]: deleted, ...rest } = state;
				return rest;
			}
			default:
				return state;
		}
	};

export const createIdsReducer = (types: IDistilleryActionTypes) =>
	(state: string[] = [], action: IDistilleryAction) => {
		const payload = action.data;
		switch (action.type) {
			case types.GET_LIST_SUCCESS: {
				const rawEntities = payload.data;
				const newIds = rawEntities.map(entity => entity.id);
				return [...state, ...newIds];
			}
			case types.GET_SUCCESS: {
				return [...state, getIdFromResponse(payload)];
			}
			case types.CREATE_SUCCESS: {
				return [...state.filter(id => id !== payload._id), getIdFromResponse(payload)];
			}
			case types.REMOVE_SUCCESS: {
				const deletedId = getIdFromResponse(payload);
				return state.filter(id => id !== deletedId);
			}
			default:
				return state;
		}
	};

export const createLoadingStatesReducer = (types: IDistilleryActionTypes) => combineReducers({
	global: createGlobalLoadingStateReducer(types),
	byId: createLoadingStatesByIdReducer(types),
});

export const createReducer = (types: IDistilleryActionTypes) => combineReducers({
	dictionary: createDictionaryReducer(types),
	ids: createIdsReducer(types),
	loadingStates: createLoadingStatesReducer(types),
});

export const undoReducerFactory = (reducersMap, initialState, bufferSize) => {
	let executedActions: any[] = [];
	let baseState: any = initialState;
	const rootReducer = combineReducers(reducersMap);
	return (reducer) => {
		return (state, action) => {
			if (action.type === UNDO_ACTION) {
				executedActions = executedActions.filter(eAct => eAct !== action.data);
				// update the state for every action until we get the
				// exact same state as before, but without the action we want to rollback
				return executedActions.reduce((newState: any, currentAction) => {
					return rootReducer(newState, currentAction);
				}, baseState);
			} else {
				executedActions.push(action);
				if (executedActions.length === bufferSize) {
					const actionToCommit = executedActions.shift();
					baseState = rootReducer(baseState, actionToCommit);
				}
				return reducer(state, action);
			}
		};
	};
};
