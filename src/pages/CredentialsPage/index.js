import React, { Component } from 'react';
import get from 'lodash/get';
import { Card, Table, Tooltip, Button, Alert, Typography, Icon, Result } from 'antd';
import { connect } from 'react-redux';
import { string, func, bool, array } from 'prop-types';
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
} from '../../batteries/modules/actions';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import { getURL } from '../../constants/config';
import DeleteAppModal from '../../components/AppCard/DeleteAppModal';

const columns = [
	{
		title: 'Type',
		key: 'description',
		render: ({ permissionInfo }) => (
			<span>
				{permissionInfo.expired ? (
					<Tooltip
						placement="topLeft"
						title="It seems like the permission has been expired."
					>
						<Icon
							style={{ color: 'orange', fontSize: 16, cursor: 'pointer' }}
							type="warning"
						/>
					</Tooltip>
				) : null}{' '}
				{permissionInfo.description || 'No Description'}
			</span>
		),
		width: '50%',
		disabled: true,
	},
	{
		title: 'Credentials',
		render: (permission) => <Permission {...permission} />,
		key: 'credentials',
		width: '50%',
	},
];

class Credentials extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showCredForm: false,
			deleteModal: false,
			currentPermissionInfo: undefined,
		};
	}

	componentDidMount() {
		const { isAdmin } = this.props;
		if (isAdmin) {
			this.refetchPermissions();
		}
	}

	componentDidUpdate(prevProps) {
		const { appName, errors } = this.props;
		if (prevProps.appName !== appName) {
			this.initialize();
		}
		displayErrors(errors, prevProps.errors);
	}

	handleDeleteModal = () => {
		const { deleteModal: currentValue } = this.state;
		this.setState({
			deleteModal: !currentValue,
		});
	};

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

	handleSubmit = (form, username) => {
		const { currentPermissionInfo } = this.state;
		if (currentPermissionInfo || username) {
			this.updatePermission(form.mappedValues, username);
		} else {
			this.newPermission(form.mappedValues);
		}
	};

	deleteApp = () => {
		window.location = window.origin;
	};

	render() {
		const { showCredForm, currentPermissionInfo, mappings, deleteModal } = this.state;
		const { isLoading, permissions, isOwner, location, appName, appId, isAdmin } = this.props;
		if (isLoading) {
			return <Loader />;
		}
		if (!isAdmin) {
			return (
				<Container>
					<Result
						status="403"
						title="401"
						subTitle="Sorry, you are not authorized to access this page. Please contact your admin."
					/>
				</Container>
			);
		}
		return (
			<Container>
				<Card
					title="Credentials"
					extra={
						<a
							href="https://docs.appbase.io/docs/security/Credentials/"
							rel="noopener noreferrer"
							target="_blank"
						>
							Read Docs
						</a>
					}
				>
					<h4>Host URL for this cluster:</h4>
					<Alert
						message={
							<Typography.Paragraph
								style={{ marginBottom: 0 }}
								copyable={{ text: getURL() }}
							>
								{getURL()}
							</Typography.Paragraph>
						}
						type="info"
						css={{ marginBottom: 20 }}
					/>
					<Table
						scroll={{ x: 700 }}
						dataSource={permissions.map((permission) => ({
							permissionInfo: permission,
							deletePermission: this.deletePermission,
							showForm: this.showForm,
						}))}
						rowKey={(row) =>
							`${get(row, 'permissionInfo.username')}${get(
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
				{isOwner && location.pathname !== '/cluster/credentials' && (
					<Tooltip
						placement="rightTop"
						title="Deleting an app is a permanent action, and will delete all the associated data, credentials and team sharing settings."
					>
						<Button
							onClick={this.handleDeleteModal}
							style={{
								margin: '10px 10px',
								float: 'right',
							}}
							type="danger"
							size="large"
						>
							Delete Index
						</Button>
					</Tooltip>
				)}

				<DeleteAppModal
					appName={appName}
					onDelete={this.deleteApp}
					appId={appId}
					deleteModal={deleteModal}
					handleDeleteModal={this.handleDeleteModal}
				/>
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
	isAdmin: bool.isRequired,
	isLoading: bool,
	errors: array.isRequired,
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
		isAdmin: get(state, 'user.data.isAdmin', false),
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
const mapDispatchToProps = (dispatch) => ({
	fetchPermissions: (appName) => dispatch(getPermission(appName)),
	handleCreatePermission: (appName, payload) => dispatch(createPermission(appName, payload)),
	handleDeletePermission: (appName, username) => dispatch(deletePermission(appName, username)),
	handleEditPermission: (appName, username, payload) =>
		dispatch(updatePermission(appName, username, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Credentials);
