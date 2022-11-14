import userReducer from './userReducer';
import appsReducer from './appsReducer';
import appsMetricsReducer from './appsMetricsReducer';
import appsOwnersReducer from './appsOwnersReducer';
import createAppReducer from './createAppReducer';
import appsScreenPreferences from './appsScreenPreferences';
import sideBarCollapsedReducer from './sideBarCollapsedReducer';
import appRoutesReducer from './appRoutesReducer';
import clusterRoutesReducer from './clusterRoutesReducer';
import recentRoutesReducer from './recentRoutesReducer';
import csbUrlReducer from './csbUrlReducer';
import setSessionDataReducer from './setSessionDataReducer';
import endpointsReducer from './endpointsReducer';

export default {
	user: userReducer,
	apps: appsReducer,
	endpoints: endpointsReducer,
	appRoutes: appRoutesReducer,
	clusterRoutes: clusterRoutesReducer,
	appsMetrics: appsMetricsReducer,
	appsOwners: appsOwnersReducer,
	createdApp: createAppReducer,
	appsScreenPreferences,
	sideBarCollapsed: sideBarCollapsedReducer,
	recentRoutes: recentRoutesReducer,
	csbURL: csbUrlReducer,
	sessionData: setSessionDataReducer,
};
