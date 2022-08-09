import React, { useEffect, useState } from 'react';
import { FieldArray } from 'react-reactive-form';
import { List } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { bool, func, object, string } from 'prop-types';
import DynamicFilters from './Filters/DynamicFilters';
import ListItem from './Charts/ListItem';
import { traverseMapping } from '../../../../batteries/utils/mappings';
import { getAppMappings } from '../../../../batteries/modules/actions';
import { getRawMappingsByAppName } from '../../../../batteries/modules/selectors';

export const defaultSettings = [
	{
		id: 'productType',
		label: 'Show product type filter (only works with Shopify apps)',
		value: false,
		disableFilterType: true,
	},
	{
		id: 'collections',
		label: 'Show collections filter (only works with Shopify apps)',
		value: false,
		disableFilterType: true,
	},
	{
		id: 'size',
		label: 'Show size filter',
		value: false,
		disableFilterType: false,
	},
	{
		id: 'color',
		label: 'Show color filter',
		value: false,
		disableFilterType: true,
	},
	{
		id: 'price',
		label: 'Show price range filter',
		disableListOptions: true,
		value: false,
		disableFilterType: true,
	},
];

const Filters = ({
	getPreferencesPayload,
	loading,
	fetchMappings,
	appbaseCredentials,
	mappings,
	form,
}) => {
	const [traversedMappings, setTraversedMappings] = useState([]);
	const pipeline = form?.get('pipeline')?.value;

	useEffect(() => {
		if (appbaseCredentials) {
			getMappings();
		}
	}, []);

	useEffect(() => {
		getTraversedMappings();
	}, [mappings]);

	const getMappings = () => {
		if (!loading && !mappings && appbaseCredentials) {
			fetchMappings(pipeline, appbaseCredentials);
		}
	};

	const getTraversedMappings = () => {
		const traversedMappingsArr = traverseMapping(
			filterOutNestedTypes(mappings) || {},
			undefined,
			{
				isAggFields: true,
				includeMappings: false,
				includeTypes: false,
			},
		);

		if (Array.isArray(traversedMappingsArr)) setTraversedMappings(traversedMappingsArr);
	};

	const filterOutNestedTypes = (mappingsObj = { properties: {} }) => {
		const filteredMappings = { ...mappingsObj };
		// eslint-disable-next-line no-unused-expressions
		Object.keys(filteredMappings.properties ?? {})?.forEach((key) => {
			if (filteredMappings.properties[key].type === 'nested') {
				delete filteredMappings.properties[key];
			}
		});

		return filteredMappings;
	};

	return (
		<FieldArray name="dynamicFilters">
			{({ controls }) => {
				if (!controls.length) {
					return (
						<div
							style={{
								padding: '10px 0',
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<h3>Facets</h3>
							<DynamicFilters
								form={form}
								getPreferencesPayload={getPreferencesPayload}
							/>
						</div>
					);
				}
				return (
					<>
						<div
							style={{
								padding: '10px 0',
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<h3>Custom Filters</h3>
							<DynamicFilters
								form={form}
								getPreferencesPayload={getPreferencesPayload}
							/>
						</div>
						<List
							dataSource={controls}
							bordered
							renderItem={(control, index) => (
								<div key={`${get(control, 'meta.key')}-${String(index)}`}>
									<ListItem
										traversedMappings={traversedMappings}
										control={control}
										pipeline={pipeline}
										getPreferencesPayload={getPreferencesPayload}
										form={form}
										index={index}
										isFilter
									/>
								</div>
							)}
						/>
					</>
				);
			}}
		</FieldArray>
	);
};

Filters.defaultProps = {
	loading: false,
	mappings: null,
};

Filters.propTypes = {
	getPreferencesPayload: func.isRequired,
	mappings: object,
	loading: bool,
	appbaseCredentials: string.isRequired,
	fetchMappings: func.isRequired,
	form: object.isRequired,
};

const mapStateToProps = (state, props) => {
	const mappings = getRawMappingsByAppName(state, props.form?.get('pipeline')?.value || '');
	const { username, password } = get(state, 'user.data', {});
	return {
		mappings,
		loading: get(state, '$getAppMappings.isFetching'),
		appbaseCredentials: username ? `${username}:${password}` : null,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials) => dispatch(getAppMappings(appName, credentials)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Filters);
