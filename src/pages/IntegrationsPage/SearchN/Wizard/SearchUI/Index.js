import React, { useEffect, useState } from 'react';
import { List } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { string, object, func } from 'prop-types';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import DataFieldSelector from '../../../../../components/Form/DataFieldSelector';
import { SearchUIStyles } from '../styles';
import { getURL } from '../../../../../constants/config';
import DocType from '../../../tabs/Search/Results/DocType';
import TabLayout from '../../../tabs/Search/Results/TabLayout';
import DefaultResults from '../../../tabs/Search/Results/DefaultResults';
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
		<div css={SearchUIStyles}>
			<div className="description-container">
				Configure UI fields to display search results. This is required to disaplay the
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
															enableAppbase
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
												<DataFieldSelector
													pipeline={pipeline}
													name={item.id}
													isAggFields
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
	pipeline: '',
	tabsValidated: {},
	setTabsValidated: () => {},
	preferences: {},
	form: {},
};

SearchUI.propTypes = {
	tabsValidated: object,
	pipeline: string,
	setTabsValidated: func,
	preferences: object,
	form: object,
};

export default SearchUI;
