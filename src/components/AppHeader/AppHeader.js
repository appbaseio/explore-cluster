import React from 'react';
import { Layout, Menu, Icon, Tooltip, Button, Row, Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { string, object, bool, number } from 'prop-types';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import get from 'lodash/get';
import MenuSlider from '../FullHeader/MenuSlider';
import UserMenu from './UserMenu';
import { media } from '../../utils/media';
import headerStyles from './styles';
import AppSwitcher from '../AppSwitcher';

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

function showProfile() {
	const storedValue = sessionStorage.getItem('showProfile');

	if (storedValue) {
		return JSON.parse(storedValue);
	}
	return true;
}

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
	<Header
		className={headerStyles}
		css={{
			width: big ? 'calc(100% - 80px)' : 'calc(100% - 260px)',
			justifyContent: minimal ? 'flex-end !important' : 'space-between',
			left: big ? '80px' : '260px',
		}}
	>
		{minimal ? (
			<Icon
				style={{ position: 'absolute', left: 20 }}
				className="trigger"
				type={collapsed ? 'menu-unfold' : 'menu-fold'}
				onClick={onToggle}
			/>
		) : (
			<Menu mode="horizontal">
				<Menu.Item key="back" className={noBorder} style={{ padding: 0 }}>
					<Icon
						className="trigger"
						type={collapsed ? 'menu-unfold' : 'menu-fold'}
						onClick={onToggle}
					/>
				</Menu.Item>
				<Menu.Item className={noBorder} style={{ marginBottom: 12 }} key="breadcrumb">
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
				</Menu.Item>

				{/* {showApp && ( */}
				{/*	<Menu.Item key="1" className={noBorder}> */}
				{/*		<AppSwitcher */}
				{/*			currentApp={currentApp || 'Loading...'} */}
				{/*			history={history} */}
				{/*			match={match} */}
				{/*		/> */}
				{/*	</Menu.Item> */}
				{/* )} */}
			</Menu>
		)}

		{isUsingTrial && (
			<div style={{ marginRight: 20 }}>
				<Tooltip title="You are currently on a trial which unlocks all the paid Arc plan features. You can upgrade to a paid plan anytime till the trial expires. Post trial expiration, you won't be able to access Arc.">
					<Button css={trialBtn} type="danger" href="billing">
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
);

AppHeader.propTypes = {
	currentApp: string,
	user: object.isRequired,
	big: bool.isRequired,
	minimal: bool,
	showApp: bool,
	isUsingTrial: bool.isRequired,
	daysLeft: number.isRequired,
};

AppHeader.defaultProps = {
	showApp: true,
	currentApp: null,
	minimal: false,
};

const mapStateToProps = state => ({
	currentApp: get(state, '$getCurrentApp.name'),
	user: state.user.data,
	isUsingTrial: get(state, '$getAppPlan.results.trial') || false,
	daysLeft: get(state, '$getAppPlan.results.daysLeft', 0),
});

export default connect(mapStateToProps)(AppHeader);
