import React from 'react';
import { connect } from 'react-redux';
import { Select, Form, Tooltip } from 'antd';
import { css } from 'emotion';
import { string, func, bool, object, element, array } from 'prop-types';
import get from 'lodash/get';
import { FieldControl } from 'react-reactive-form';
import { getAppMappings } from '../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { traverseMapping } from '../../batteries/utils/mappings';

const selectCls = css`
	.ant-select-selection {
		border-color: tomato;
	}
`;
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
		};
	}

	componentDidMount() {
		const { appbaseCredentials } = this.props;
		if (appbaseCredentials) {
			this.getMappings();
		}
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
		const { index, loading, fetchMappings, appbaseCredentials, mappings } = this.props;
		if (!loading && !mappings && appbaseCredentials) {
			fetchMappings(index, appbaseCredentials);
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

	renderOptions() {
		const { traversedMappings } = this.state;
		const { withoutSuffix } = this.props;
		return traversedMappings.map((v) => {
			const value = v.split('.keyword')[0];
			return (
				<Select.Option key={withoutSuffix ? value : v} title={v}>
					{value}
				</Select.Option>
			);
		});
	}

	render() {
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
		} = this.props;
		const { traversedMappings } = this.state;
		const selectPropsCalculated = {
			placeholder: 'Select data field',
			loading,
			showSearch: true,
			notFoundContent: null,
			style: {
				width: 200,
			},
			...selectProps,
		};
		const withFormItem = (child) => <Form.Item {...formItemProps}>{child}</Form.Item>;

		if (control || name) {
			return (
				<FieldControl strict={false} name={name} control={control} {...controlProps}>
					{({ value, handler, disabled, touched, invalid }) => {
						const inputHandler = handler();
						if (hideOnDisabled && disabled) {
							return null;
						}
						const child = (
							<>
								{inputHandler.value &&
								traversedMappings.length &&
								!traversedMappings.includes(inputHandler.value) ? (
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
								<Select
									className={touched && invalid ? selectCls : undefined}
									placeholder="Select field"
									allowClear
									{...selectPropsCalculated}
									{...inputHandler}
									value={
										inputHandler.value
											? inputHandler.value.split('.keyword')[0]
											: undefined
									}
									onSelect={(val) => {
										if (value === val) {
											// To unselect
											inputHandler.onChange(undefined);
										} else {
											inputHandler.onChange(val);
											if (setFieldType) {
												setFieldType(
													mappings?.properties[val.split('.keyword')[0]]
														?.type,
												);
											}
										}
										handleReload();
									}}
									onFocus={this.getMappings}
								>
									{addOptions}
									{this.renderOptions()}
								</Select>
							</>
						);
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
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DataFieldSelector);
