import React from 'react';
import { css } from 'emotion';
import { string, object } from 'prop-types';
import { Input } from 'antd';
import { FieldControl } from 'react-reactive-form';

const inputStyles = css`
	width: 135px !important;
	margin-right: 10px !important;
`;

const PriceUnit = ({ name, inputProps }) => {
	return (
		<FieldControl strict={false} name={name}>
			{(control) => {
				return (
					<Input
						css={inputStyles}
						placeholder="Unit Eg: $, Rating"
						{...control.handler()}
						{...inputProps}
					/>
				);
			}}
		</FieldControl>
	);
};

PriceUnit.defaultProps = {
	inputProps: {},
};

PriceUnit.propTypes = {
	name: string.isRequired,
	inputProps: object,
};

export default PriceUnit;
