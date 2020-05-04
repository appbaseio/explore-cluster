/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Input, Row } from 'antd';

const ReplaceWord = ({ value = [], onChange }) => {
	return (
		<Row gutter={22}>
			<Col span={12}>
				<label>Word to Replace</label>
				<Input
					value={value.word}
					onChange={(e) => onChange({ ...value, word: e.target.value })}
					placeholder="Enter a word"
				/>
			</Col>
			<Col span={12}>
				<label>New word</label>
				<Input
					value={value.replaceWith}
					onChange={(e) => onChange({ ...value, replaceWith: e.target.value })}
					placeholder="Enter a replacement"
				/>
			</Col>
		</Row>
	);
};

ReplaceWord.propTypes = {
	value: PropTypes.array,
	onChange: PropTypes.func.isRequired,
};

ReplaceWord.defaultProps = {
	value: [],
};

export default ReplaceWord;
