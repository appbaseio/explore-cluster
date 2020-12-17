// @flow
import { USER } from '../constants';
import { getDefaultAllowedActions } from '../utils/allowedActions';

const defaultUsername = sessionStorage.getItem('username');
const defaultPassword = sessionStorage.getItem('password');
const defaultToken = sessionStorage.getItem('authToken');
const defaultIsAdmin = sessionStorage.getItem('isAdmin');
const defaultAllowedActions = sessionStorage.getItem('allowedActions');

let defaultUserData = null;
try {
	defaultUserData =
		defaultUsername && defaultPassword && defaultToken
			? {
					username: defaultUsername,
					password: defaultPassword,
					authToken: defaultToken,
					isAdmin: Boolean(JSON.parse(defaultIsAdmin)),
					allowedActions: defaultAllowedActions
						? defaultAllowedActions.split(',')
						: getDefaultAllowedActions(Boolean(defaultIsAdmin)),
			  } // eslint-disable-line
			: null;
} catch (err) {
	console.error(err);
}

export default function userReducer(
	state: Object = {
		isLoading: false,
		data: defaultUserData,
		error: null,
	},
	action: Object,
): ?Object {
	switch (action.type) {
		case USER.LOAD: {
			return {
				isLoading: true,
				data: null,
				error: null,
			};
		}
		case USER.LOAD_SUCCESS: {
			return {
				isLoading: false,
				data: action.payload,
				error: null,
			};
		}
		case USER.LOAD_FAIL: {
			return {
				isLoading: false,
				data: null,
				error: action.error,
			};
		}
		default:
			return state;
	}
}
