import { take, call, put } from 'redux-saga/effects';

import { USER } from '../constants';
import { getUser } from '../utils';
import { setUser, loadApps, setUserError } from '../actions';

function* authWorker(username, password, url) {
	try {
		localStorage.setItem('url', url);
		localStorage.setItem('username', username);
		localStorage.setItem('password', password);
		const user = yield call(getUser, username, password, url);

		localStorage.setItem('authToken', user.authToken);
		sessionStorage.setItem('isAdmin', user.isAdmin);

		sessionStorage.setItem('allowedActions', user.allowedActions);
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
