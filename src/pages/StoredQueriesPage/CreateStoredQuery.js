import React from 'react';
import get from 'lodash/get';
import { css } from 'emotion';
import { Card, Input, Button, Tooltip } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Loader from '../../batteries/components/shared/Loader/Spinner';
import Grid from '../../components/CreateCredentials/Grid';
import StoredQueryResponse from './StoredQueryResponse';
import { clearAppStoredQueries, getAppStoredQuery } from '../../batteries/modules/actions';
import Flex from '../../batteries/components/shared/Flex';
import Monaco from '../../batteries/components/SearchSandbox/containers/MonacoEditor';
import ReviewChanges from './ReviewChanges';

const main = css`
	.error {
		color: tomato;
		margin-left: 15px;
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

	handleValidateAndRender = () => {
		const { clearStoredQueries, handleValidateStoredQuery } = this.props;
		clearStoredQueries();
		handleValidateStoredQuery();
		this.setState({
			queryResponseTitle: 'Rendered Query',
		});
	};

	handleExecute = () => {
		const { clearStoredQueries, handleExecuteStoredQuery } = this.props;
		clearStoredQueries();
		handleExecuteStoredQuery();
		this.setState({
			queryResponseTitle: 'Executed Query',
		});
	};

	render() {
		const { isExecuting, isValidating, control, handleSaveStoredQuery, isLoading } = this.props;
		const { openReviewSave, defaultData, updatedData, queryResponseTitle } = this.state;
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
										style={{
											margin: '0 10px',
										}}
										disabled={getControl('query').invalid}
										onClick={this.handleValidateAndRender}
										loading={isValidating}
										data-cy="sq-validate"
									>
										Validate and Render
									</Button>
								</Tooltip>
								<Tooltip
									placement="topLeft"
									title="Execute the query, this will return the results back."
								>
									<Button
										style={{
											margin: '0 10px',
										}}
										disabled={getControl('query').invalid}
										onClick={this.handleExecute}
										loading={isExecuting}
										data-cy="sq-execute"
									>
										Execute Query
									</Button>
								</Tooltip>

								<Button
									style={{
										margin: '0 10px',
									}}
									disabled={getControl('query').invalid}
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
												<Flex alignItems="center">
													<Input
														style={{
															width: 200,
															...(isError && {
																borderColor: 'tomato',
															}),
														}}
														{...handler()}
														data-cy="stored-query-id"
													/>
													{isError && (
														<span className="error">
															{(hasError('required') &&
																'Please enter Stored Query Id.') ||
																(hasError('pattern') &&
																	'Stored Query Id can not have spaces or special characters.')}
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
												<Flex alignItems="center">
													<Input
														style={{
															width: 400,
															...(isError && {
																borderColor: 'tomato',
															}),
														}}
														{...handler()}
														data-cy="stored-query-description"
													/>
												</Flex>
											);
										}}
									/>
								}
							/>
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
													defaultValue={JSON.stringify(
														{
															query: {},
															params: {},
														},
														0,
														4,
													)}
													language="json"
													value={control.controls.query.value}
													onChange={(value) =>
														control.controls.query.setValue(value)
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
