import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import get from 'lodash/get';
import { array, func, object, string } from 'prop-types';
import { FieldGroup } from 'react-reactive-form';
import { connect } from 'react-redux';
import DefaultResults from './DefaultResults';
import { traverseMapping } from '../../../../../batteries/utils/mappings';
import { getRawMappingsByAppName } from '../../../../../batteries/modules/selectors';
import { BACKENDS } from '../../../../../batteries/utils';
import { getAppMappings } from '../../../../../batteries/modules/actions';

const { TabPane } = Tabs;

const TabLayout = ({ values, form, pipeline, credentials, mappings, fetchMappings, backend }) => {
	const [activeKey, setActiveKey] = useState('_default');
	const isFusion = backend === BACKENDS.FUSION.name;

	useEffect(() => {
		if (credentials && !Object.keys(mappings).length && !isFusion) {
			// Fetch Mappings only if permissions are present
			fetchMappings(pipeline, credentials, backend);
		}
	}, []);

	useEffect(() => {
		if (values.length) setActiveKey(`${values[values.length - 1]}-${values.length - 1}`);
		else setActiveKey('_default');
	}, [values]);

	const getDatafields = () => {
		if (!isFusion) {
			const traversedMappings = traverseMapping(mappings || {}, undefined, {
				isAggFields: true,
				includeMappings: undefined,
				includeTypes: undefined,
			});

			if (Array.isArray(traversedMappings)) {
				return [...traversedMappings];
			}
			const newTraversedMappings = traversedMappings[pipeline];
			if (Array.isArray(newTraversedMappings)) return [...newTraversedMappings];
		}

		return ['_score'];
	};

	return (
		<div style={{ padding: 20 }}>
			<FieldGroup
				control={form.get('displayFields')}
				strict={false}
				render={() => {
					return (
						<Tabs
							defaultActiveKey="_default"
							activeKey={activeKey}
							style={{ minHeight: 300 }}
							onTabClick={(tab) => setActiveKey(tab)}
						>
							{(values || []).map((tab, idx) => (
								// eslint-disable-next-line
								<TabPane tab={tab} key={`${tab}-${idx}`}>
									<FieldGroup
										name={tab}
										strict={false}
										render={() => (
											<DefaultResults
												pipeline={pipeline}
												form={form}
												fieldPicker={getDatafields()}
											/>
										)}
									/>
								</TabPane>
							))}

							<TabPane tab="Default" key="_default">
								<FieldGroup
									name="_default"
									strict={false}
									render={() => (
										<DefaultResults
											pipeline={pipeline}
											form={form}
											fieldPicker={getDatafields()}
										/>
									)}
								/>
							</TabPane>
						</Tabs>
					);
				}}
			/>
		</div>
	);
};

TabLayout.propTypes = {
	values: array,
	form: object.isRequired,
	pipeline: string,
	mappings: object,

	credentials: string.isRequired,
	fetchMappings: func.isRequired,
	backend: string,
};

TabLayout.defaultProps = {
	values: [],
	pipeline: undefined,
	backend: BACKENDS.ELASTICSEARCH.name,

	mappings: {},
};

const mapStateToProps = (state, props) => {
	const mappings = getRawMappingsByAppName(state, props.pipeline);
	const { username, password } = get(state, 'user.data', {});
	const backend = get(state, '$getAppPlan.results.backend');
	return {
		mappings,
		credentials: `${username}:${password}`,
		backend,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, backend) =>
		dispatch(getAppMappings(appName, credentials, undefined, backend)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TabLayout);
