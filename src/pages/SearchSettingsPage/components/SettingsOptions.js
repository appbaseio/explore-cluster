import React from 'react';
import { Switch, Tooltip, Icon, Radio, Select } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import settingsMap from '../../../components/ReviewAndSave/helper';

const { Option } = Select;
const TOLERANCE_OPTIONS = ['AUTO', 1, 2];

const optionContainer = css`
	margin: 16px 0;

	h6 {
		font-weight: 500;
		font-size: 14px;
		margin-bottom: 5px;
		margin-top: 15px;
		color: rgba(0, 0, 0, 0.85);
	}
`;

const SettingsOptions = ({
	handleChange,
	enableNgram,
	enableSynonyms,
	fuzziness,
	queryFormat,
	queryType,
}) => (
	<div className={optionContainer}>
		<h6>
			Query Type
			<Tooltip title={settingsMap.queryType.description}>
				<Icon style={{ marginLeft: 5 }} type="info-circle" />
			</Tooltip>
		</h6>
		<Radio.Group
			style={{ display: 'flex', marginBottom: 8 }}
			onChange={(e) => handleChange('queryType', e.target.value)}
			value={queryType}
		>
			<Radio value="default">ReactiveSearch</Radio>
			<Radio value="queryString">
				{settingsMap.queryString.title}
				<Tooltip title={settingsMap.queryString.description}>
					<Icon type="info-circle" />
				</Tooltip>
			</Radio>
			<Radio value="searchOperators" data-cy="search-operators-radio-button">
				{settingsMap.searchOperators.title}
				<Tooltip title={settingsMap.searchOperators.description}>
					<Icon type="info-circle" />
				</Tooltip>
			</Radio>
		</Radio.Group>
		<h6>
			Query Format
			<Tooltip title={settingsMap.queryFormat.description}>
				<Icon style={{ marginLeft: 5 }} type="info-circle" />
			</Tooltip>
		</h6>
		<Radio.Group
			style={{ display: 'flex', marginBottom: 8 }}
			onChange={(e) => handleChange('queryFormat', e.target.value)}
			value={queryFormat}
		>
			<Radio value="or">Or</Radio>
			<Radio value="and" data-cy="query-format-and-radio">
				And
			</Radio>
		</Radio.Group>
		<h6>
			{settingsMap.enableTypoTolerance.title}
			<Tooltip title={settingsMap.enableTypoTolerance.description}>
				<Icon type="info-circle" />
			</Tooltip>
		</h6>
		<Switch
			checked={Boolean(fuzziness)}
			onChange={(value) => {
				if (value) {
					handleChange('fuzziness', TOLERANCE_OPTIONS[0]);
				} else {
					handleChange('fuzziness', 0);
				}
			}}
			data-cy="typo-tolerance-switch"
		/>

		{Boolean(fuzziness) && (
			<React.Fragment>
				<h6>
					{settingsMap.typoToleranceValue.title}
					<Tooltip title={settingsMap.typoToleranceValue.description}>
						<Icon type="info-circle" />
					</Tooltip>
				</h6>
				<Select
					placeholder="Select typo tolerance"
					value={fuzziness || TOLERANCE_OPTIONS[0]}
					style={{ minWidth: 120 }}
					onChange={(value) => {
						handleChange('fuzziness', value);
					}}
				>
					{TOLERANCE_OPTIONS.map((option) => (
						<Option key={option} value={option}>
							{option}
						</Option>
					))}
				</Select>
			</React.Fragment>
		)}

		<h6>
			Enable Synonyms
			<Tooltip title={settingsMap.synonyms.description}>
				<Icon type="info-circle" />
			</Tooltip>
		</h6>
		<Switch
			checked={enableSynonyms}
			onChange={(value) => handleChange('enableSynonyms', value)}
			data-cy="synonyms-switch"
		/>

		<h6>
			{settingsMap.enableNgram.title}
			<Tooltip title={settingsMap.enableNgram.description}>
				<Icon type="info-circle" />
			</Tooltip>
		</h6>
		<Switch
			checked={enableNgram}
			onChange={(value) => handleChange('enableNgram', value)}
			data-cy="ngram-switch"
		/>
	</div>
);

SettingsOptions.propTypes = {
	handleChange: PropTypes.func.isRequired,
	enableNgram: PropTypes.bool.isRequired,
	enableSynonyms: PropTypes.bool.isRequired,
	fuzziness: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	queryFormat: PropTypes.string.isRequired,
	queryType: PropTypes.string.isRequired,
};

export default SettingsOptions;
