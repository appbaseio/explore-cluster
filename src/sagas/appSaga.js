import { takeEvery, call, put, select } from 'redux-saga/effects';
import { APPS } from '../constants';
import { getESIndices } from '../utils';
import { loadAppsSuccess, loadAppsError } from '../actions';

const getUser = state => state.user.data;

function* appWorker() {
	try {
		const user = yield select(getUser);
		const apps = yield call(getESIndices, user.authToken);
		yield put(loadAppsSuccess(apps));
	} catch (e) {
		yield put(loadAppsError(e));
	}
}

export default function* appSaga() {
	yield takeEvery(APPS.LOAD, appWorker);
}
