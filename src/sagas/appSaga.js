import {
 takeEvery, call, put, select,
} from 'redux-saga/effects';
import { APPS } from '../constants';
import { getESIndices, getAppsOwners } from '../utils';
import {
 loadAppsSuccess, loadAppsError, setAppsOwners, setAppsOwnersError,
} from '../actions';

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

function* appsOwnersWorker() {
	try {
		const owners = yield call(getAppsOwners);
		yield put(setAppsOwners(owners));
	} catch (e) {
		yield put(setAppsOwnersError(e));
	}
}

export default function* appSaga() {
	yield takeEvery(APPS.LOAD_OWNERS, appsOwnersWorker);
	yield takeEvery(APPS.LOAD, appWorker);
}
