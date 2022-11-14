/* eslint-disable jsx-a11y/label-has-associated-control,jsx-a11y/label-has-for */
import React from 'react';
import PropTypes from 'prop-types';
import { CloseOutlined } from '@ant-design/icons';
import { Col, Input, Row, Button } from 'antd';

const ReplaceWord = ({ value = {}, onChange }) => {
	const handleWordReplacer = (replacer, word) => {
		const newValue = Object.keys(value).reduce(
			(agg, item) => ({
				...agg,
				[item]: item === word ? replacer : value[item],
			}),
			{},
		);
		onChange(newValue);
	};

	const handleWord = (word, index) => {
		const newValue = Object.keys(value)
			.map((wordValue, wordIndex) => {
				if (wordIndex === index) {
					return word;
				}
				return wordValue;
			})
			.reduce(
				(agg, item) => ({
					...agg,
					[item]: value[item] || '',
				}),
				{},
			);

		onChange(newValue);
	};

	const addWord = () => {
		onChange({
			...value,
			'': '',
		});
	};

	const deleteWord = (word) => {
		const { [word]: deletedWord, ...rest } = value;
		onChange(rest);
	};
	return (
		<React.Fragment>
			{Object.keys(value).map((word, index) => (
				// We want the key to be same on the next re-render which will help us keep the focus of keybpard
				// eslint-disable-next-line react/no-array-index-key
				<Row gutter={8} key={`input_${index}`}>
					<Col span={12}>
						<Input
							defaultValue={word}
							onBlur={(e) => handleWord(e.target.value, index)}
							placeholder="Enter word"
							data-cy="original-term"
						/>
					</Col>
					<Col span={10}>
						<Input
							value={value[word]}
							placeholder="Enter replace term"
							onChange={(e) => handleWordReplacer(e.target.value, word)}
							data-cy="replace-term"
						/>
					</Col>
					<Col
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
						}}
						span={2}
					>
						<Button
							shape="circle"
							ghost
							size="small"
							type="danger"
							icon={<CloseOutlined />}
							style={{ marginTop: 3 }}
							onClick={() => deleteWord(word)}
						/>
					</Col>
				</Row>
			))}
			<Button onClick={addWord} data-cy="replace-words-action-add-word">
				Add Word
			</Button>
		</React.Fragment>
	);
};

ReplaceWord.propTypes = {
	value: PropTypes.object,
	onChange: PropTypes.func.isRequired,
};

ReplaceWord.defaultProps = {
	value: {},
};

export default ReplaceWord;
