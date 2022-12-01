import React, { useEffect, useState } from 'react';
import { Select, Form } from 'antd';
import { array, object, string } from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { FieldControl } from 'react-reactive-form';
import apisMapper from '../../utils/apisMapper';
import { getApiGeneralization } from '../../utils/be-apis';
import { BACKENDS } from '../../../../batteries/utils';
import { transformGeneralMappingsToFusionArrayFormat } from '../../utils/fusion-apis';

const FusionFields = ({ filteredApps, control, backend, endpoints }) => {
	const [queryProfiles, setQueryProfiles] = useState([]);

	useEffect(() => {
		fetchQueryProfiles(control.app);
	}, [control.app]);

	const fetchQueryProfiles = (app) => {
		const schemaConfig = endpoints?.index || apisMapper[backend].index || {};
		getApiGeneralization(schemaConfig, { app })
			.then((res) => res.json())
			.then((res) => {
				if (Array.isArray(res)) setQueryProfiles(res);
				else {
					const transformedResponse = transformGeneralMappingsToFusionArrayFormat(
						res[app],
					);
					setQueryProfiles(transformedResponse);
				}
			})
			.catch((err) => {
				console.error('Error to fetch query profiles', err);
				setQueryProfiles([]);
			});
	};

	return (
		<>
			<FieldControl strict={false} name="app">
				{({ handler }) => (
					<Form.Item
						style={{
							margin: 0,
							padding: 0,
							width: '100%',
						}}
						required
						label="Choose Fusion App"
					>
						<Select
							{...handler()}
							value={handler().value || undefined}
							showSearch
							placeholder="Select an app"
							style={{
								width: '80%',
							}}
						>
							{(Array.isArray(filteredApps) ? filteredApps : []).map((data) => (
								<Select.Option key={data} value={data}>
									{data}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				)}
			</FieldControl>
			<FieldControl strict={false} name="profile">
				{({ handler }) => (
					<Form.Item
						required
						style={{
							margin: 0,
							padding: 0,
							width: '100%',
						}}
						label="Choose Main Query Profile"
					>
						<Select
							{...handler()}
							value={handler().value || undefined}
							showSearch
							placeholder="Select a query profile"
							style={{
								width: '80%',
							}}
						>
							{(Array.isArray(queryProfiles) ? queryProfiles : []).map((k) => (
								<Select.Option key={k.alias} value={k.alias}>
									{k.alias}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				)}
			</FieldControl>
		</>
	);
};

FusionFields.defaultProps = {
	filteredApps: [],
	control: {},
	backend: BACKENDS.ELASTICSEARCH.name,
	endpoints: {},
};

FusionFields.propTypes = {
	filteredApps: array,
	control: object,
	backend: string,
	endpoints: object,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
	endpoints: get(state, 'endpoints.data'),
});

export default connect(mapStateToProps, null)(FusionFields);
