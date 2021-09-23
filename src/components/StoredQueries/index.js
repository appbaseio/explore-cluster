import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, Card, notification } from 'antd';
import get from 'lodash/get';
import { FormBuilder, Validators } from 'react-reactive-form';
import Text from 'antd/lib/typography/Text';
import { displayErrors } from '../../utils/helper';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import Container from '../Container';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import {
	deleteAppStoredQuery,
	executeAppStoredQuery,
	getAppStoredQueries,
	saveAppStoredQuery,
	validateAppStoredQuery,
} from '../../batteries/modules/actions';
import Actions from './Actions';
import CreateStoredQuery from './CreateStoredQuery';
import GetAPIEndpoint from './GetAPIEndpoint';
import { errorMessageTemplate, jsonValidator } from './utils';
import ErrorToaster from '../../batteries/components/shared/ErrorToaster';
import { event, timingEvent } from '../../utils/gtag';
import moment from '../../utils/moment';

const columns = [
	{
		title: 'Name',
		dataIndex: 'id',
		key: 'id',
		width: '17%',
	},
	{
		title: 'Description',
		key: 'description',
		width: '48%',
		render: (item) => {
			const { description } = item;
			return <Text disabled={!description}>{description || 'No description'}</Text>;
		},
	},
	{
		title: 'Actions',
		key: 'actions',
		width: '35%',
		render: (item) => {
			const { handleRender, handleEdit, handleDelete, ...rest } = { ...item };
			return (
				<Actions
					handleRender={() => handleRender({ ...rest })}
					handleEdit={() => handleEdit({ ...rest })}
					handleDelete={() => handleDelete(rest.id)}
				/>
			);
		},
	},
];
class StoredQueries extends React.Component {
	constructor(props) {
		super(props);
		this.startTime = moment();
		this.state = {
			createMode: false,
			editMode: false,
			copyEndpoint: false,
			currentStoredQuery: {},
		};
		this.getStoredQueries();
		this.form = FormBuilder.group({
			id: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9-_]+$/)]],
			description: '',
			query: [
				JSON.stringify(
					{
						query: {},
						params: {},
						index: '',
					},
					0,
					4,
				),
				[Validators.required, jsonValidator],
			],
		});
		this.bannerProps = {
			default: {
				title: 'Stored Queries',
				description:
					'GUI to manage your stored queries. Use them as direct REST APIs or with ReactiveSearch API.',
				buttonText: 'Create Stored Query',
				icon: 'plus',
				onClick: () => this.toggleCreateMode(),
			},
			create: {
				title: 'Create a new Stored Query',
				buttonText: 'Read More',
				showGoBack: true,
				goBackText: 'Go back to Stored Queries',
				onClickGoBack: () => this.toggleCreateMode(),
				href: 'https://docs.appbase.io/docs/data/stored-queries/',
			},
			edit: {
				title: 'Edit Stored Query',
				buttonText: 'Read More',
				showGoBack: true,
				goBackText: 'Go back to Stored Queries',
				onClickGoBack: () => this.toggleEditMode(),
				href: 'https://docs.appbase.io/docs/data/stored-queries/',
			},
		};
	}

	componentDidMount() {
		// triggering custom event for google analytics
		event({
			action: 'Stored Queries',
			category: 'Develop',
			label: 'visit',
			value: null,
		});
	}

	componentDidUpdate(prevProps) {
		const { errors } = this.props;
		displayErrors(errors, prevProps.errors, true);
	}

	componentWillUnmount() {
		// Sends the timing event to Google Analytics.
		timingEvent({
			action: 'timing_complete',
			category: 'Develop',
			label: 'stored-queries-time',
			name: 'time',
			value: this.startTime.fromNow(),
		});
	}

	get bannerDetails() {
		const { createMode, editMode } = this.state;
		if (editMode) {
			return this.bannerProps.edit;
		}
		if (createMode) {
			return this.bannerProps.create;
		}
		return this.bannerProps.default;
	}

	getStoredQueries = () => {
		const { fetchStoredQueries } = this.props;
		fetchStoredQueries();
	};

	toggleCreateMode = (status) => {
		this.form.reset();
		this.setState((prevState) => ({
			createMode: status === undefined ? !prevState.createMode : status,
			currentStoredQuery: {},
		}));
	};

	toggleEditMode = (status) => {
		this.setState((prevState) => ({
			currentStoredQuery: {
				...(prevState.editMode
					? null
					: {
							...prevState.currentStoredQuery,
					  }),
			},
			editMode: status === undefined ? !prevState.editMode : status,
		}));
	};

	togglecopyEndpoint = (status) => {
		this.setState((prevState) => ({
			currentStoredQuery: {
				...(prevState.copyEndpoint
					? null
					: {
							...prevState.currentStoredQuery,
					  }),
			},
			copyEndpoint: status === undefined ? !prevState.copyEndpoint : status,
		}));
	};

	handleDelete = (id) => {
		const { deleteStoredQuery } = this.props;
		deleteStoredQuery(id).then((action) => {
			if (get(action, 'payload.code') === 200) {
				notification.success({
					message: 'Stored Query deleted successfully.',
				});
				this.getStoredQueries();
			}
		});
	};

	handleEdit = (item) => {
		this.setState(
			{
				currentStoredQuery: {
					...item,
				},
			},
			this.toggleEditMode,
		);
	};

	handleRender = (item) => {
		this.setState(
			{
				currentStoredQuery: {
					...item,
				},
			},
			this.togglecopyEndpoint,
		);
	};

	constructPayload = () => {
		const { appName } = this.props;
		const {
			currentStoredQuery: { index },
		} = this.state;
		const { get: getValue } = this.form;
		const id = getValue('id').value;
		const { query, params, index: formIndexValue } = JSON.parse(getValue('query').value);
		const description = getValue('description').value;
		if (!query) {
			throw new Error(errorMessageTemplate('query', 'save'));
		}
		if (!formIndexValue) {
			throw new Error(errorMessageTemplate('index', 'save'));
		}
		return { index: formIndexValue || index || appName || '', id, query, params, description };
	};

	handleValidateStoredQuery = (isAutoValidation: boolean) => {
		const { validateStoredQuery } = this.props;
		const { query } = this.form.value;

		try {
			const queryControl = this.form.get('query');
			const requestBody = JSON.parse(query);
			if (!requestBody) {
				return false;
			}
			if (!requestBody.params) {
				throw new Error(errorMessageTemplate('params', 'validate'));
			}
			if (!requestBody.query) {
				throw new Error(errorMessageTemplate('query', 'validate'));
			}
			if (!queryControl.valid) {
				throw new Error(errorMessageTemplate('invalid json', 'validate'));
			}
			return validateStoredQuery({
				...requestBody,
			}).then((action) => {
				if (get(action, 'payload') && !isAutoValidation) {
					window.scrollTo({
						top: window.innerHeight,
						behavior: 'smooth',
					});
				}
				return !get(action, 'error'); // signifies it's a valid/ invalid query
			});
		} catch (error) {
			notification.error({
				message: error.message,
				duration: 1.5,
			});
			return false; // signifies it's an invalid query
		}
	};

	handleExecuteStoredQuery = () => {
		const { executeStoredQuery } = this.props;

		const { query } = this.form.value;

		try {
			const queryControl = this.form.get('query');
			const requestBody = JSON.parse(query);
			if (!requestBody.params) {
				throw new Error(errorMessageTemplate('params', 'execute'));
			}
			if (!requestBody.index) {
				throw new Error(errorMessageTemplate('index', 'execute'));
			}
			if (!requestBody.query) {
				throw new Error(errorMessageTemplate('query', 'execute'));
			}
			if (!queryControl.valid) {
				throw new Error(errorMessageTemplate('invalid json', 'execute'));
			}
			return executeStoredQuery({
				...requestBody,
			}).then((action) => {
				if (get(action, 'payload')) {
					window.scrollTo({
						top: window.innerHeight,
						behavior: 'smooth',
					});
				}
				return !get(action, 'error'); // signifies it's a successful/ failed execution of query
			});
		} catch (error) {
			notification.error({
				message: error.message,
				duration: 1.5,
			});
			return false;
		}
	};

	handleSaveStoredQuery = () => {
		const { saveStoredQuery } = this.props;
		try {
			const { id, ...rest } = this.constructPayload();
			saveStoredQuery(id, {
				...rest,
			}).then((action) => {
				if (get(action, 'payload.code') === 200) {
					notification.success({
						message: 'Stored Query saved successfully.',
					});
					this.toggleEditMode(false);
					this.toggleCreateMode(false);
					this.getStoredQueries();
				}
			});
		} catch (e) {
			notification.error({
				message: e.message || 'There was a problem saving the query.',
				duration: 1.5,
			});
		}
	};

	render() {
		const { createMode, editMode, currentStoredQuery, copyEndpoint } = this.state;
		const { isLoading, storedQueries, isDeleting } = this.props;
		const isDefault = !(createMode || editMode);
		if (isLoading && !(Array.isArray(storedQueries) && storedQueries.length)) {
			return <Loader />;
		}

		return (
			<React.Fragment>
				<Banner {...this.bannerDetails} />
				<Container>
					<>
						{isDefault && (
							<Card
								style={
									isDeleting
										? {
												pointerEvents: 'none',
												opacity: 0.6,
										  }
										: null
								}
							>
								<Table
									rowKey={({ id, index }) => `${id}${index}`}
									dataSource={
										Array.isArray(storedQueries) &&
										storedQueries.map((item) => ({
											handleDelete: this.handleDelete,
											handleEdit: this.handleEdit,
											handleRender: this.handleRender,
											...item,
										}))
									}
									columns={columns}
								/>
							</Card>
						)}
						{(createMode || editMode) && (
							<ErrorToaster inline>
								<CreateStoredQuery
									handleValidateStoredQuery={this.handleValidateStoredQuery}
									handleExecuteStoredQuery={this.handleExecuteStoredQuery}
									handleSaveStoredQuery={this.handleSaveStoredQuery}
									control={this.form}
									storedQuery={currentStoredQuery}
								/>
							</ErrorToaster>
						)}
						{copyEndpoint && (
							<ErrorToaster inline>
								<GetAPIEndpoint
									storedQueryId={currentStoredQuery.id}
									visible={copyEndpoint}
									handleCancel={this.togglecopyEndpoint}
								/>
							</ErrorToaster>
						)}
					</>
				</Container>
			</React.Fragment>
		);
	}
}

