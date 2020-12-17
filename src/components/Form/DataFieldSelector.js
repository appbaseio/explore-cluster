import React from 'react';
import { connect } from 'react-redux';
import { Select, Form } from 'antd';
import { string, func, bool, object, element } from 'prop-types';
import get from 'lodash/get';
import { FieldControl } from 'react-reactive-form';
import { getAppMappings } from '../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../batteries/modules/selectors';
import { traverseMapping } from '../../batteries/utils/mappings';

class DataFieldSelector extends React.Component {
	getMappings = () => {
		const { index, loading, fetchMappings, appbaseCredentials, mappings } = this.props;
		if (!loading && !mappings && appbaseCredentials) {
			fetchMappings(index, appbaseCredentials);
		}
	};

	renderOptions() {
		const { mappings, isAggFields } = this.props;
		const traversedMappings = traverseMapping(mappings || {}, undefined, isAggFields);
		const calcMappings = Array.isArray(traversedMappings) ? traversedMappings : [];
		return calcMappings.map((v) => (
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
		} = this.props;
		const selectProps = {
			placeholder: 'Select data field',
			loading,
			showSearch: true,
			notFoundContent: null,
			style: {
				width: 200,
			},
		};
		const withFormItem = (child) => <Form.Item {...formItemProps}>{child}</Form.Item>;

		if (control || name) {
			return (
				<FieldControl strict={false} name={name} control={control} {...controlProps}>
					{({ value, handler, disabled }) => {
						const inputHandler = handler();
						if (hideOnDisabled && disabled) {
							return null;
						}
						const child = (
							<Select
								placeholder="Select field"
								{...selectProps}
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
			<Select placeholder="Select field" {...selectProps} onFocus={this.getMappings}>
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
	mappings: object,
	isAggFields: bool,
	wrapInsideForm: bool,
	formItemProps: object,
	addOptions: element,
};

const mapStateToProps = (state) => {
	const mappings = getRawMappingsByAppName(state);
	const { username, password } = get(state, 'user.data', {});
	const index = get(state, '$getCurrentApp.name');
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
