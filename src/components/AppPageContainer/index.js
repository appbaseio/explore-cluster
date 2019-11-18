import React, { Component } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Loader from '../Loader';
import { setCurrentApp, getAppPlan } from '../../batteries/modules/actions';

class AppPageContainer extends Component {
	constructor(props) {
		super(props);

		const { appName, updateCurrentApp } = props;
		if (appName) {
			updateCurrentApp(appName);
		}
	}

	componentDidMount() {
		const {
 isClusterPlanFetched, fetchClusterPlan, isClusterPlanFetching, isError,
} = this.props;
		if (!isClusterPlanFetching && !isClusterPlanFetched && !isError) {
			fetchClusterPlan();
		}
	}

	render() {
		const { isLoading, component, ...props } = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return React.createElement(component, props);
	}
}

AppPageContainer.defaultProps = {
	isLoading: false,
	isClusterPlanFetching: false,
	isError: undefined,
	appName: '',
	shouldFetchUserPlan: true,
};

AppPageContainer.propTypes = {
	isLoading: PropTypes.bool,
	appName: PropTypes.string,
	isError: PropTypes.any,
	shouldFetchUserPlan: PropTypes.bool,
	component: PropTypes.func.isRequired,
	updateCurrentApp: PropTypes.func.isRequired,
	fetchClusterPlan: PropTypes.func.isRequired,
	isClusterPlanFetching: PropTypes.bool,
	isClusterPlanFetched: PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	const appName = get(ownProps, 'match.params.appName');
	return {
		appName,
		isClusterPlanFetched: get(state, '$getAppPlan.success'),
		isClusterPlanFetching: get(state, '$getAppPlan.isFetching', false),
		isLoading: get(state, '$getAppPlan.isFetching'),
		isError: get(state, '$getAppPlan.error'),
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: appName => dispatch(setCurrentApp(appName, appName)),
	fetchClusterPlan: () => dispatch(getAppPlan()),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(AppPageContainer);
