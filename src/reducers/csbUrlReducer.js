// @flow
import { SAVE_CSB_URL } from '../constants';

export default function csbUrlReducer(
	state: Object = {
		csbURL: '',
	},
	action: Object,
): ?Object {
	switch (action.type) {
		case SAVE_CSB_URL: {
			return {
				...state,
				csbURL: action.payload,
			};
		}
		default:
			return state;
	}
}
