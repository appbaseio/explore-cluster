import React from 'react';
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

export default ReplaceWord;
