import React, { Component } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Result } from 'antd';
import Loader from '../Loader';
import { setCurrentApp, getAppPlan } from '../../batteries/modules/actions';
import AppSwitcher from '../AppSwitcher';

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
			isClusterPlanFetched,
			fetchClusterPlan,
			isClusterPlanFetching,
			isError,
		} = this.props;
		if (!isClusterPlanFetching && !isClusterPlanFetched && !isError) {
			fetchClusterPlan();
		}
	}

	render() {
		const { isLoading, isFetchingApps, component, apps, ...props } = this.props;
		if (isLoading || isFetchingApps) {
			return <Loader />;
		}
		if (props.appName && apps && !Object.keys(apps).includes(props.appName)) {
			return (
				<Result
					status="404"
					title="Invalid Index"
					subTitle={
						<p>
							You are trying to access an invalid index. Please select an existing
							index to access the page.
						</p>
					}
					extra={<AppSwitcher preserveButtonStyle currentApp="Select an index" />}
				/>
			);
		}
		return <div key={props.appName}>{React.createElement(component, props)}</div>;
	}
}

AppPageContainer.defaultProps = {
	isLoading: false,
	isClusterPlanFetching: false,
	isError: undefined,
	appName: '',
	isFetchingApps: false,
	apps: {},
};

AppPageContainer.propTypes = {
	isLoading: PropTypes.bool,
	appName: PropTypes.string,
	isError: PropTypes.any,
	component: PropTypes.func.isRequired,
	updateCurrentApp: PropTypes.func.isRequired,
	fetchClusterPlan: PropTypes.func.isRequired,
	isClusterPlanFetching: PropTypes.bool,
	isClusterPlanFetched: PropTypes.bool.isRequired,
	isFetchingApps: PropTypes.bool,
	apps: PropTypes.object,
};

const mapStateToProps = (state, ownProps) => {
	const appName = get(ownProps, 'match.params.appName');
	return {
		appName,
		isClusterPlanFetched: get(state, '$getAppPlan.success'),
		isClusterPlanFetching: get(state, '$getAppPlan.isFetching', false),
		isLoading: get(state, '$getAppPlan.isFetching'),
		isError: get(state, '$getAppPlan.error'),
		fetchingApps: get(state, 'apps.isFetching'),
		apps: get(state, 'apps.data'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	updateCurrentApp: (appName) => dispatch(setCurrentApp(appName, appName)),
	fetchClusterPlan: () => dispatch(getAppPlan()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppPageContainer);
