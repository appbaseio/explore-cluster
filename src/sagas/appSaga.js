import { takeEvery, call, put, select, take } from 'redux-saga/effects';
import get from 'lodash/get';
import { APPS } from '../constants';
import { getEndpoints, getESIndices } from '../utils';
import { loadAppsSuccess, loadAppsError, loadEndpointsSuccess } from '../actions';
import apisMapper from '../batteries/utils/apisMapper';
import { BACKENDS } from '../batteries/utils';
import { createAction } from '../batteries/modules/actions/utils';
import constants from '../batteries/modules/constants';

const getUser = (state) => state.user.data;
const getPlan = (state) => get(state, '$getAppPlan.results', {});
const getApps = (state) => state.apps.data;
function* appWorker() {
	try {
		const user = yield select(getUser);
		const plan = yield select(getPlan);
		if (plan && Object.keys(plan).length) {
			yield put(createAction(constants.HEALTH.SET_SEARCH_ENGINE_HEALTH));
			let endpoints;
			if (plan.backend) {
				endpoints = yield call(getEndpoints);
				if (typeof endpoints === 'object' && !endpoints.status) {
					yield put(loadEndpointsSuccess(endpoints));
					yield put(createAction(constants.HEALTH.SET_SEARCH_ENGINE_HEALTH_SUCCESS));
				} else {
					yield put(
						createAction(constants.HEALTH.SET_SEARCH_ENGINE_HEALTH_ERROR, {
							error: endpoints,
						}),
					);
					endpoints = null;
				}
			}
			const apps = yield call(
				getESIndices,
				user.authToken,
				plan.backend || BACKENDS.ELASTICSEARCH.name,
				endpoints ?? apisMapper[plan.backend || BACKENDS.ELASTICSEARCH.name],
			);

			if (Object.keys(apps).length) {
				yield put(loadAppsSuccess(apps));
			}
		}
	} catch (e) {
		console.log('appSaga reporteed', e);
		yield put(loadAppsError(e));
	}
}

export default function* appSaga() {
	yield takeEvery(APPS.LOAD, appWorker);

	// the _plan api call delays sometimes leading to
	// discrepency in fetching indices
	// thus this effect
	yield take(constants.APP.GET_PLAN_SUCCESS);
	const apps = yield select(getApps);
	if (!apps || !Object.keys(apps).length) {
		yield call(appWorker);
	}
}
