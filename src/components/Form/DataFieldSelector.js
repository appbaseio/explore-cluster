import React from 'react';
import { connect } from 'react-redux';
import { Select } from 'antd';
import { string, arrayOf, func, bool, object } from 'prop-types';
import get from 'lodash/get';
import { FieldControl } from 'react-reactive-form';
import { getAppMappings } from '../../batteries/modules/actions';
import { getTraversedMappingsByAppName } from '../../batteries/modules/selectors';

class DataFieldSelector extends React.Component {
	getMappings = () => {
		const { index, loading, fetchMappings, appbaseCredentials, mappings } = this.props;
		if (!loading && !mappings && appbaseCredentials) {
			fetchMappings(index, appbaseCredentials);
		}
	};

	renderOptions() {
		const { mappings } = this.props;
		const calcMappings = Array.isArray(mappings) ? mappings : [];
		return calcMappings.map((v) => (
			<Select.Option key={v} title={v}>
				{v}
			</Select.Option>
		));
	}

	render() {
		const { loading, control, name } = this.props;
		const selectProps = {
			placeholder: 'Select data field',
			loading,
			showSearch: true,
			notFoundContent: null,
			style: {
				width: 200,
			},
		};

		if (control || name) {
			return (
				<FieldControl strict={false} name={name} control={control}>
					{({ handler }) => {
						const inputHandler = handler();
						return (
							<Select
								placeholder="Select field"
								{...selectProps}
								{...inputHandler}
								value={inputHandler.value ? inputHandler.value : undefined}
								onFocus={this.getMappings}
							>
								{this.renderOptions()}
							</Select>
						);
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
	control: null,
	name: undefined,
	loading: false,
};

DataFieldSelector.propTypes = {
	appbaseCredentials: string.isRequired,
	index: string.isRequired,
	fetchMappings: func.isRequired,
	name: string,
	loading: bool,
	control: object,
	mappings: arrayOf(string),
};

const mapStateToProps = (state) => {
	const mappings = getTraversedMappingsByAppName(state);
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
