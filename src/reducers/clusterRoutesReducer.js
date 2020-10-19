import { ROUTES_ACTION } from '../constants';
import { CLUSTER_ROUTES } from '../constants/routes';

export default function clusterRoutesReducer(state = CLUSTER_ROUTES, action = {}) {
	if (action.type === ROUTES_ACTION.SET_CLUSTER_ROUTES) {
		return action.payload;
	}
	return state;
}
