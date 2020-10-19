import { ALLOWED_ACTIONS } from '../constants';

// this helps in giving backward compatibility
export const getDefaultAllowedActions = (isAdmin = false) => {
	let allowedActions = [
		ALLOWED_ACTIONS.DEVELOP,
		ALLOWED_ACTIONS.ANALYTICS,
		ALLOWED_ACTIONS.SEARCH_RELEVANCY,
		ALLOWED_ACTIONS.ACCESS_CONTROL,
	];

	if (isAdmin) {
		allowedActions = Object.values(ALLOWED_ACTIONS);
	}

	return allowedActions;
};
