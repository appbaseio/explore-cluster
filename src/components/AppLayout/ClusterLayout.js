import React from 'react';
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
				{showHeader && <AppHeader big={collapsed} />}
				<ClusterRouteContainer {...props} />
			</Layout>
		);
	}
}

export default ClusterLayout;
