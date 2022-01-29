// @flow
import {
	USER,
	APPS,
	CREATE_APP,
	APP_SCREEN_PREFERENCES,
	SIDE_BAR,
	ROUTES_ACTION,
	SAVE_HISTORY,
	SAVE_CSB_URL,
	SET_SESSION_DATA,
} from '../constants';

import { createAction } from '../batteries/modules/actions/utils';

export function loadUser(username: string, password: string, url?: string): Object {
	return createAction(USER.LOAD, { username, password, url }, null, null);
}

export function setUser(user: Object): Object {
	return createAction(USER.LOAD_SUCCESS, user, null, null);
}

export function setUserError(error: Object): Object {
	return createAction(USER.LOAD_FAIL, null, error, null);
}

export function loadApps(): Object {
	return createAction(APPS.LOAD, null, null, null);
}

export function loadAppsSuccess(apps: Object): Object {
	return createAction(APPS.LOAD_SUCCESS, apps, null, null);
}

export function loadAppsError(error: Object): Object {
	return createAction(APPS.LOAD_FAIL, null, error, null);
}

export function appendApp(app: Object): Object {
	return createAction(APPS.APPEND, app, null, null);
}

export function setAppsMetrics(metrics: Object): Object {
	return createAction(APPS.LOAD_METRICS_SUCCESS, metrics, null, null);
}

export function setAppsMetricsError(error: Object): Object {
	return createAction(APPS.LOAD_METRICS_FAIL, null, error, null);
}

export function getAppsOwners(): Object {
	return createAction(APPS.LOAD_OWNERS, null, null, null);
}

export function setAppsOwners(owners: Object): Object {
	return createAction(APPS.LOAD_OWNERS_SUCCESS, owners, null, null);
}

export function setAppsOwnersError(error: Object): Object {
	return createAction(APPS.LOAD_OWNERS_FAIL, null, error, null);
}

export function createApp(options: Object): Object {
	return createAction(CREATE_APP.LOAD, options, null, null);
}

export function setCreateApp(data: Object): Object {
	return createAction(CREATE_APP.LOAD_SUCCESS, data, null, null);
}

export function resetCreatedApp(): Object {
	return createAction(CREATE_APP.RESET, null, null, null);
}

export function createAppFail(error: Object): Object {
	const e = JSON.parse(error.message);
	return createAction(CREATE_APP.LOAD_FAIL, null, e, null);
}

export function removeAppData(options: Object): Object {
	return createAction(APPS.DELETE_APP, options, null, null);
}

export function updateAppScreenPreferences(payload: Object): Object {
	return { type: APP_SCREEN_PREFERENCES.UPDATE_PREFERENCES, payload };
}

export function setIsSidebarCollapsed(isCollapsed) {
	return {
		type: SIDE_BAR.SET_COLLAPSED,
		isCollapsed,
	};
}

export function setAppRoutes(payload: Object): Object {
	return { type: ROUTES_ACTION.SET_APP_ROUTES, payload };
}

export function setClusterRoutes(payload: Object): Object {
	return { type: ROUTES_ACTION.SET_CLUSTER_ROUTES, payload };
}

export function saveRecentRoute(payload: string): Object {
	return { type: SAVE_HISTORY, payload };
}

export function saveCsbUrl(payload: string): Object {
	return { type: SAVE_CSB_URL, payload };
}

export function setSessionData(payload: string): Object {
	return { type: SET_SESSION_DATA, payload };
}
