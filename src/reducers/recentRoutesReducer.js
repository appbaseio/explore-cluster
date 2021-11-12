// @flow
import { SAVE_HISTORY } from '../constants';

export default function recentRoutesReducer(
	state: Object = {
		recentRoute: '/',
	},
	action: Object,
): ?Object {
	switch (action.type) {
		case SAVE_HISTORY: {
			return {
				...state,
				recentRoute: action.payload,
			};
		}
		default:
			return state;
	}
}
