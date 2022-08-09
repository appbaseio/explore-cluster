import React, { useEffect, useState } from 'react';
import { List } from 'antd';
import { FieldArray } from 'react-reactive-form';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { bool, func, object, string } from 'prop-types';
import DynamicCharts from './DynamicCharts';
import { traverseMapping } from '../../../../../batteries/utils/mappings';
import { getRawMappingsByAppName } from '../../../../../batteries/modules/selectors';
import { getAppMappings } from '../../../../../batteries/modules/actions';
import ListItem from './ListItem';

const Charts = ({
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
		<FieldArray name="charts">
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
							<h3>Charts</h3>
							<DynamicCharts
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
							<h3>Charts</h3>
							<DynamicCharts
								form={form}
								getPreferencesPayload={getPreferencesPayload}
							/>
						</div>
						<List
							dataSource={controls}
							renderItem={(control, index) => (
								<div key={`${get(control, 'meta.key')}-${String(index)}`}>
									<ListItem
										traversedMappings={traversedMappings}
										control={control}
										pipeline={pipeline}
										getPreferencesPayload={getPreferencesPayload}
										form={form}
										index={index}
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

Charts.defaultProps = {
	loading: false,
	mappings: null,
};

Charts.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Charts);
