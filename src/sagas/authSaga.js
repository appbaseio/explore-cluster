import { take, call, put } from 'redux-saga/effects';

import { USER } from '../constants';
import { getUser } from '../utils';
import { setUser, loadApps, setUserError } from '../actions';

function* authWorker(username, password, url) {
	try {
		const user = yield call(getUser, username, password, url);
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
