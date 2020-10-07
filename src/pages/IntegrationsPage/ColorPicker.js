import React from 'react';
import { Popover } from 'antd';
import { SketchPicker } from 'react-color';
import styled, { css } from 'react-emotion';
import { string, func } from 'prop-types';

const labelStyles = css`
	margin-right: 50px;
	font-weight: 500;
`;

const picker = css`
	box-shadow: none !important;
	padding: 0 !important;
	width: auto !important;
`;

const box = css`
	padding: 5px;
	border-radius: 3px;
	border: 1px solid #ddd;
`;
const main = css`
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 210px;
`;

const Color = styled('div')(({ color }) => ({
	backgroundColor: color || 'white',
	border: '1px solid #ddd',
	width: 20,
	height: 20,
}));

const ColorPicker = ({ label, value, onChange }) => (
	<div css={main}>
		{label && <div className={labelStyles}>{label}</div>}
		<Popover
			overlayStyle={{ width: 300 }}
			trigger="click"
			title="Pick Color"
			content={<SketchPicker color={value} className={picker} onChangeComplete={onChange} />}
		>
			<div className={box}>
				<Color color={value} />
			</div>
		</Popover>
	</div>
);

ColorPicker.propTypes = {
	label: string.isRequired,
	value: string.isRequired,
	onChange: func.isRequired,
};

export default ColorPicker;
