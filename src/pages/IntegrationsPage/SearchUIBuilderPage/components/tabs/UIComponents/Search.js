import React from 'react';
import PropTypes, { func, object } from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Switch, Button, Radio, Form, Divider, Input } from 'antd';
import IndexSwitcher from '../../../../../../components/IndexSwitcher';
import SearchPreviewModal from './SearchPreview';
import { BACKENDS } from '../../../../../../batteries/utils';
import { searchboxMessages } from '../../../../../../utils/messages';

const autosuggestionSettings = [
	{
		id: 'enablePopularSuggestions',
		label: 'Show popular suggestions (based on analytics data)',
		value: false,
	},
	{
		id: 'enableRecentSearches',
		label: 'Show recent suggestions (based on analytics data)',
		value: false,
	},
	{
		id: 'highlight',
		label: 'Enable suggestion highlights',
		value: false,
	},
];

const Search = ({ history, pipeline, apps, form, backend, getPreferencesPayload }) => {
	const filteredApps = Object.keys(apps || {}).filter((app) => !app.startsWith('.'));

	return (
		<div>
			<h2 style={{ display: 'flex', alignItems: 'center' }}>
				Search Query
				<SearchPreviewModal
					form={form}
					backend={backend}
					getPreferencesPayload={getPreferencesPayload}
				/>
			</h2>

			<Form
				colon={false}
				layout="horizontal"
				labelWrap
				labelCol={{ span: 18 }}
				labelAlign="left"
			>
				<FieldControl name="autosuggest">
					{({ value, onChange }) => (
						<Form.Item label={<b>Show Autosuggestions</b>} name="autosuggest">
							<Switch checked={value} onChange={onChange} />
						</Form.Item>
					)}
				</FieldControl>
				<FieldGroup name="autoSuggestionSettings">
					{({ disabled }) => {
						if (disabled || disabled === undefined) {
							return null;
						}

						return (
							<>
								{autosuggestionSettings.map((data) => (
									<FieldControl name={data.id}>
										{({ value, onChange }) => (
											<Form.Item
												style={{ paddingLeft: '20px' }}
												label={data.label}
												name={data.id}
											>
												<Switch checked={value} onChange={onChange} />
											</Form.Item>
										)}
									</FieldControl>
								))}
							</>
						);
					}}
				</FieldGroup>
				<Divider />

				<FieldControl name="searchEnableAI">
					{({ value, onChange }) => (
						<Form.Item label={<b>Enable AI Search</b>} name="searchEnableAI">
							<Switch checked={value} onChange={onChange} />
						</Form.Item>
					)}
				</FieldControl>
				<FieldGroup name="searchAISettings">
					{({ disabled }) => {
						if (disabled || disabled === undefined) {
							return null;
						}
						return (
							<>
								<FieldControl name="askButton">
									{({ value, onChange }) => {
										if (value === null) {
											onChange(false);
										}
										return (
											<Form.Item
												style={{ paddingLeft: '20px' }}
												label="Show ask button"
												name="askButton"
												tooltip={searchboxMessages.askButton}
											>
												<Switch checked={value} onChange={onChange} />
											</Form.Item>
										);
									}}
								</FieldControl>

								<FieldControl name="showSourceDocuments">
									{({ value, onChange }) => {
										if (value === null) {
											onChange(false);
										}
										return (
											<Form.Item
												style={{ paddingLeft: '20px' }}
												label="Show source documents"
												name="showSourceDocuments"
												tooltip={searchboxMessages.showSourceDocuments}
											>
												<Switch
													defaultChecked={false}
													checked={value}
													onChange={onChange}
												/>
											</Form.Item>
										);
									}}
								</FieldControl>

								<FieldControl name="sourceDocumentLabel">
									{({ value, onChange }) => (
										<Form.Item
											style={{ paddingLeft: '20px' }}
											label="Source document label"
											tooltip={searchboxMessages.sourceDocumentLabel}
										>
											<Input
												placeholder="Write a field name"
												value={value}
												onChange={onChange}
											/>
										</Form.Item>
									)}
								</FieldControl>
							</>
						);
					}}
				</FieldGroup>
				<Divider />
				<FieldControl name="showVoiceSearch">
					{({ value, onChange }) => (
						<Form.Item label={<b>Enable Voice Search</b>} name="showVoiceSearch">
							<Switch checked={value} onChange={onChange} />
						</Form.Item>
					)}
				</FieldControl>
				<Divider />
				<FieldControl name="showSearchAs" strict={false}>
					{(control) => (
						<Form.Item label={<b>CSS position of search bar</b>} name="showSearchAs">
							<Radio.Group
								{...control.handler()}
								onChange={(e) => {
									control.markAsTouched();
									control.handler().onChange(e.target.value);
								}}
							>
								<Radio value="sticky">Sticky</Radio>
								<Radio value="relative">Relative</Radio>
							</Radio.Group>
						</Form.Item>
					)}
				</FieldControl>
			</Form>
			<p style={{ marginTop: '1em' }}>
				Set search query settings such as fields to search on, weights to apply, typo
				tolerance, whether to enable synonyms from the Search Relevancy views.
			</p>
			{/* toggles */}
			<p style={{ fontWeight: '600' }}>
				<span role="img" aria-label="no results">
					⚠️
				</span>{' '}
				Without setting search fields, searchbox will not return any results.
			</p>
			<IndexSwitcher
				filteredApps={filteredApps}
				item={{
					label: (
						<Button
							type="primary"
							onClick={() => {
								if (pipeline) {
									history.push(`/app/${pipeline}/search`);
								}
							}}
						>
							Configure Search Settings
						</Button>
					),
				}}
				onSelect={(val) => history.push(`/app/${val}/search`)}
				disablePopover
			/>
		</div>
	);
};

Search.propTypes = {
	history: PropTypes.object.isRequired,
	apps: PropTypes.object,
	pipeline: PropTypes.string,
	backend: PropTypes.string,
	form: object,
	getPreferencesPayload: func,
};

Search.defaultProps = {
	apps: {},
	form: {},
	pipeline: '',
	backend: BACKENDS.ELASTICSEARCH.name,
	getPreferencesPayload: () => {},
};

const mapStateToProps = (state) => ({
	apps: get(state, 'apps.data'),
});

export default connect(mapStateToProps, null)(withRouter(Search));
