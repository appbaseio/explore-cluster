// @flow
import { USER } from '../constants';
import { getDefaultAllowedActions } from '../utils/allowedActions';

const defaultUsername = localStorage.getItem('username') || sessionStorage.getItem('username');
const defaultPassword = localStorage.getItem('password') || sessionStorage.getItem('password');
const defaultToken = localStorage.getItem('authToken');
const defaultAllowedActions = sessionStorage.getItem('allowedActions');

let defaultIsAdmin = false;

try {
	defaultIsAdmin = Boolean(JSON.parse(sessionStorage.getItem('isAdmin')));
} catch (err) {
	console.error(err);
}

const defaultUserData =
	defaultUsername && defaultPassword && defaultToken
		? {
				username: defaultUsername,
				password: defaultPassword,
				authToken: defaultToken,
				isAdmin: defaultIsAdmin,
				allowedActions: defaultAllowedActions
					? defaultAllowedActions.split(',')
					: getDefaultAllowedActions(defaultIsAdmin),
		  } // eslint-disable-line
		: null;

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
