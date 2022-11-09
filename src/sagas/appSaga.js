import { takeEvery, call, put, select } from 'redux-saga/effects';
import get from 'lodash/get';
import { APPS } from '../constants';
import { getEndpoints, getESIndices } from '../utils';
import { loadAppsSuccess, loadAppsError, loadEndpointsSuccess } from '../actions';
import apisMapper from '../pages/IntegrationsPage/utils/apisMapper';
import { BACKENDS } from '../batteries/utils';

const getUser = (state) => state.user.data;
const getPlan = (state) => get(state, '$getAppPlan.results', {});
function* appWorker() {
	try {
		const user = yield select(getUser);
		const plan = yield select(getPlan);

		const endpoints = yield call(getEndpoints);
		yield put(loadEndpointsSuccess(endpoints));
		const apps = yield call(
			getESIndices,
			user.authToken,
			plan.backend || BACKENDS.ELASTICSEARCH.name,
			endpoints ?? apisMapper[plan.backend || BACKENDS.ELASTICSEARCH.name],
		);

		yield put(loadAppsSuccess(apps));
	} catch (e) {
		yield put(loadAppsError(e));
	}
}

export default function* appSaga() {
	yield takeEvery(APPS.LOAD, appWorker);
}
