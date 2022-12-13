import React from 'react';
import { Layout, Menu, Tooltip, Button, Row, Breadcrumb } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { string, object, bool, number, func } from 'prop-types';
import styled, { css } from 'react-emotion';
import { connect } from 'react-redux';
import get from 'lodash/get';
import MenuSlider from '../FullHeader/MenuSlider';
import UserMenu from './UserMenu';
import { media } from '../../utils/media';
import headerStyles from './styles';
import AppSwitcher from '../AppSwitcher';
// eslint-disable-next-line
import { bannerContext } from '../..';

const { Header } = Layout;
const noBorder = css`
	border: 0 !important;

	span {
		color: rgba(0, 0, 0, 0.65) !important;
	}

	&:hover span,
	&:focus span {
		color: #1890ff !important;
	}
`;
const trialText = css`
	line-height: 2em;
	font-size: 0.9em;
`;
const trialBtn = css`
	${media.small(css`
		display: none;
	`)};
`;
const StyledMenu = styled(Menu)`
	min-width: 400px;
`;
const StyledMenuItem = styled(Menu.Item)`
	display: flex;
	align-items: center;
	& .ant-breadcrumb ol {
		display: flex;
		align-items: center;
	}
`;

function showProfile() {
	const storedValue = sessionStorage.getItem('showProfile');

	if (storedValue) {
		return JSON.parse(storedValue);
	}
	return true;
}

const MenuIcon = ({ collapsed, ...rest }) => {
	return collapsed ? <MenuUnfoldOutlined {...rest} /> : <MenuFoldOutlined {...rest} />;
};

MenuIcon.propTypes = {
	collapsed: bool.isRequired,
};

const AppHeader = ({
	currentApp,
	user,
	big,
	minimal,
	isUsingTrial,
	daysLeft,
	history,
	match,
	showApp,
	collapsed,
	onToggle,
}) => (
	<bannerContext.Consumer>
		{(val) => (
			<Header
				className={headerStyles(val)}
				css={{
					width: big ? 'calc(100% - 80px)' : 'calc(100% - 260px)',
					justifyContent: minimal ? 'flex-end !important' : 'space-between',
					left: big ? '80px' : '260px',
				}}
			>
				{minimal ? (
					<MenuIcon
						style={{ position: 'absolute', left: 20 }}
						collapsed={collapsed}
						className="trigger"
						onClick={onToggle}
					/>
				) : (
					<StyledMenu mode="horizontal">
						<Menu.Item key="back" className={noBorder} style={{ padding: 0 }}>
							<MenuIcon className="trigger" onClick={onToggle} />
						</Menu.Item>
						<StyledMenuItem
							className={noBorder}
							style={{ display: 'flex', alignItems: 'center' }}
							key="breadcrumb"
						>
							<Breadcrumb>
								<Breadcrumb.Item>
									<Link to="/">Cluster Overview</Link>
								</Breadcrumb.Item>
								{showApp && (
									<Breadcrumb.Item>
										<AppSwitcher
											currentApp={currentApp || 'Loading...'}
											history={history}
											match={match}
										/>
									</Breadcrumb.Item>
								)}
							</Breadcrumb>
						</StyledMenuItem>
					</StyledMenu>
				)}

				{isUsingTrial && showProfile() && (
					<div style={{ marginRight: 20 }}>
						<Tooltip title="You are currently on a trial which unlocks all the reactivesearch.io enterprise plan features. You can upgrade to a paid plan anytime till the trial expires. Once your trial expires, you won't be able to access reactivesearch.io.">
							<Button css={trialBtn} danger href="/cluster/billing">
								<span css={trialText}>
									{daysLeft > 0
										? `Trial expires in ${daysLeft} ${
												daysLeft > 1 ? 'days' : 'day'
										  }. Upgrade now`
										: 'Trial has expired. Upgrade Now'}
								</span>
							</Button>
						</Tooltip>
					</div>
				)}

				{showProfile() && (
					<Row justify="space-between" align="middle">
						<UserMenu user={user} />
					</Row>
				)}
				<MenuSlider />
			</Header>
		)}
	</bannerContext.Consumer>
);

AppHeader.propTypes = {
	currentApp: string,
	user: object.isRequired,
	big: bool.isRequired,
	minimal: bool,
	showApp: bool,
	isUsingTrial: bool.isRequired,
	daysLeft: number.isRequired,
	history: object.isRequired,
	match: object.isRequired,
	collapsed: bool,
	onToggle: func.isRequired,
};

AppHeader.defaultProps = {
	showApp: true,
	currentApp: null,
	minimal: false,
	collapsed: false,
};

const mapStateToProps = (state) => ({
	currentApp: get(state, '$getCurrentApp.name'),
	user: get(state, `user.data`),
	isUsingTrial: get(state, '$getAppPlan.results.trial', false),
	daysLeft: get(state, '$getAppPlan.results.daysLeft', 0),
});

export default connect(mapStateToProps)(AppHeader);
