import React from 'react';
import PropTypes, { func, object } from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import { Switch, List, Button, Radio, Form } from 'antd';
import IndexSwitcher from '../../../../components/IndexSwitcher';
import SearchPreviewModal from './SearchPreview';
import { BACKENDS } from '../../../../batteries/utils';

const { Item } = List;

export const defaultSettings = [
	{
		id: 'autosuggest',
		label: 'Show Autosuggestions',
		value: true,
	},
	{
		id: 'showVoiceSearch',
		label: 'Enable Voice Search',
		value: true,
	},
	{
		id: 'showSearchAs',
		label: 'CSS position of search bar',
		value: true,
	},
];

export const autosuggestionSettings = [
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

			<Form layout="inline">
				<List
					dataSource={defaultSettings}
					renderItem={(item) => {
						if (item.id === 'showSearchAs') {
							return (
								<div>
									<FieldControl name={item.id} strict={false}>
										{(control) => {
											return (
												<Item
													actions={[
														<Radio.Group
															{...control.handler()}
															onChange={(e) => {
																control.markAsTouched();
																control
																	.handler()
																	.onChange(e.target.value);
															}}
														>
															<Radio value="sticky">Sticky</Radio>
															<Radio value="relative">Relative</Radio>
														</Radio.Group>,
													]}
												>
													<Item.Meta
														title={
															typeof item.label === 'function'
																? item.label()
																: item.label
														}
													/>
												</Item>
											);
										}}
									</FieldControl>
									<div />
								</div>
							);
						}

						return (
							<>
								<FieldControl name={item.id}>
									{({ value, onChange }) => (
										<Item
											actions={[
												<Switch checked={value} onChange={onChange} />,
											]}
										>
											<Item.Meta title={item.label} />
										</Item>
									)}
								</FieldControl>
								{item.id === 'autosuggest' && (
									<FieldGroup name="autoSuggestionSettings">
										{({ disabled }) => {
											if (disabled || disabled === undefined) {
												return null;
											}

											return (
												<List
													dataSource={autosuggestionSettings}
													renderItem={(data) => (
														<FieldControl name={data.id}>
															{({ value, onChange }) => (
																<Item
																	style={{ paddingLeft: '20px' }}
																	actions={[
																		<Switch
																			checked={value}
																			onChange={onChange}
																		/>,
																	]}
																>
																	<Item.Meta title={data.label} />
																</Item>
															)}
														</FieldControl>
													)}
												/>
											);
										}}
									</FieldGroup>
								)}
							</>
						);
					}}
				/>
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
