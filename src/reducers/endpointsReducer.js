// @flow
import { ENDPOINTS } from '../constants';

export default function endpointsReducer(
	state: Object = {
		isFetching: false,
		data: null,
		error: null,
	},
	action: Object,
): ?Object {
	switch (action.type) {
		case ENDPOINTS.LOAD: {
			return {
				isFetching: true,
				data: null,
				error: null,
			};
		}
		case ENDPOINTS.LOAD_SUCCESS: {
			return {
				isFetching: false,
				data: action.payload,
				error: null,
			};
		}
		case ENDPOINTS.LOAD_FAIL: {
			return {
				isFetching: false,
				data: null,
				error: action.error,
			};
		}
		default:
			return state;
	}
}
