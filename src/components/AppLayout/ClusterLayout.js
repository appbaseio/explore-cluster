import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import AppHeader from '../AppHeader';
import ClusterRouteContainer from './ClusterRouteContainer';

class ClusterLayout extends React.PureComponent {
	render() {
		const { collapsed, showHeader, ...props } = this.props;
		return (
			<Layout
				css={{
					minHeight: 'calc(100vh - 65px)',
					overflowY: 'auto',
				}}
			>
				{showHeader && <AppHeader big={collapsed} {...props} />}
				<ClusterRouteContainer {...props} />
			</Layout>
		);
	}
}

ClusterLayout.propTypes = {
	collapsed: PropTypes.bool,
	showHeader: PropTypes.bool,
	history: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired,
	location: PropTypes.object.isRequired,
};

ClusterLayout.defaultProps = {
	collapsed: false,
	showHeader: false,
};

export default ClusterLayout;
