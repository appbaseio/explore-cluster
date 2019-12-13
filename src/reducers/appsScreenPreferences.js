import { APP_SCREEN_PREFERENCES } from '../constants';

const defaultPreferences = {
	showListView: false,
	showSystemIndices: false,
};

export default function appsScreenPreferences(state = defaultPreferences, action = {}) {
	if (action.type === APP_SCREEN_PREFERENCES.UPDATE_PREFERENCES) {
		return { ...state, ...action.payload };
	}
	return state;
}
