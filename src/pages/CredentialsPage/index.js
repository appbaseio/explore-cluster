import React, { Component } from 'react';
import get from 'lodash/get';
import {
 Card, Table, Popconfirm, Tooltip, Button, Alert, Typography,
} from 'antd';
import { connect } from 'react-redux';
import {
 string, func, bool, array,
} from 'prop-types';
import CreateCredentials from '../../components/CreateCredentials';
import Container from '../../components/Container';
import { getAppPermissionsByName } from '../../batteries/modules/selectors';
import Permission from './Permission';
import { displayErrors } from '../../utils/helper';
import {
	getPermission,
	createPermission,
	deletePermission,
	updatePermission,
	deleteApp,
} from '../../batteries/modules/actions';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import { getURL } from '../../constants/config';

const columns = [
	{
		title: 'Type',
		key: 'description',
		render: ({ permissionInfo }) => permissionInfo.description || 'No Description',
		width: '50%',
	},
	{
		title: 'Credentials',
		render: permission => <Permission {...permission} />,
		key: 'credentials',
		width: '50%',
	},
];

class Credentials extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showCredForm: false,
			currentPermissionInfo: undefined,
		};
	}

	componentDidMount() {
		this.refetchPermissions();
	}

	componentDidUpdate(prevProps) {
		const { appName, errors } = this.props;
		if (prevProps.appName !== appName) {
			this.initialize();
		}
		displayErrors(errors, prevProps.errors);
	}

	refetchPermissions = () => {
		const { appName, fetchPermissions } = this.props;
		fetchPermissions(appName);
	};

	handleCancel = () => {
		this.setState({
			showCredForm: false,
		});
	};

	updatePermission = (request, username) => {
		const { appName, handleEditPermission } = this.props;
		handleEditPermission(appName, username, request).then(({ payload }) => {
			if (payload) {
				this.setState(
					{
						showCredForm: false,
					},
					() => {
						this.refetchPermissions();
					},
				);
			}
		});
	};

	showForm = (permissionInfo) => {
		if (permissionInfo) {
			this.setState({
				showCredForm: true,
				currentPermissionInfo: permissionInfo,
			});
		} else {
			this.setState({
				showCredForm: true,
				currentPermissionInfo: undefined,
			});
		}
	};

	newPermission = (request) => {
		const { appName, handleCreatePermission } = this.props;
		handleCreatePermission(appName, request).then(({ payload }) => {
			if (payload) {
				this.setState(
					{
						showCredForm: false,
					},
					() => {
						this.refetchPermissions();
					},
				);
			}
		});
	};

	deletePermission = (username) => {
		const { appName, handleDeletePermission } = this.props;
		handleDeletePermission(appName, username).then(({ payload }) => {
			if (payload) {
				this.refetchPermissions();
			}
		});
	};

	deleteApp = () => {
		const { handleDeleteApp, appId } = this.props;
		handleDeleteApp(appId).then(({ payload }) => {
			if (payload) {
				// Redirect to home
				window.location = window.origin;
			}
		});
	};

	handleSubmit = (form, username) => {
		const { currentPermissionInfo } = this.state;
		if (currentPermissionInfo || username) {
			this.updatePermission(form.mappedValues, username);
		} else {
			this.newPermission(form.mappedValues);
		}
	};

	render() {
		const { showCredForm, currentPermissionInfo, mappings } = this.state;
		const { isLoading, permissions, isOwner } = this.props;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<Container>
				<Card
					title="Credentials"
					extra={(
						<a href="https://docs.appbase.io/docs/security/Credentials/" rel="noopener noreferrer" target="_blank">
							Read Docs
						</a>
					)}
				>
					<h4>Host URL for this cluster:</h4>
					<Alert message={<Typography.Paragraph style={{ marginBottom: 0 }} copyable={{ text: getURL() }}>{getURL()}</Typography.Paragraph>} type="info" css={{ marginBottom: 20 }} />
					<Table
						scroll={{ x: 700 }}
						dataSource={permissions.map(permission => ({
							permissionInfo: permission,
							deletePermission: this.deletePermission,
							showForm: this.showForm,
						}))}
						rowKey={row => `${get(row, 'permissionInfo.username')}${get(
								row,
								'permissionInfo.password',
							)}`
						}
						columns={columns}
						css="tr:hover td {
							background: transparent;
						}"
					/>
				</Card>
				{showCredForm && (
					<CreateCredentials
						disabled={!isOwner}
						titleText={!isOwner ? 'Credentials Details' : undefined}
						onSubmit={this.handleSubmit}
						show={showCredForm}
						handleCancel={this.handleCancel}
						mappings={mappings}
						initialValues={currentPermissionInfo}
					/>
				)}
				{isOwner && (
					<Button
						style={{
							margin: '10px 0px',
						}}
						onClick={() => this.showForm()}
						size="large"
						type="primary"
					>
						New Credentials
					</Button>
				)}
				{isOwner && (
					<Tooltip
						placement="rightTop"
						title="Deleting an app is a permanent action, and will delete all the associated data, credentials and team sharing settings."
					>
						<Popconfirm
							title="Are you sure delete this app?"
							onConfirm={this.deleteApp}
							okText="Yes"
							cancelText="No"
							placement="topLeft"
						>
							<Button
								style={{
									margin: '10px 10px',
									float: 'right',
								}}
								type="danger"
								size="large"
							>
								Delete App
							</Button>
						</Popconfirm>
					</Tooltip>
				)}
			</Container>
		);
	}
}
Credentials.defaultProps = {
	isLoading: false,
	appName: undefined,
	appId: undefined,
};
Credentials.propTypes = {
	appName: string,
	appId: string,
	permissions: array.isRequired,
	fetchPermissions: func.isRequired,
	handleCreatePermission: func.isRequired,
	handleDeletePermission: func.isRequired,
	handleEditPermission: func.isRequired,
	isOwner: bool.isRequired,
	isLoading: bool,
	errors: array.isRequired,
	handleDeleteApp: func.isRequired,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	let appPermissions = get(state, '$getAppPermissions.results.default');
	if (appName) {
		appPermissions = getAppPermissionsByName(state);
	}
	return {
		appName,
		appId: get(state, '$getCurrentApp.id'),
		permissions: get(appPermissions, 'results', []),
		isPaidUser: true,
		isOwner: true,
		isLoading: get(state, '$getAppPermissions.isFetching'),
		errors: [
			get(state, '$getAppPermissions.error'),
			get(state, '$createAppPermission.error'),
			get(state, '$deleteAppPermission.error'),
			get(state, '$updateAppPermission.error'),
			get(state, '$deleteApp.error'),
		],
	};
};
const mapDispatchToProps = dispatch => ({
	fetchPermissions: appName => dispatch(getPermission(appName)),
	handleCreatePermission: (appName, payload) => dispatch(createPermission(appName, payload)),
	handleDeletePermission: (appName, username) => dispatch(deletePermission(appName, username)),
	handleEditPermission: (appName, username, payload) => dispatch(updatePermission(appName, username, payload)),
	handleDeleteApp: appId => dispatch(deleteApp(appId)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(Credentials);
