import React from 'react';
import { Layout } from 'antd';

import AppHeader from '../AppHeader';
import AppsRouteContainer from './AppsRouteContainer';

class AppLayout extends React.PureComponent {
	render() {
		const { collapsed, showHeader, match, history, onToggle, ...props } = this.props;
		return (
			<Layout
				style={{
					paddingTop: showHeader ? 60 : 0,
					minHeight: '100vh',
					marginLeft: collapsed ? '80px' : '260px',
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

export default AppLayout;
