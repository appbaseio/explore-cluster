import React from 'react';
import { Input, List } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { string, func } from 'prop-types';
import PriceUnit from '../PriceUnit';
import DataFieldSelector from '../../../../../components/Form/DataFieldSelector';
import { defaultDataFields, geoDefaultFields } from './constants';

const { Item } = List;

const DefaultResults = ({ pipeline, themeType, setValidation }) => {
	const getDataSource = () => {
		if (themeType === 'geo') return geoDefaultFields;
		return defaultDataFields;
	};

	return (
		<div>
			<List
				dataSource={getDataSource()}
				bordered={false}
				renderItem={(item) => {
					return (
						<FieldControl name={item.id}>
							{/* eslint-disable-next-line */}
							{({ value, onChange }) => {
								setValidation(value);
								return (
									<Item
										actions={[
											item.id === 'cssSelector' ? (
												<Input
													value={value}
													onChange={onChange}
													style={{ width: 200 }}
													placeholder="Eg: my-class-name"
												/>
											) : (
												<div>
													{item?.showPriceUnitInput ? (
														<PriceUnit name="priceUnit" />
													) : null}
													<DataFieldSelector
														pipeline={pipeline}
														name={item.id}
													/>
												</div>
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
								);
							}}
						</FieldControl>
					);
				}}
			/>
			{/* ); */}
			{/* }} */}
			{/* </FieldControl> */}
		</div>
	);
};

DefaultResults.defaultProps = {
	pipeline: '',
	themeType: 'classic',
	setValidation: () => {},
};

DefaultResults.propTypes = {
	pipeline: string,
	setValidation: func,
	themeType: string,
};

export default DefaultResults;
