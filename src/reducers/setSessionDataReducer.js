// @flow
import { SET_SESSION_DATA } from '../constants';

export default function setSessionDataReducer(
	state: Object = {
		sessionData: '',
	},
	action: Object,
): ?Object {
	switch (action.type) {
		case SET_SESSION_DATA: {
			return {
				...state,
				sessionData: action.payload,
			};
		}
		default:
			return state;
	}
}
