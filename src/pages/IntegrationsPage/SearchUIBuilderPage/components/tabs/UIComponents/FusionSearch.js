import React, { useEffect, useState } from 'react';
import { List, Select, Switch, Radio } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { func, object, string } from 'prop-types';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import apisMapper from '../../../../../../batteries/utils/apisMapper';
import { getApiGeneralization } from '../../../../utils/be-apis';
import { BACKENDS } from '../../../../../../batteries/utils';
import SearchPreviewModal from './SearchPreview';

const defaultSettings = [
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
		id: 'profile',
		label: 'Choose a fusion query profile for your configured search settings',
		value: '',
	},
	{
		id: 'showSearchAs',
		label: 'CSS position of search bar',
		value: true,
	},
];

export const autosuggestionSettings = [
	{
		id: 'highlight',
		label: 'Enable suggestion highlights',
		value: false,
	},
];

const { Item } = List;

const FusionSearch = ({ backend, form, endpoints, getPreferencesPayload }) => {
	const [queryProfiles, setQueryProfiles] = useState([]);

	useEffect(() => {
		fetchQueryProfiles(form.get('app').value);
	}, []);

	const fetchQueryProfiles = (app) => {
		if (app) {
			const schemaConfig = endpoints?.index || apisMapper[backend].index || {};
			getApiGeneralization(schemaConfig, { app })
				.then((res) => res.json())
				.then((res) => {
					setQueryProfiles(res);
				})
				.catch((err) => {
					console.error('Error to fetch query profiles', err);
					setQueryProfiles([]);
				});
		}
	};

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

					if (item.id === 'autosuggest')
						return (
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
															style={{
																paddingLeft: '20px',
																borderBottom: '1px solid #e8e8e8',
															}}
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
						);

					if (item.id === 'profile')
						return (
							<FieldGroup parent={form} name="indexSettings" strict={false}>
								{() => (
									<FieldGroup name="fusionSettings" strict={false}>
										{() => (
											<>
												<FieldControl name="searchProfile" strict={false}>
													{({ handler }) => {
														return (
															<Item
																actions={[
																	<Select
																		{...handler()}
																		value={
																			handler().value ||
																			undefined
																		}
																		showSearch
																		placeholder="Select a query profile"
																		style={{
																			minWidth: 300,
																		}}
																	>
																		{(queryProfiles || []).map(
																			(k) => (
																				<Select.Option
																					key={k.alias}
																					value={k.alias}
																				>
																					{k.alias}
																				</Select.Option>
																			),
																		)}
																	</Select>,
																]}
															>
																<Item.Meta title="Choose a fusion query profile for your configured search settings" />
															</Item>
														);
													}}
												</FieldControl>
												<FieldGroup name="meta" strict={false}>
													{() => (
														<FieldControl
															name="sponsoredProfile"
															strict={false}
														>
															{({ handler }) => {
																return (
																	<Item
																		actions={[
																			<Select
																				{...handler()}
																				allowClear
																				value={
																					handler()
																						.value ||
																					undefined
																				}
																				showSearch
																				placeholder="Select a query profile"
																				style={{
																					minWidth: 300,
																				}}
																			>
																				{(
																					queryProfiles ||
																					[]
																				).map((k) => (
																					<Select.Option
																						key={
																							k.alias
																						}
																						value={
																							k.alias
																						}
																					>
																						{k.alias}
																					</Select.Option>
																				))}
																			</Select>,
																		]}
																	>
																		<Item.Meta title="Choose a fusion query profile for sponsored results (optional)" />
																	</Item>
																);
															}}
														</FieldControl>
													)}
												</FieldGroup>
											</>
										)}
									</FieldGroup>
								)}
							</FieldGroup>
						);

					return (
						<FieldControl name={item.id}>
							{({ handler }) => (
								<Item
									actions={
										item.value
											? [<Switch {...handler('checkbox')} />]
											: [
													<Select
														{...handler()}
														allowClear={item.id === 'sponsoredProfile'}
														value={handler().value || undefined}
														showSearch
														placeholder="Select a query profile"
														style={{
															minWidth: 300,
														}}
													>
														{(queryProfiles || []).map((k) => (
															<Select.Option
																key={k.alias}
																value={k.alias}
															>
																{k.alias}
															</Select.Option>
														))}
													</Select>,
											  ]
									}
								>
									<Item.Meta title={item.label} />
								</Item>
							)}
						</FieldControl>
					);
				}}
			/>
		</div>
	);
};

FusionSearch.defaultProps = {
	backend: BACKENDS.ELASTICSEARCH.name,
	form: {},
	endpoints: {},
	getPreferencesPayload: () => {},
};

FusionSearch.propTypes = {
	backend: string,
	form: object,
	endpoints: object,
	getPreferencesPayload: func,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
	endpoints: get(state, 'endpoints.data'),
});

export default connect(mapStateToProps, null)(FusionSearch);
