import { takeEvery, call, put, select } from 'redux-saga/effects';
import { CREATE_APP } from '../constants';
import { getCreateApp } from '../utils';
import { setCreateApp, createAppFail, appendApp } from '../actions';

import { getUserPermissions } from '../batteries/modules/actions';

const getUser = (state) => state.user.data;

function* createAppWorker(options) {
	try {
		const user = yield select(getUser);
		const response = yield call(getCreateApp, options, user.authToken);
		yield put(appendApp({ [options.appName]: String(response.id) }));
		yield put(getUserPermissions());
		yield put(setCreateApp({ ...response, ...options }));
	} catch (e) {
		yield put(createAppFail(e));
	}
}

function* watchCreateApp(action) {
	if (action.type === CREATE_APP.LOAD) {
		yield call(createAppWorker, action.payload);
	}
}

export default function* createAppSaga() {
	yield takeEvery(CREATE_APP.LOAD, watchCreateApp);
}
