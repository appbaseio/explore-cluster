import { Input, Switch, Tooltip } from 'antd';
import { array, bool, func, object, string } from 'prop-types';
import React, { useEffect, useState } from 'react';
import Flex from '../../../../../batteries/components/shared/Flex';
import DataFieldSelector from '../../../../../components/Form/DataFieldSelector';
import FusionDatafieldSelector from '../../../SearchN/Wizard/FusionDatafieldSelector';
import PriceUnit from '../PriceUnit';

const Actions = ({ item, value, onChange, pipeline, isFusion, form }) => {
	const [resultHighlight, setResultHighlight] = useState(form.get('resultHighlight').value);
	const [dataField = '', highlight = false] =
		typeof value === 'string' ? value.split('~') : ['', false];

	useEffect(() => {
		form.get('resultHighlight').valueChanges.subscribe((val) => {
			setResultHighlight(val);
		});
	}, []);

	if (item.id === 'cssSelector')
		return (
			<Input
				value={value}
				onChange={onChange}
				style={{ width: 200 }}
				placeholder="Eg: my-class-name"
			/>
		);
	if (item.id === 'metaData') return <>metadata</>;

	const handleChange = (key, val) => {
		let newValue = '';
		if (key === 'highlight') {
			newValue = `${dataField}~${val}`;
		} else {
			newValue = `${val}~${highlight}`;
		}
		onChange(newValue);
	};

	return (
		<Flex alignItems="center" style={{ gap: 10 }}>
			{item?.showPriceUnitInput ? <PriceUnit name="priceUnit" /> : null}
			{isFusion ? (
				<FusionDatafieldSelector
					form={form}
					value={value}
					onChange={onChange}
					includeHighlight={item.id !== 'locationDataField'}
				/>
			) : (
				<DataFieldSelector
					pipeline={pipeline}
					name={item.id}
					includeHighlight={item.id !== 'locationDataField'}
				/>
			)}
			{resultHighlight && (item.id === 'resultTitle' || item.id === 'resultDescription') && (
				<Tooltip title="Toggle to enable or disable field level highlight">
					<Switch
						checked={highlight === 'true'}
						onChange={(val) => handleChange('highlight', val)}
					/>
				</Tooltip>
			)}
		</Flex>
	);
};

Actions.propTypes = {
	item: object,
	value: array,
	onChange: func.isRequired,
	pipeline: string,
	isFusion: bool,
	form: object,
};

Actions.defaultProps = {
	item: {},
	value: [],
	pipeline: '',
	isFusion: false,
	form: {},
};

export default Actions;
