import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'antd';
import get from 'lodash/get';
import { languages } from '../../constants/es-languages';

const fallback = {
	chinese: 'Needs smartcn analyzer installed.',
	japanese: 'Needs kuromoji analyzer installed.',
	korean: 'Needs nori analyzer installed.',
	polish: 'Needs stempel analyzer installed.',
	ukranian: 'Needs ukranian analyzer installed.',
};

class LanguageDropdown extends React.PureComponent {
	render() {
		const { renderOption, value, formStyle, ...rest } = this.props;
		return (
			<Form.Item
				style={formStyle}
				validateStatus={fallback[value] ? 'warning' : null}
				help={get(fallback, value)}
			>
				<Select value={value} style={{ width: '17%' }} showSearch {...rest}>
					{languages.map(renderOption)}
				</Select>
			</Form.Item>
		);
	}
}

LanguageDropdown.propTypes = {
	renderOption: PropTypes.func.isRequired,
	value: PropTypes.string,
	formStyle: PropTypes.object,
};

LanguageDropdown.defaultProps = {
	value: undefined,
	formStyle: {},
};

export default LanguageDropdown;
