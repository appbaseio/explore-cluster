import { Form, Select } from 'antd';
import React from 'react';
import { languages } from '../../constants/es-languages';

const fallback = {
	chinese: 'Needs smartcn analyzer installed.',
	japanese: 'Needs kuromoji analyzer installed.',
	korean: 'Needs nori analyzer installed.',
	polish: 'Needs stempel analyzer installed.',
	ukranian: 'Needs ukranian analyzer installed.',
};

// eslint-disable-next-line import/prefer-default-export
export class LanguageDropdown extends React.PureComponent {
	render() {
		const { renderOption, value, formStyle, ...rest } = this.props;
		return (
			<Form.Item
				style={formStyle}
				validateStatus={fallback[value] ? 'warning' : null}
				help={fallback[value]}
			>
				<Select value={value} style={{ width: '17%' }} showSearch {...rest}>
					{languages.map(renderOption)}
				</Select>
			</Form.Item>
		);
	}
}
