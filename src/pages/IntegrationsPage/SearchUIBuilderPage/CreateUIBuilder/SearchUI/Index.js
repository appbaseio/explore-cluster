import React, { useEffect, useState } from 'react';
import { List } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { string, object, func } from 'prop-types';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import FusionDatafieldSelector from '../../../../../components/Form/FusionDatafieldSelector';
import { SearchUIStyles } from '../styles';
import { getURL } from '../../../../../constants/config';
import DocType from '../../components/tabs/UIComponents/Results/DocType';
import TabLayout from '../../components/tabs/UIComponents/Results/TabLayout';
import DefaultResults from '../../components/tabs/UIComponents/Results/DefaultResults';
import { getTemplate } from '../../../utils/index';

const defaultSettings = [
	// {
	// 	id: 'categoryField',
	// 	label: (
	// 		<span>
	// 			Customize result display by <strong>document type</strong>
	// 		</span>
	// 	),
	// 	value: false,
	// },
	{
		id: 'categoryFieldValue',
		label: (
			<span>
				Select <strong>document type value</strong>
			</span>
		),
		value: false,
	},
];

const { Item } = List;

const SearchUI = ({ pipeline, tabsValidated, setTabsValidated, preferences, form }) => {
	const [isLoading, setIsLoading] = useState(false);
	const [categoryFieldValue, setDocumentTypeValue] = useState('');

	useEffect(() => {
		form.get('categoryField').valueChanges.subscribe(() => {
			const categoryFieldValueControl = form.get('categoryFieldValue');
			categoryFieldValueControl.reset([]);
		});
	}, []);

	const handleReload = () => {
		setIsLoading(true);

		setTimeout(() => {
			setIsLoading(false);
		}, 1);
	};

	const themeType = form.get('themeType') ? form.get('themeType').value : 'classic';
	const templateObj = getTemplate(themeType);
	return (
		<div className={SearchUIStyles}>
			<div className="description-container">
				Configure UI fields to display search results. This is required to display the
				initial Search UI preview. You can always change this later.
			</div>

			<List
				dataSource={defaultSettings}
				bordered
				renderItem={(item) => {
					if (item.id === 'categoryFieldValue') {
						return categoryFieldValue ? (
							<FieldControl name={item.id} strict={false}>
								{({ value, onChange }) => {
									return (
										<>
											<Item
												actions={[
													!isLoading ? (
														<ReactiveBase
															app={preferences?.pipeline || ''}
															url={getURL()}
															credentials={
																preferences?.exportSettings
																	?.credentials || ''
															}
															transformRequest={(props) => {
																const newBody = JSON.parse(
																	// eslint-disable-next-line
																	props.body,
																);
																newBody.metadata = {
																	app: form.get('app')
																		? form.get('app').value
																		: '',
																	profile: form.get('profile')
																		? form.get('profile').value
																		: '',
																	suggestion_profile: form.get(
																		'searchProfile',
																	)
																		? form.get('searchProfile')
																				.value
																		: '',
																};

																// eslint-disable-next-line
																props.body =
																	JSON.stringify(newBody);

																return props;
															}}
														>
															<DocType
																value={value}
																onChange={onChange}
																form={form}
															/>
														</ReactiveBase>
													) : (
														<></>
													),
												]}
											>
												<Item.Meta
													title={
														typeof item.label === 'function'
															? item.label(value)
															: item.label
													}
												/>
											</Item>
											{form.get('categoryField').value ? (
												<TabLayout
													values={value}
													form={form}
													pipeline={pipeline}
												/>
											) : null}
										</>
									);
								}}
							</FieldControl>
						) : (
							<DefaultResults
								pipeline={pipeline}
								setValidation={(val) => {
									if (!tabsValidated.tab3 && val) {
										setTabsValidated({
											...tabsValidated,
											tab3: true,
										});
									}
								}}
								themeType={themeType}
								form={form}
								isWizard
							/>
						);
					}
					if (item.id === 'categoryField') {
						return templateObj?.name !== 'geo' ? (
							<FieldControl name={item.id}>
								{/* eslint-disable-next-line */}
								{({ value, onChange }) => {
									if (!tabsValidated.tab3 && value) {
										setTabsValidated({
											...tabsValidated,
											tab3: true,
										});
									}
									setDocumentTypeValue(value);
									return (
										<Item
											actions={[
												<FusionDatafieldSelector
													value={value}
													onChange={onChange}
													form={form}
													handleReload={handleReload}
												/>,
											]}
										>
											<Item.Meta
												title={
													typeof item.label === 'function'
														? item.label(value)
														: item.label
												}
											/>
										</Item>
									);
								}}
							</FieldControl>
						) : (
							<></>
						);
					}

					return <></>;
				}}
			/>
		</div>
	);
};

SearchUI.defaultProps = {
	tabsValidated: {},
	setTabsValidated: () => {},
	preferences: {},
	form: {},
	pipeline: '',
};

SearchUI.propTypes = {
	tabsValidated: object,
	setTabsValidated: func,
	preferences: object,
	form: object,
	pipeline: string,
};

export default SearchUI;
