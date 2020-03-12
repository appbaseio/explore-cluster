import React from 'react';
import { connect } from 'react-redux';
import { Card, Form, Input, InputNumber, message, notification, Select, Switch } from 'antd';

import { get, pick } from 'lodash';
import { getDefaultSettings, getSettings, putSettings } from '../../batteries/modules/actions';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import Loader from '../../components/Loader';
import { SettingsFooter } from '../../components/SettingsFooter';
import { container, label } from './styles';
import { ReviewAndSave } from '../../components/ReviewAndSave';
import { SettingTooltip } from '../../components/SettingTooltip';
import { settingsMap } from '../../components/ReviewAndSave/helper';

const bannerMessage = {
	title: 'Results Settings',
	buttonText: 'Read Docs',
};

const getDisabled = value => {
	if (Array.isArray(value)) return value[0] === '*';
	return false;
};

const calculateValue = value => {
	const index = value.indexOf('*');
	if (index > -1) {
		if (index === 0 && value.length !== 1) {
			value.splice(index, 1);
			return value;
		}
		return ['*'];
	}
	return value;
};

class ResultsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = { includeFields: [], excludeFields: [], visible: false };
	}

	componentDidMount() {
		const {
			appName,
			getSettingsAction,
			form: { getFieldDecorator, setFieldsValue },
		} = this.props;
		getSettingsAction(appName).then(res => {
			if (res && res.payload) {
				this.setFormValues(res, getFieldDecorator, setFieldsValue);
			}
		});
	}

	resetResultSettings = e => {
		e.preventDefault();
		const {
			getDefaultSettingsAction,
			form: { getFieldDecorator, setFieldsValue },
			defaultSettings,
		} = this.props;
		if (defaultSettings)
			this.setFormValues({ payload: defaultSettings }, getFieldDecorator, setFieldsValue);
		else
			getDefaultSettingsAction().then(res => {
				if (res && res.payload) {
					this.setFormValues(res, getFieldDecorator, setFieldsValue);
				}
			});
		this.toggleVisible();
	};

	setFormValues = (res, getFieldDecorator, setFieldsValue) => {
		const { results } = res.payload;
		getFieldDecorator('highlightFields');
		const formValues = Object.keys(results || {}).reduce((formObj, key) => {
			if (key === 'highlightOptions') {
				const { number_of_fragments, fragment_size, pre_tags } = results[key] || {};
				this.registerFields(getFieldDecorator);
				formObj.number_of_fragments = number_of_fragments;
				formObj.fragment_size = fragment_size;
				formObj.pre_tags = get(pre_tags, 0);
			} else {
				formObj[key] = results[key];
			}
			return formObj;
		}, {});
		setFieldsValue(formValues);
		this.setState({
			includeFields: results.includeFields,
			excludeFields: results.excludeFields,
		});
	};

	registerFields = getFieldDecorator => {
		getFieldDecorator('number_of_fragments');
		getFieldDecorator('fragment_size');
		getFieldDecorator('pre_tags');
	};

	handleSubmit = e => {
		e.preventDefault();
		const { form, updateSettingsAction, appName, settings } = this.props;
		form.validateFields((err, values) => {
			if (!err) {
				const resultsPayload = this.getResultsPayload(values);
				updateSettingsAction(appName, { ...settings, results: resultsPayload }).then(
					res => {
						if (res && res.error) {
							notification.error({
								message: 'Error',
								description: res.error.message,
							});
						} else {
							message.success(`Results settings for ${appName} saved successfully`);
						}
					},
				);
			}
		});
	};

	getResultsPayload = values => {
		const { pre_tags, number_of_fragments, fragment_size } = values;
		const post_tags = pre_tags ? `</${pre_tags.split('<')[1]}` : [];
		const getHighlightOptions = () => {
			if (!values.highlight) return undefined;
			return {
				pre_tags: [pre_tags],
				post_tags: [post_tags],
				fragment_size,
				number_of_fragments,
			};
		};

		let resultsPayload = pick(values, ['size', 'highlight', 'highlightFields']);
		const { includeFields, excludeFields } = this.state;
		const highlightOptions = getHighlightOptions();
		resultsPayload = {
			...resultsPayload,
			includeFields,
			excludeFields,
			highlightOptions,
		};
		return resultsPayload;
	};

	renderIncludeExclude = (excludeFields, includeFields) => (
		<>
			<Form.Item
				label={
					<>
						Include Fields
						<SettingTooltip title={settingsMap.includeFields.description} />
					</>
				}
			>
				<Select
					placeholder="Select field value"
					mode="tags"
					notFoundContent={null}
					style={{ width: '100%' }}
					tokenSeparators={[',']}
					disabled={getDisabled(excludeFields)}
					value={includeFields}
					onChange={value => this.setState({ includeFields: calculateValue(value) })}
				>
					<Select.Option key="*">* (Include all fields)</Select.Option>
				</Select>
			</Form.Item>

			<Form.Item
				label={
					<>
						Exclude Fields
						<SettingTooltip title={settingsMap.excludeFields.description} />
					</>
				}
			>
				<Select
					placeholder="Select field value"
					mode="tags"
					notFoundContent={null}
					style={{ width: '100%' }}
					tokenSeparators={[',']}
					disabled={getDisabled(includeFields)}
					value={excludeFields}
					onChange={value => this.setState({ excludeFields: calculateValue(value) })}
				>
					<Select.Option key="*">* (Exclude all fields)</Select.Option>
				</Select>
			</Form.Item>
		</>
	);

	renderHighlightFields = getFieldDecorator => (
		<>
			<Form.Item
				label={
					<>
						Fields To Highlight
						<SettingTooltip title={settingsMap.highlightFields.description} />
					</>
				}
			>
				{getFieldDecorator('highlightFields')(
					<Select
						placeholder="Select field value"
						mode="tags"
						notFoundContent={null}
						style={{ width: '100%' }}
						tokenSeparators={[',']}
					/>,
				)}
			</Form.Item>
			<Form.Item
				label={
					<>
						Highlight Start Tag
						<SettingTooltip title="Enter the start tag and end tag would be formed based on that. E.g. if you type <mark> end_tag would be </mark>." />
					</>
				}
			>
				{getFieldDecorator('pre_tags', {
					rules: [{ pattern: /^<\w*>$/g, message: 'Please enter a valid tag.' }],
				})(<Input style={{ width: '17%' }} placeholder="<mark>" />)}
			</Form.Item>
			<Form.Item
				label={
					<>
						Highlight Fragment Size
						<SettingTooltip title="Fragment size for the search results with highlight." />
					</>
				}
			>
				{getFieldDecorator('fragment_size')(
					<InputNumber style={{ width: '17%' }} placeholder="Enter fragment size" />,
				)}
			</Form.Item>
			<Form.Item
				label={
					<>
						Number Of Fragments
						<SettingTooltip title="Number of fragments for the search results with highlight." />
					</>
				}
			>
				{getFieldDecorator('number_of_fragments')(
					<InputNumber style={{ width: '17%' }} placeholder="Enter no of fragments" />,
				)}
			</Form.Item>
		</>
	);

	toggleVisible = () => {
		this.setState(prevState => ({ visible: !prevState.visible }));
	};

	revertChanges = (settings, getFieldDecorator, setFieldsValue) => {
		this.setFormValues(
			{
				payload: settings,
			},
			getFieldDecorator,
			setFieldsValue,
		);
		this.toggleVisible();
	};

	render() {
		const {
			form: { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue },
			isLoading,
			isUpdating,
			resetState,
			settings,
			appName,
		} = this.props;
		const { includeFields, excludeFields, visible } = this.state;

		if (isLoading) return <Loader />;

		return (
			<>
				<Banner {...bannerMessage} />
				<div className={container}>
					<Form layout="vertical" className={label}>
						<Card>
							<Form.Item
								label={
									<>
										Page Size
										<SettingTooltip title={settingsMap.size.description} />
									</>
								}
							>
								{getFieldDecorator('size')(
									<InputNumber
										style={{ width: '15%' }}
										placeholder="Enter page size"
										min={0}
										max={1000}
									/>,
								)}
							</Form.Item>
						</Card>

						<Card style={{ marginTop: 20 }} title="Fields To Return">
							{this.renderIncludeExclude(excludeFields, includeFields)}
						</Card>
						<Card style={{ marginTop: 20 }} title="Result Highlight Settings">
							<div style={{ paddingBottom: 32 }}>
								<label style={{ marginRight: 10 }}>Enable Highlighting</label>
								{getFieldDecorator('highlight', { valuePropName: 'checked' })(
									<Switch />,
								)}
							</div>

							{getFieldValue('highlight') &&
								this.renderHighlightFields(getFieldDecorator)}
						</Card>
					</Form>

					<SettingsFooter
						loading={isUpdating}
						resetState={resetState}
						showSearchPreview
						app={appName}
						onReset={this.resetResultSettings}
						reviewAndSave={() => (
							<ReviewAndSave
								loading={isUpdating}
								oldValues={get(settings, 'results')}
								newValues={this.getResultsPayload(getFieldsValue())}
								onClick={this.toggleVisible}
								visible={visible}
								onRevert={() => {
									this.revertChanges(settings, getFieldDecorator, setFieldsValue);
								}}
								onSave={e => {
									this.handleSubmit(e);
									this.toggleVisible();
								}}
							/>
						)}
					/>
				</div>
			</>
		);
	}
}

const mapStateToProps = state => {
	const appName = get(state, '$getCurrentApp.name');
	return {
		appName,
		isLoading: get(state, '$getAppSettings.isFetching'),
		settings: get(state, ['$getAppSettings', 'settings', appName]),
		isUpdating: get(state, '$getAppSettings.isUpdating'),
		resetState: get(state, '$getAppSettings.default', {}),
		defaultSettings: get(state, '$getAppSettings.defaultSettings'),
	};
};

const mapDispatchToProps = dispatch => ({
	getDefaultSettingsAction: () => dispatch(getDefaultSettings()),
	getSettingsAction: name => dispatch(getSettings(name)),
	updateSettingsAction: (name, payload) => dispatch(putSettings(name, payload)),
});

const ResultsForm = Form.create({ name: 'results' })(ResultsPage);

export default connect(mapStateToProps, mapDispatchToProps)(ResultsForm);
