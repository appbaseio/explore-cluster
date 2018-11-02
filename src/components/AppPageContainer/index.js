import React, { Component } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setCurrentApp } from '../../batteries/modules/actions';

class AppPageContainer extends Component {
	constructor(props) {
		super(props);

		const { appName, updateCurrentApp } = props;
		if (appName) {
			updateCurrentApp(appName);
		}
	}

	render() {
		const { isLoading, component, ...props } = this.props;

		return React.createElement(component, props);
	}
}

AppPageContainer.defaultProps = {
	isLoading: false,
};

AppPageContainer.propTypes = {
	isLoading: PropTypes.bool,
	component: PropTypes.func.isRequired,
	updateCurrentApp: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
	const appName = get(ownProps, 'match.params.appName');
	return {
		appName,
	};
};

const mapDispatchToProps = dispatch => ({
	updateCurrentApp: appName => dispatch(setCurrentApp(appName, appName)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(AppPageContainer);
