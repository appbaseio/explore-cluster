import { take, call, put } from 'redux-saga/effects';

import { ALLOWED_ACTIONS, USER } from '../constants';
import { setUser, loadApps, setUserError, loadEndpointsSuccess } from '../actions';
import { getOriginURL, getUser, getEndpoints } from '../utils';

function* authWorker(username, password, url) {
	try {
		const user = yield call(getUser, username, password, url);
		localStorage.setItem('url', getOriginURL(url));
		localStorage.setItem('username', username);
		localStorage.setItem('password', password);

		localStorage.setItem('authToken', user.authToken);
		localStorage.setItem('isAdmin', user.isAdmin);
		localStorage.setItem('allowedActions', user.allowedActions);
		if (
			!window.location.search.includes('redirectTo') &&
			!window.location.pathname.includes('/cluster/search-builder') &&
			user.allowedActions.includes(ALLOWED_ACTIONS.UI_BUILDER)
		) {
			window.location.pathname = '/cluster/search-builder';
		}
		const endpoints = yield call(getEndpoints);
		yield put(loadEndpointsSuccess(endpoints));
		// sessionStorage.setItem('isAdmin', user.isAdmin);
		// sessionStorage.setItem('allowedActions', user.allowedActions);
		yield put(setUser(user));
		yield put(loadApps());
	} catch (e) {
		yield put(setUserError(e));
	}
}

export default function* authSaga() {
	const { payload } = yield take(USER.LOAD);
	yield call(authWorker, payload.username, payload.password, payload.url);
}
