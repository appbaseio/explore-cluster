import React from 'react';
import { Popover } from 'antd';
import { SketchPicker } from 'react-color';
import styled from 'react-emotion';
import { func, string } from 'prop-types';

const Label = styled.div`
	margin-right: 50px;
	font-weight: 500;
`;

const Picker = styled(SketchPicker)`
	box-shadow: none !important;
	padding: 0 !important;
	width: auto !important;
`;

const Box = styled.div`
	padding: 5px;
	border-radius: 3px;
	border: 1px solid #ddd;
`;
const Container = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	max-width: 210px;
`;

const Color = styled.div(({ color }) => ({
	backgroundColor: color || 'white',
	border: '1px solid #ddd',
	width: '1rem',
	height: '1rem',
}));
const ColorPicker = ({ label, value, onChange }) => (
	<Container>
		{label && <Label>{label}</Label>}
		<Popover
			overlayStyle={{ width: 300 }}
			trigger="click"
			title="Pick Color"
			content={<Picker color={value} onChangeComplete={(color) => onChange(color.hex)} />}
		>
			<Box>
				<Color color={value} />
			</Box>
		</Popover>
	</Container>
);

ColorPicker.propTypes = {
	label: string.isRequired,
	value: string.isRequired,
	onChange: func.isRequired,
};

export default ColorPicker;
