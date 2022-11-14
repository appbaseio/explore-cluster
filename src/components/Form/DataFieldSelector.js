import React from 'react';
import { connect } from 'react-redux';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Select, Tooltip, AutoComplete } from 'antd';
import { css } from 'emotion';
import { string, func, bool, object, element, array } from 'prop-types';
import get from 'lodash/get';
import { FieldControl } from 'react-reactive-form';
import { getAppMappings } from '../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { traverseMapping } from '../../batteries/utils/mappings';
import apisMapper from '../../pages/IntegrationsPage/utils/apisMapper';
import { getApiGeneralization } from '../../pages/IntegrationsPage/utils/be-apis';
import { BACKENDS } from '../../batteries/utils';
import { RANGE_FIELDS } from '../../constants';
import { transformGeneralMappingsToFusionArrayFormat } from '../../pages/IntegrationsPage/utils/fusion-apis';

const selectCls = css`
	.ant-select-selection {
		border-color: tomato;
	}
`;

const suggestionCls = css`
	display: flex;
	justify-content: space-between;
	.overflow {
		max-width: 145px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;
const fusionFieldSuffixes = {
	_dt: 'date',
};
class DataFieldSelector extends React.Component {
	constructor(props) {
		super(props);
		const { mappings, isAggFields, includeMappings, includeTypes } = props;
		const traversedMappings = traverseMapping(
			this.filterOutNestedTypes(mappings) || {},
			undefined,
			{
				isAggFields,
				includeMappings,
				includeTypes,
			},
		);
		this.filterOutNestedTypes(mappings);
		this.state = {
			traversedMappings: Array.isArray(traversedMappings) ? traversedMappings : [],
			dynamicFields: [],
			isInitial: true,
		};
		this.isFusion = props.backend === BACKENDS.FUSION.name;
	}

	componentDidMount() {
		const { appbaseCredentials, control } = this.props;
		if (appbaseCredentials) {
			this.getMappings();
		}
		if (control && control.value && this.isFusion) this.fetchFields(control.value);
	}

	componentDidUpdate(prevProps) {
		const {
			mappings,
			isAggFields,
			includeMappings,
			includeTypes,
			setFieldType,
			control,
			pipeline,
		} = this.props;
		if (prevProps.pipeline !== pipeline) {
			this.getMappings();
		}
		if (prevProps.mappings !== mappings) {
			if (control && control.value && mappings?.properties) {
				setFieldType(
					mappings?.properties[control.value.split('.keyword')[0]]?.type,
					control,
				);
			}

			const traversedMappings = traverseMapping(
				this.filterOutNestedTypes(mappings) || {},
				undefined,
				{
					isAggFields,
					includeMappings,
					includeTypes,
				},
			);
			// eslint-disable-next-line
			this.setState({
				traversedMappings: Array.isArray(traversedMappings) ? traversedMappings : [],
			});
		}
	}

	getMappings = () => {
		const { index, loading, fetchMappings, appbaseCredentials, mappings, backend } = this.props;
		if (!loading && !mappings && appbaseCredentials && !this.isFusion) {
			fetchMappings(index, appbaseCredentials, backend);
		}
	};

	filterOutNestedTypes = (mappings = { properties: {} }) => {
		const filteredMappings = { ...mappings };
		// eslint-disable-next-line no-unused-expressions
		Object.keys(filteredMappings.properties ?? {})?.forEach((key) => {
			if (filteredMappings.properties[key].type === 'nested') {
				delete filteredMappings.properties[key];
			}
		});

		return filteredMappings;
	};

	fetchFields = (query, state = 'initial') => {
		const { form, backend, endpoints } = this.props;
		const schemaConfig = endpoints?.schema || apisMapper[backend].schema || {};
		getApiGeneralization(schemaConfig, {
			index: form.get('profile') ? form.get('profile').value : 'appbase',
			q: query,
		})
			.then((res) => res.json())
			.then((res) => {
				if (Array.isArray(res))
					this.setState({
						dynamicFields: res,
					});
				else {
					const transformedResponse = transformGeneralMappingsToFusionArrayFormat(
						res[form.get('profile') ? form.get('profile').value : 'appbase'],
					);
					this.setState({
						dynamicFields: transformedResponse,
					});
				}
			})
			.catch((err) => {
				console.error('Error to fetch search query profiles', err);
				this.setState({
					dynamicFields: [],
				});
			});
		if (state !== 'initial') {
			this.setState({
				isInitial: false,
			});
		}
	};

	renderOptions() {
		const { traversedMappings } = this.state;
		const { withoutSuffix, mappings, showRangeFieldsOnly } = this.props;

		return traversedMappings.map((v) => {
			const value = v.split('.keyword')[0];
			const fieldType = mappings?.properties[value]?.type;
			if (showRangeFieldsOnly) {
				return (
					RANGE_FIELDS.includes(fieldType) && (
						<AutoComplete.Option key={withoutSuffix ? value : v} title={v}>
							{value}
						</AutoComplete.Option>
					)
				);
			}
			return (
				<AutoComplete.Option key={withoutSuffix ? value : v} title={v}>
					{value}
				</AutoComplete.Option>
			);
		});
	}

	render() {
		const { dynamicFields } = this.state;
		const {
			loading,
			control,
			name,
			controlProps,
			hideOnDisabled,
			wrapInsideForm,
			formItemProps,
			addOptions,
			selectProps,
			mappings,
			setFieldType,
			handleReload,
			includeHighlight,
		} = this.props;
		const { traversedMappings, isInitial } = this.state;
		const selectPropsCalculated = {
			placeholder: 'Select data field',
			loading,
			showSearch: true,
			notFoundContent: null,
			style: {
				width: 295,
			},
			...selectProps,
		};
		const withFormItem = (child) => <Form.Item {...formItemProps}>{child}</Form.Item>;

		if (control || name) {
			return (
				<FieldControl strict={false} name={name} control={control} {...controlProps}>
					{({ value, handler, disabled, touched, invalid }) => {
						const inputHandler = handler();
						let child;
						if (hideOnDisabled && disabled) {
							return null;
						}
						const fieldsArr = dynamicFields.map((i) => i.name);
						const [dataField = '', highlight = false] = (
							inputHandler.value || ''
						).split('~');

						if (this.isFusion) {
							child = (
								<>
									{dataField &&
									isInitial &&
									(!dynamicFields.length ||
										(dynamicFields.length &&
											!fieldsArr.includes(dataField))) ? (
										<Tooltip title="The provided field has no corresponding mappings with the pipeline">
											<span
												style={{ color: 'orange', marginRight: 10 }}
												role="img"
												aria-label="warning"
											>
												⚠️
											</span>
										</Tooltip>
									) : null}
									<AutoComplete
										className={touched && invalid ? selectCls : undefined}
										placeholder="Select dynamic field"
										allowClear
										{...selectPropsCalculated}
										{...inputHandler}
										onSearch={(val) => {
											if (includeHighlight)
												inputHandler.onChange(`${val}~${highlight}`);
											else inputHandler.onChange(val);
											this.fetchFields(val, 'fetching');
										}}
										value={dataField || undefined}
										onSelect={(val) => {
											if (value === val) {
												// To unselect
												if (includeHighlight)
													inputHandler.onChange(`~${highlight}`);
												else inputHandler.onChange(undefined);
											} else {
												if (includeHighlight)
													inputHandler.onChange(`${val}~${highlight}`);
												else inputHandler.onChange(val);

												if (setFieldType) {
													const matchedSuffix = Object.keys(
														fusionFieldSuffixes,
													).find((suffix) => val.endsWith(suffix));
													setFieldType(
														fusionFieldSuffixes[matchedSuffix],
													);
												}
											}
											handleReload();
										}}
										optionLabelProp="title"
									>
										{dataField ? (
											(dynamicFields || []).map((k, idx) => {
												return (
													<AutoComplete.Option
														// eslint-disable-next-line
														key={`${k.name}-${idx}`}
														title={k.name}
														value={k.name}
													>
														<div
															className={suggestionCls}
															onClick={() => {
																setFieldType(k.type);
															}}
														>
															<div className="overflow">{k.name}</div>
															<div>{k.docCount}</div>
														</div>
													</AutoComplete.Option>
												);
											})
										) : (
											<AutoComplete.Option
												key="empty-query"
												value="empty-query"
												disabled
											>
												Enter a character to see field suggestions
											</AutoComplete.Option>
										)}
									</AutoComplete>
								</>
							);
						} else {
							child = (
								<>
									{dataField &&
									traversedMappings.length &&
									!traversedMappings.includes(dataField) ? (
										<Tooltip title="The provided field has no corresponding mappings with the pipeline">
											<span
												style={{ color: 'orange', marginRight: 10 }}
												role="img"
												aria-label="warning"
											>
												⚠️
											</span>
										</Tooltip>
									) : null}
									<AutoComplete
										className={touched && invalid ? selectCls : undefined}
										placeholder="Select field"
										allowClear
										{...selectPropsCalculated}
										{...inputHandler}
										value={
											dataField ? dataField.split('.keyword')[0] : undefined
										}
										filterOption={(inputValue, option) =>
											option.props.children
												.toUpperCase()
												.indexOf(inputValue.toUpperCase()) !== -1
										}
										onSelect={(val) => {
											if (value === val) {
												// To unselect
												if (includeHighlight)
													inputHandler.onChange(`~${highlight}`);
												else inputHandler.onChange(undefined);
											} else {
												if (includeHighlight)
													inputHandler.onChange(`${val}~${highlight}`);
												else inputHandler.onChange(val);
												if (setFieldType) {
													setFieldType(
														mappings?.properties[
															val.split('.keyword')[0]
														]?.type,
													);
												}
											}
											handleReload();
										}}
										onFocus={this.getMappings}
									>
										{addOptions}
										{this.renderOptions()}
									</AutoComplete>
								</>
							);
						}
						if (wrapInsideForm) {
							return withFormItem(child);
						}
						return child;
					}}
				</FieldControl>
			);
		}
		return (
			<Select
				placeholder="Select field"
				{...selectPropsCalculated}
				onFocus={this.getMappings}
				allowClear
			>
				{this.renderOptions()}
			</Select>
		);
	}
}
DataFieldSelector.defaultProps = {
	mappings: null,
	controlProps: null,
	control: null,
	name: undefined,
	loading: false,
	isAggFields: false,
	hideOnDisabled: false,
	wrapInsideForm: false,
	formItemProps: null,
	addOptions: null,
	selectProps: null,
	includeMappings: undefined,
	includeTypes: undefined,
	setFieldType: null,
	withoutSuffix: false,
	pipeline: '',
	handleReload: () => {},
	form: {},
	backend: BACKENDS.ELASTICSEARCH.name,
	includeHighlight: false,
	showRangeFieldsOnly: false,
	endpoints: {},
};

DataFieldSelector.propTypes = {
	appbaseCredentials: string.isRequired,
	hideOnDisabled: bool,
	index: string.isRequired,
	fetchMappings: func.isRequired,
	name: string,
	loading: bool,
	control: object,
	controlProps: object,
	selectProps: object,
	mappings: object,
	isAggFields: bool,
	wrapInsideForm: bool,
	formItemProps: object,
	addOptions: element,
	includeMappings: array,
	includeTypes: array,
	setFieldType: func,
	withoutSuffix: bool,
	pipeline: string,
	handleReload: func,
	form: object,
	backend: string,
	includeHighlight: bool,
	showRangeFieldsOnly: bool,
	endpoints: object,
};

const mapStateToProps = (state, props) => {
	const mappings = getRawMappingsByAppName(state, props.pipeline);
	const { username, password } = get(state, 'user.data', {});
	const index = props.pipeline || get(state, '$getCurrentApp.name');
	return {
		appbaseCredentials: username ? `${username}:${password}` : null,
		index,
		mappings,
		loading: get(state, '$getAppMappings.isFetching'),
		backend: get(state, '$getAppPlan.results.backend'),
		endpoints: get(state, 'endpoints.data'),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, backend) =>
		dispatch(getAppMappings(appName, credentials, undefined, backend)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DataFieldSelector);
