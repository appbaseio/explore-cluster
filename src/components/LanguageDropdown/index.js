import { Select, Form } from 'antd';
import React from 'react';

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
					{[
						{
							value: 'universal',
							label: 'Universal',
						},
						{
							value: 'arabic',
							label: 'Arabic',
						},
						{
							value: 'armenian',
							label: 'Armenian',
						},
						{
							value: 'basque',
							label: 'Basque',
						},
						{
							value: 'bengali',
							label: 'Bengali',
						},
						{
							value: 'brazilian',
							label: 'Brazilian',
						},
						{
							value: 'bulgarian',
							label: 'Bulgarian',
						},
						{
							value: 'catalan',
							label: 'Catalan',
						},
						{
							value: 'chinese',
							label: 'Chinese',
						},
						{
							value: 'japanese',
							label: 'Japanese',
						},
						{
							value: 'korean',
							label: 'Korean',
						},
						{
							value: 'polish',
							label: 'Polish',
						},
						{
							value: 'ukranian',
							label: 'Ukranian',
						},
						{
							value: 'cjk',
							label: 'Cjk',
						},
						{
							value: 'czech',
							label: 'Czech',
						},
						{
							value: 'danish',
							label: 'Danish',
						},
						{
							value: 'dutch',
							label: 'Dutch',
						},
						{
							value: 'english',
							label: 'English',
						},
						{
							value: 'estonian',
							label: 'Estonian',
						},
						{
							value: 'finnish',
							label: 'Finnish',
						},
						{
							value: 'french',
							label: 'French',
						},
						{
							value: 'galician',
							label: 'Galician',
						},
						{
							value: 'german',
							label: 'German',
						},
						{
							value: 'greek',
							label: 'Greek',
						},
						{
							value: 'hindi',
							label: 'Hindi',
						},
						{
							value: 'hungarian',
							label: 'Hungarian',
						},
						{
							value: 'indonesian',
							label: 'Indonesian',
						},
						{
							value: 'irish',
							label: 'Irish',
						},
						{
							value: 'italian',
							label: 'Italian',
						},
						{
							value: 'latvian',
							label: 'Latvian',
						},
						{
							value: 'lithuanian',
							label: 'Lithuanian',
						},
						{
							value: 'norwegian',
							label: 'Norwegian',
						},
						{
							value: 'persian',
							label: 'Persian',
						},
						{
							value: 'portuguese',
							label: 'Portuguese',
						},
						{
							value: 'romanian',
							label: 'Romanian',
						},
						{
							value: 'russian',
							label: 'Russian',
						},
						{
							value: 'sorani',
							label: 'Sorani',
						},
						{
							value: 'spanish',
							label: 'Spanish',
						},
						{
							value: 'swedish',
							label: 'Swedish',
						},
						{
							value: 'turkish',
							label: 'Turkish',
						},
						{
							value: 'thai',
							label: 'Thai',
						},
					].map(renderOption)}
				</Select>
			</Form.Item>
		);
	}
}
