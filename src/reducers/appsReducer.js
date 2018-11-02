// @flow
import { APPS } from '../constants';

export default function appsReducer(
	state: Object = {
		isFetching: false,
		data: null,
		error: null,
	},
	action: Object,
): ?Object {
	switch (action.type) {
		case APPS.LOAD: {
			return {
				isFetching: true,
				data: null,
				error: null,
			};
		}
		case APPS.LOAD_SUCCESS: {
			return {
				isFetching: false,
				data: action.payload,
				error: null,
			};
		}
		case APPS.LOAD_FAIL: {
			return {
				isFetching: false,
				data: null,
				error: action.error,
			};
		}
		case APPS.DELETE_APP: {
			const apps = state.data;
			delete apps[action.payload];
			return {
				isFetching: false,
				data: apps,
				error: null,
			};
		}
		case APPS.APPEND: {
			return {
				isFetching: false,
				data: { ...state.data, ...action.payload },
				error: null,
			};
		}
		default:
			return state;
	}
}
