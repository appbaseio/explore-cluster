import { SIDE_BAR } from '../constants';

const sideBarState = (state = false, action) => {
	switch (action.type) {
		case SIDE_BAR.SET_COLLAPSED:
			return action.isCollapsed;
		default:
			return state;
	}
};

export default sideBarState;