StoredQueries.defaultProps = {
	storedQueries: [],
	appName: '',
};

StoredQueries.propTypes = {
	isLoading: PropTypes.bool.isRequired,
	isDeleting: PropTypes.bool.isRequired,
	fetchStoredQueries: PropTypes.func.isRequired,
	saveStoredQuery: PropTypes.func.isRequired,
	executeStoredQuery: PropTypes.func.isRequired,
	deleteStoredQuery: PropTypes.func.isRequired,
	validateStoredQuery: PropTypes.func.isRequired,
	storedQueries: PropTypes.array,
	errors: PropTypes.array.isRequired,
	appName: PropTypes.string,
	plan: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
	plan: get(state, '$getAppPlan.results.plan'),
	storedQueries: get(state, '$getAppStoredQueries.results', []),
	isLoading: get(state, '$getAppStoredQueries.isFetching', false),
	isDeleting: get(state, '$deleteAppStoredQuery.isFetching', false),
	errors: [
		get(state, '$getAppStoredQueries.error'),
		get(state, '$saveAppStoredQuery.error'),
		get(state, '$deleteAppStoredQuery.error'),
		get(state, '$validateAppStoredQuery.error'),
		get(state, '$executeAppStoredQuery.error'),
	],
	appName: get(state, '$getCurrentApp.name'),
});

const mapDispatchToProps = (dispatch) => ({
	fetchStoredQueries: () => dispatch(getAppStoredQueries()),
	deleteStoredQuery: (id) => dispatch(deleteAppStoredQuery(id)),
	saveStoredQuery: (id, payload) => dispatch(saveAppStoredQuery(id, payload)),
	validateStoredQuery: (id, payload) => dispatch(validateAppStoredQuery(id, payload)),
	executeStoredQuery: (id, payload) => dispatch(executeAppStoredQuery(id, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StoredQueries);
