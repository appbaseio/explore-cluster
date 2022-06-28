import React from 'react';
import { List, Popover, Icon } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { string, object, func } from 'prop-types';
import PriceUnit from '../../../tabs/Search/PriceUnit';
import DataFieldSelector from '../../../../../components/Form/DataFieldSelector';
import { SearchUIStyles } from '../styles';

const defaultSettings = [
	{
		id: 'resultTitle',
		label: (
			<span>
				Select the data field to display the <strong>title</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultDescription',
		label: (
			<span>
				Select the data field to display the <strong>description</strong> of the result item
			</span>
		),
		value: true,
	},
	{
		id: 'resultPrice',
		label: (
			<span>
				Select the data field to display the <strong>price</strong> of the result item
				<Popover content="You can substitute price for any other similarly significant field">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
		showPriceUnitInput: true,
	},
	{
		id: 'resultImage',
		label: (
			<span>
				Select the data field to display the <strong>image</strong> of the result item
				<Popover content="The value should be of a URL type for the image content to be displayed correctly">
					<Icon type="info-circle" style={{ marginLeft: '5px' }} />
				</Popover>
			</span>
		),
		value: true,
	},
	{
		id: 'resultHandle',
		label: (
			<span>
				Select the data field to define the <strong>redirect url</strong> for the result
				item
			</span>
		),
		value: true,
	},
];

const { Item } = List;

const SearchUI = ({ pipeline, tabsValidated, setTabsValidated }) => {
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
					return (
						<FieldControl name={item.id}>
							{/* eslint-disable-next-line */}
							{({ value, onChange }) => {
								if (!tabsValidated.tab3 && value) {
									setTabsValidated({
										...tabsValidated,
										tab3: true,
									});
								}
								return (
									<Item
										actions={[
											<div>
												{item?.showPriceUnitInput ? (
													<PriceUnit name="priceUnit" />
												) : null}
												<DataFieldSelector
													pipeline={pipeline}
													name={item.id}
												/>
											</div>,
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
					);
				}}
			/>
		</div>
	);
};

SearchUI.defaultProps = {
	pipeline: '',
	tabsValidated: {},
	setTabsValidated: () => {},
};

SearchUI.propTypes = {
	tabsValidated: object,
	pipeline: string,
	setTabsValidated: func,
};

export default SearchUI;
