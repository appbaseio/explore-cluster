import React, { useEffect, useState } from 'react';
import { FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { InfoCircleOutlined } from '@ant-design/icons';
import { bool, object, string, func, any } from 'prop-types';
import { Form, Popover } from 'antd';
import DataFieldSelector from '../../../../components/Form/DataFieldSelector';
import FusionDatafieldSelector from '../../../../components/Form/FusionDatafieldSelector';
import { getRawMappingsByAppName } from '../../../../batteries/modules/selectors';

import { BACKENDS } from '../../../../batteries/utils';
import { getAppMappings } from '../../../../batteries/modules/actions';
import PriceUnit from '../../SearchUIBuilderPage/components/tabs/UIComponents/PriceUnit';

const NormalizedDataField = ({ isFusion, form, pipeline, name, value, onChange }) =>
	isFusion ? (
		<FusionDatafieldSelector form={form} value={value} onChange={onChange} />
	) : (
		<DataFieldSelector pipeline={pipeline} name={name} />
	);

NormalizedDataField.propTypes = {
	isFusion: bool.isRequired,
	form: any.isRequired,
	pipeline: string.isRequired,
	name: string.isRequired,
	value: any.isRequired,
	onChange: func.isRequired,
};

const Results = ({
	form,
	mappings,
	fetchMappings,
	credentials,
	appName,
	backend,
	secondaryPipeline,
}) => {
	// eslint-disable-next-line
	const [categoryField, setCategoryField] = useState(
		form && form.get('categoryField') ? form.get('categoryField').value : '',
	);
	const pipeline = form && form.get('pipeline') ? form.get('pipeline').value : undefined;
	const isFusion = backend === BACKENDS.FUSION.name;

	useEffect(() => {
		if (credentials && !Object.keys(mappings).length && !isFusion) {
			// Fetch Mappings if permissions are present
			fetchMappings(appName, credentials, backend);
		}

		if (form && form.get('categoryField')) {
			form.get('categoryField').valueChanges.subscribe((value) => {
				setCategoryField((prevValue) => {
					if (prevValue !== value) {
						const categoryFieldValueControl = form.get('categoryFieldValue');
						categoryFieldValueControl.reset([]);
						return value;
					}
					return prevValue;
				});
			});
		}
	}, []);

	return (
		<Form colon={false} layout="horizontal" labelWrap labelCol={{ span: 18 }} labelAlign="left">
			<FieldControl name="resultTitle">
				{({ value, onChange }) => (
					<Form.Item
						name="resultTitle"
						label={
							<span>
								Set the <strong>title</strong> for the result item
							</span>
						}
					>
						<NormalizedDataField
							isFusion={isFusion}
							form={form}
							value={value}
							onChange={onChange}
							pipeline={secondaryPipeline || pipeline}
							name="resultTitle"
						/>
					</Form.Item>
				)}
			</FieldControl>
			<FieldControl name="resultDescription">
				{({ value, onChange }) => (
					<Form.Item
						name="resultDescription"
						label={
							<span>
								Set the <strong>description</strong> for the result item
							</span>
						}
					>
						<NormalizedDataField
							isFusion={isFusion}
							form={form}
							value={value}
							onChange={onChange}
							pipeline={secondaryPipeline || pipeline}
							name="resultDescription"
						/>
					</Form.Item>
				)}
			</FieldControl>
			<FieldControl name="resultPrice">
				{({ value, onChange }) => (
					<Form.Item
						name="resultPrice"
						label={
							<span>
								Set a <strong>numeric value</strong> for the result item
								<Popover content="This can be price, dates, or any other significant value">
									<InfoCircleOutlined style={{ marginLeft: '5px' }} />
								</Popover>
							</span>
						}
					>
						<div>
							<PriceUnit name="priceUnit" />

							<NormalizedDataField
								isFusion={isFusion}
								form={form}
								value={value}
								onChange={onChange}
								pipeline={secondaryPipeline || pipeline}
								name="resultPrice"
							/>
						</div>
					</Form.Item>
				)}
			</FieldControl>
			<FieldControl name="resultImage">
				{({ value, onChange }) => (
					<Form.Item
						name="resultImage"
						label={
							<span>
								Set an <strong>image</strong> for the result item
								<Popover content="The value should be of a URL type for the image content to be displayed correctly">
									<InfoCircleOutlined style={{ marginLeft: '5px' }} />
								</Popover>
							</span>
						}
					>
						<NormalizedDataField
							isFusion={isFusion}
							form={form}
							value={value}
							onChange={onChange}
							pipeline={secondaryPipeline || pipeline}
							name="resultImage"
						/>
					</Form.Item>
				)}
			</FieldControl>
			<FieldControl name="resultHandle">
				{({ value, onChange }) => (
					<Form.Item
						name="resultHandle"
						label={
							<span>
								Set a <strong>redirection URL</strong> for the result item
							</span>
						}
					>
						<NormalizedDataField
							isFusion={isFusion}
							form={form}
							value={value}
							onChange={onChange}
							pipeline={secondaryPipeline || pipeline}
							name="resultHandle"
						/>
					</Form.Item>
				)}
			</FieldControl>
		</Form>
	);
};

Results.defaultProps = {
	appName: undefined,
	mappings: {},
	form: null,
	secondaryPipeline: '',
	backend: BACKENDS.ELASTICSEARCH.name,
};

Results.propTypes = {
	mappings: object,
	appName: string,
	credentials: string.isRequired,
	fetchMappings: func.isRequired,
	form: object,
	backend: string,
	secondaryPipeline: string,
};

const mapStateToProps = (state, props) => {
	const appName = props.secondaryPipeline || props.pipeline || get(state, '$getCurrentApp.name');
	const mappings = getRawMappingsByAppName(state, appName);
	const { username, password } = get(state, 'user.data', {});
	const backend = get(state, '$getAppPlan.results.backend');
	return {
		appName,
		mappings,
		credentials: `${username}:${password}`,
		backend,
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchMappings: (appName, credentials, backend) =>
		dispatch(getAppMappings(appName, credentials, undefined, backend)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Results);
