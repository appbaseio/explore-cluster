import { ROUTES_ACTION } from '../constants';
import { APP_ROUTES } from '../constants/routes';

export default function appRoutesReducer(state = APP_ROUTES, action = {}) {
	if (action.type === ROUTES_ACTION.SET_APP_ROUTES) {
		return action.payload;
	}
	return state;
}
