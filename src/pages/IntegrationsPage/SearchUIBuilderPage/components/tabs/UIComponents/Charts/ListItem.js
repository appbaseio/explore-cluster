import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { List, Button, Switch } from 'antd';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import { array, bool, func, number, object, string } from 'prop-types';
import CustomizeChart from './CustomizeChart';
import CustomizeFilter from '../Filters/CustomizeFilter';
import { getApiGeneralization } from '../../../../../utils/be-apis';
import apisMapper from '../../../../../../../batteries/utils/apisMapper';
import { BACKENDS } from '../../../../../../../batteries/utils';
import { transformGeneralMappingsToFusionArrayFormat } from '../../../../../utils/fusion-apis';

const ListItem = ({
	control,
	getPreferencesPayload,
	form,
	index,
	isFilter,
	provided,
	backend,
	traversedMappings: mappings,
	endpoints,
}) => {
	const [traversedMappings, setTraversedMappings] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchFields(get(control, 'value.customize.dataField'));
	}, [get(control, 'value.customize.dataField'), mappings]);

	const fetchFields = (query) => {
		setIsLoading(true);
		if (backend === BACKENDS.FUSION.name) {
			const profile = form.get('profile') ? form.get('profile').value : 'appbase';
			const indexSettings = form.get('indexSettings') ? form.get('indexSettings').value : {};
			const secondaryProfile = get(indexSettings, 'fusionSettings.profile', '');
			const schemaConfig = endpoints?.schema || apisMapper[backend].schema || {};
			getApiGeneralization(schemaConfig, { index: secondaryProfile || profile, q: query })
				.then((res) => res.json())
				.then((res) => {
					if (Array.isArray(res)) setTraversedMappings(res.map((i) => i.name) || []);
					else {
						const transformedResponse = transformGeneralMappingsToFusionArrayFormat(
							res[secondaryProfile || profile],
						);
						setTraversedMappings(transformedResponse.map((i) => i.name) || []);
					}
					setIsLoading(false);
				})
				.catch((err) => {
					console.error('Error to fetch search query profiles', err);
					setIsLoading(false);
				});
		} else {
			setTraversedMappings(mappings);
			setIsLoading(false);
		}
	};

	const pipeline = form.get('pipeline') ? form.get('pipeline')?.value : '';
	const indexSettings = form.get('indexSettings') ? form.get('indexSettings').value : {};
	const secondaryPipeline = get(indexSettings, 'index', '');

	return (
		<FieldGroup strict={false} control={control}>
			{() => (
				<List.Item
					actions={[
						<FieldControl strict={false} name="enabled">
							{() => (
								<Switch
									checked={control.get('enabled').value}
									onChange={(val) => {
										control.get('enabled').setValue(val);
									}}
								/>
							)}
						</FieldControl>,
						<>
							{isFilter ? (
								<CustomizeFilter
									control={control.get('customize')}
									pipeline={secondaryPipeline || pipeline}
									buttonLabel="Customize"
									getPreferencesPayload={getPreferencesPayload}
									form={form}
									onModalClose={() => {
										fetchFields(get(control, 'value.customize.dataField'));
									}}
								/>
							) : (
								<CustomizeChart
									control={control.get('customize')}
									pipeline={secondaryPipeline || pipeline}
									buttonLabel="Customize"
									getPreferencesPayload={getPreferencesPayload}
									form={form}
									onModalClose={() => {
										fetchFields(get(control, 'value.customize.dataField'));
									}}
								/>
							)}
						</>,
						<Button
							danger
							icon={<DeleteOutlined />}
							onClick={() => {
								control.parent.removeAt(index);
							}}
						/>,
					]}
				>
					<div>
						<span {...provided.dragHandleProps}>
							<DragOutlined
								style={{
									marginRight: 10,
								}}
							/>
						</span>
						<span>
							{isLoading ||
								(traversedMappings &&
								traversedMappings.length &&
								traversedMappings.includes(
									get(control, 'value.customize.dataField'),
								) ? (
									''
								) : (
									<span
										style={{ color: 'orange', marginRight: 10 }}
										role="img"
										aria-label="warning"
									>
										⚠️
									</span>
								))}

							{get(control, 'value.customize.title')}
						</span>
					</div>
				</List.Item>
			)}
		</FieldGroup>
	);
};

ListItem.defaultProps = {
	index: 0,
	isFilter: false,
	traversedMappings: [],
	backend: BACKENDS.ELASTICSEARCH.name,
	endpoints: {},
};

ListItem.propTypes = {
	control: object.isRequired,
	getPreferencesPayload: func.isRequired,
	form: object.isRequired,
	index: number,
	isFilter: bool,
	provided: object.isRequired,
	backend: string,
	traversedMappings: array,
	endpoints: object,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
	endpoints: get(state, 'endpoints.data'),
});

export default connect(mapStateToProps, null)(ListItem);
