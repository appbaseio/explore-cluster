import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { connect } from 'react-redux';

// eslint-disable-next-line import/no-cycle
import AppHeader from '../AppHeader';
import AppsRouteContainer from './AppsRouteContainer';
import { clearCurrentApp } from '../../batteries/modules/actions';

class AppLayout extends React.PureComponent {
	componentWillUnmount() {
		const { clearApp } = this.props;
		clearApp();
	}

	render() {
		const { collapsed, showHeader, match, history, onToggle, ...props } = this.props;
		return (
			<Layout
				style={{
					paddingTop: showHeader ? 60 : 0,
					minHeight: '100vh',
					marginLeft: collapsed ? '80px' : '284px',
					position: 'relative',
					overflowY: 'auto',
				}}
			>
				{showHeader && (
					<AppHeader
						big={collapsed}
						match={match}
						history={history}
						collapsed={collapsed}
						onToggle={onToggle}
					/>
				)}
				<AppsRouteContainer {...props} />
			</Layout>
		);
	}
}

AppLayout.propTypes = {
	clearApp: PropTypes.func.isRequired,
	collapsed: PropTypes.bool,
	showHeader: PropTypes.bool,
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	onToggle: PropTypes.func.isRequired,
};

AppLayout.defaultProps = {
	collapsed: false,
	showHeader: false,
};

const mapDispatchToProps = (dispatch) => ({
	clearApp: () => dispatch(clearCurrentApp()),
});

export default connect(null, mapDispatchToProps)(AppLayout);
