import React from 'react';
import { connect } from 'react-redux';
import { Select, Form } from 'antd';
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
		const traversedMappings = traverseMapping(mappings || {}, undefined, {
			isAggFields,
			includeMappings,
			includeTypes,
		});
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
		const { mappings, isAggFields, includeMappings, includeTypes, setFieldType, control } =
			this.props;
		if (prevProps.mappings !== mappings) {
			if (control && control.value && mappings?.properties) {
				setFieldType(
					mappings?.properties[control.value.split('.keyword')[0]]?.type,
					control,
				);
			}

			const traversedMappings = traverseMapping(mappings || {}, undefined, {
				isAggFields,
				includeMappings,
				includeTypes,
			});
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

	renderOptions() {
		const { traversedMappings } = this.state;
		return traversedMappings.map((v) => (
			<Select.Option key={v} title={v}>
				{v.split('.keyword')[0]}
			</Select.Option>
		));
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
		} = this.props;
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
								}}
								onFocus={this.getMappings}
							>
								{addOptions}
								{this.renderOptions()}
							</Select>
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
