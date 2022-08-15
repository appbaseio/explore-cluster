import React from 'react';
import get from 'lodash/get';
import { css } from 'emotion';
import { Card, Input, Button, Tooltip, Tag } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import Grid from '../CreateCredentials/Grid';
import StoredQueryResponse from './StoredQueryResponse';
import { clearAppStoredQueries, getAppStoredQuery } from '../../batteries/modules/actions';
import Flex from '../../batteries/components/shared/Flex';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';
import ReviewChanges from './ReviewChanges';

const main = css`
	.error {
		color: tomato;
		margin-top: 8px;
	}
	.actionBtn {
		position: absolute;
		right: 50px;
	}

	.actionBtn button {
		margin: 2px 10px;
	}
	span {
		white-space: nowrap;
	}

	.top-row {
		margin-bottom: 30px;
		@media only screen and (max-width: 1200px) {
			margin-top: 50px;
		}

		@media only screen and (max-width: 850px) {
			margin-top: 80px;
		}

		@media only screen and (max-width: 600px) {
			margin-top: 110px;
		}
	}

	.top-row input {
		width: 100%;
		max-width: 200px;
		@media only screen and (max-width: 500px) {
		}
	}

	.query-validation-tag.ant-tag {
		position: absolute;
		right: 48px;
		margin: 0;
		transform: translateY(-28px);
	}
	.actionBtn {
		position: absolute;
		right: 50px;
	}

	.actionBtn button {
		margin: 2px 10px;
	}
	span {
		white-space: nowrap;
	}
`;

const queryMessage = () => (
	<div style={{ width: 500, padding: '10px' }}>
		Query is a templatised search query that accepts these parameters:
		<br />
		<br />⇒ <mark>index</mark>: optional Index (or an index pattern: <mark>*</mark> and{' '}
		<mark>,</mark> separated indices are supported) to apply the stored query to. When
		specified, the stored query can be only be executed against an index matching the pattern.
		<br />
		<br />⇒ <mark>query</mark>: Elasticsearch query, supports the entire Query DSL. Use{' '}
		<mark>{'{{ $param }}'}</mark> to create a parameter.
		<br />
		<br />⇒ <mark>params</mark>: <i>optional</i> A params object containing the initial
		parameter values to execute for the query. If specified, parameters are optional to specify
		at query time.
		<br />
		<br />
		Example:
		<pre>
			{JSON.stringify(
				{
					index: 'movies-app',
					query: {
						query: {
							term: {
								title: '{{title}}',
							},
						},
						size: '{{size}}',
					},
					params: {
						title: 'search for these words',
						size: 5,
					},
				},
				0,
				2,
			)}
		</pre>
	</div>
);

class CreateStoredQuery extends React.Component {
	constructor(props) {
		super(props);
		const {
			storedQuery: { params, query, id, description, index },
		} = this.props;
		this.state = {
			openReviewSave: false,
			queryResponseTitle: '',
			defaultData: {
				id: id ?? '',
				description: description ?? '',
				query: id
					? JSON.stringify(
							{
								query,
								params,
								index,
							},
							0,
							4,
					  )
					: JSON.stringify(
							{
								query: {},
								params: {},
								index: '',
							},
							0,
							4,
					  ),
			},
			updatedData: null,
			isQueryExecuted: undefined,
		};
		const editMode = !!props.storedQuery.id;
		const idControl = props.control.get('id');
		if (editMode) {
			props.control.patchValue({
				id,
				description,
				query: JSON.stringify(
					{
						query,
						params,
						index,
					},
					0,
					4,
				),
			});
			idControl.disable();
		} else {
			idControl.enable();
		}
	}

	componentWillUnmount() {
		const { control } = this.props;
		control.reset();
	}

	handleReviewSave = () => {
		const { control } = this.props;

		const updatedData = {
			id: control.get('id').value,
			description: control.get('description').value,
			query: control.get('query').value,
		};
		this.setState({ openReviewSave: true, updatedData });
	};

	handleCancel = () => {
		this.setState({ openReviewSave: false });
	};

	handleValidateAndRender = async () => {
		const { clearStoredQueries, handleValidateStoredQuery } = this.props;
		clearStoredQueries();
		if (await handleValidateStoredQuery()) {
			this.setState({
				queryResponseTitle: 'Rendered Query',
			});
		}
	};

	handleExecute = async () => {
		const { clearStoredQueries, handleExecuteStoredQuery } = this.props;
		clearStoredQueries();
		if (await handleExecuteStoredQuery()) {
			this.setState({
				queryResponseTitle: 'Executed Query',
				isQueryExecuted: true,
			});
		} else {
			this.setState({ isQueryExecuted: false });
		}
	};

	handleEditorValueChange = (value, queryControl) => {
		const { isQueryExecuted } = this.state;
		if (isQueryExecuted) {
			this.setState({
				...(isQueryExecuted && { isQueryExecuted: undefined }),
			});
		}
		queryControl.setValue(value);
	};

	renderQueryValidityTag = (tagValidator) => {
		if (typeof tagValidator !== 'boolean') {
			return null;
		}
		const tagText = tagValidator ? 'Valid Query' : 'Inavlid Query';
		const tagColor = tagValidator ? 'green' : 'red';

		return (
			<Tag className="query-validation-tag" color={tagColor}>
				{tagText}
			</Tag>
		);
	};

