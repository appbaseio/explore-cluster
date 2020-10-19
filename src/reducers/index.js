import userReducer from './userReducer';
import appsReducer from './appsReducer';
import appsMetricsReducer from './appsMetricsReducer';
import appsOwnersReducer from './appsOwnersReducer';
import createAppReducer from './createAppReducer';
import appsScreenPreferences from './appsScreenPreferences';
import appRoutesReducer from './appRoutesReducer';
import clusterRoutesReducer from './clusterRoutesReducer';

export default {
	user: userReducer,
	apps: appsReducer,
	appRoutes: appRoutesReducer,
	clusterRoutes: clusterRoutesReducer,
	appsMetrics: appsMetricsReducer,
	appsOwners: appsOwnersReducer,
	createdApp: createAppReducer,
	appsScreenPreferences,
};