	render() {
		const { isExecuting, isValidating, control, handleSaveStoredQuery, isLoading } = this.props;
		const { openReviewSave, defaultData, updatedData, queryResponseTitle, isQueryExecuted } =
			this.state;
		if (isLoading) {
			return <Loader />;
		}
		return (
			<FieldGroup
				control={control}
				strict={false}
				render={({ get: getControl }) => (
					<React.Fragment>
						<Card
							className={main}
							bodyStyle={{
								padding: '24px 50px',
							}}
						>
							<div className="actionBtn">
								<Tooltip
									placement="topLeft"
									title="Verify the validity of the query and render the query based on the parameter values."
								>
									<Button
										disabled={getControl('query').invalid}
										onClick={this.handleValidateAndRender}
										loading={isValidating}
										data-cy="sq-validate"
									>
										Render Query
									</Button>
								</Tooltip>
								<Tooltip
									placement="topLeft"
									title="Execute the query, this will return the results back."
								>
									<Button
										disabled={getControl('query').invalid}
										onClick={this.handleExecute}
										loading={isExecuting}
										data-cy="sq-execute"
									>
										Execute Query
									</Button>
								</Tooltip>

								<Button
									disabled={getControl('query').invalid || !isQueryExecuted}
									onClick={this.handleReviewSave}
									data-cy="sq-review-and-save"
								>
									Review & Save
								</Button>
							</div>

							<Grid
								toolTipMessage="Identifier for your query which can be used while querying with ReactiveSearch API or directly invoking stored query endpoints."
								toolTipProps={{
									overlayClassName: css`
										.ant-tooltip-inner {
											background-color: #000;
										}
									`,
								}}
								className="top-row"
								gridRatio={0.15}
								label="Stored Query Id"
								component={
									<FieldControl
										name="id"
										render={({
											handler,
											touched,
											hasError,
											invalid: invalidName,
										}) => {
											const isError = touched && invalidName;
											return (
												<Flex
													flexDirection="column"
													alignItems="flex-start"
												>
													<Input
														style={{
															...(isError && {
																borderColor: 'tomato',
															}),
														}}
														{...handler()}
														data-cy="stored-query-id"
														placeholder="your_unique_id"
													/>
													{isError && (
														<span className="error">
															{(hasError('required') &&
																'Enter an id for your stored query') ||
																(hasError('pattern') &&
																	`Stored query id cannot use spaces and special characters.`)}
														</span>
													)}
												</Flex>
											);
										}}
									/>
								}
							/>
							<Grid
								toolTipMessage="Provide an optional description for your stored query."
								toolTipProps={{
									overlayClassName: css`
										.ant-tooltip-inner {
											background-color: #000;
										}
									`,
								}}
								gridRatio={0.15}
								label="Query Description"
								component={
									<FieldControl
										name="description"
										render={({
											handler,
											touched,
											invalid: invalidDescription,
										}) => {
											const isError = touched && invalidDescription;
											return (
												<Flex alignItems="center" css="flex: 1">
													<Input
														style={{
															maxWidth: 400,
															...(isError && {
																borderColor: 'tomato',
															}),
														}}
														{...handler()}
														data-cy="stored-query-description"
														placeholder="A human friendly 👦 👧 description for this stored query"
													/>
												</Flex>
											);
										}}
									/>
								}
							/>
							{this.renderQueryValidityTag(isQueryExecuted)}
							<Grid
								toolTipMessage={queryMessage}
								toolTipProps={{
									overlayClassName: css`
										width: 500px;
										max-width: 500px;
										.ant-tooltip-inner {
											background-color: #000;
										}
									`,
								}}
								gridRatio={0.15}
								label="Query"
								component={
									<FieldControl
										name="query"
										render={() => {
											return (
												<Monaco
													defaultValue={defaultData.query}
													language="json"
													value={control.controls.query.value}
													onChange={(value) =>
														this.handleEditorValueChange(
															value,
															control.controls.query,
														)
													}
													theme="vs-dark"
													options={{
														cursorStyle: 'line',
														lineNumbersMinChars: 2,
														fontFamily: 'Monaco, monospace',
														fontSize: 14,
														padding: {
															top: 10,
															bottom: 10,
														},
														minimap: {
															enabled: false,
														},
													}}
													readOnly={false}
													height="300px"
												/>
											);
										}}
									/>
								}
							/>
						</Card>
						<StoredQueryResponse queryResponseTitle={queryResponseTitle} />
						{openReviewSave && (
							<ReviewChanges
								openReviewSave={openReviewSave}
								defaultData={defaultData}
								updatedData={updatedData}
								handleCancel={this.handleCancel}
								handleSaveStoredQuery={handleSaveStoredQuery}
							/>
						)}
					</React.Fragment>
				)}
			/>
		);
	}
}
CreateStoredQuery.defaultProps = {
	storedQuery: {},
};
CreateStoredQuery.propTypes = {
	fetchStoredQuery: PropTypes.func.isRequired,
	isExecuting: PropTypes.bool.isRequired,
	isValidating: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	// component props
	storedQuery: PropTypes.object,
	control: PropTypes.object.isRequired,
	handleSaveStoredQuery: PropTypes.func.isRequired,
	handleValidateStoredQuery: PropTypes.func.isRequired,
	handleExecuteStoredQuery: PropTypes.func.isRequired,
	clearStoredQueries: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$getAppStoredQuery.isFetching', false),
	isExecuting: get(state, '$executeAppStoredQuery.isFetching', false),
	isValidating: get(state, '$validateAppStoredQuery.isFetching', false),
});

const mapDispatchToProps = (dispatch) => ({
	fetchStoredQuery: (id) => dispatch(getAppStoredQuery(id)),
	clearStoredQueries: () => dispatch(clearAppStoredQueries()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateStoredQuery);
