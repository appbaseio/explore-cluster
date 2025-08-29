import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Switch, Tooltip, Radio, Select, InputNumber, notification } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import settingsMap from '../../../components/ReviewAndSave/helper';
import DataFieldSelector from '../../../components/Form/DataFieldSelector';
import VersionController from '../../../batteries/components/shared/VersionController';

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
	enableAutoSuggestion,
	enableSynonyms,
	fuzziness,
	queryFormat,
	queryType,
	distinctField,
	updatedSettings,
	indexSettings,
}) => {
	const [ngramSettings, setNgramSettings] = useState({});
	const [errorMsgNgram, setErrorMsgNgram] = useState('');

	useEffect(() => {
		if (
			indexSettings.ngramSettings &&
			indexSettings.ngramSettings.min_gram &&
			indexSettings.ngramSettings.max_gram
		) {
			setNgramSettings({
				min_gram: indexSettings.ngramSettings.min_gram,
				max_gram: indexSettings.ngramSettings.max_gram,
			});
		} else if (updatedSettings && updatedSettings.index) {
			if (!updatedSettings.index.analysis) {
				// Don't show notification on mount, only when user tries to enable
			} else if (!updatedSettings.index.analysis.filter.ngram_filter) {
				setNgramSettings({
					min_gram: 3,
					max_gram: 7,
				});
			} else {
				setNgramSettings({
					min_gram: parseInt(
						updatedSettings.index.analysis.filter.ngram_filter.min_gram,
						10,
					),
					max_gram: parseInt(
						updatedSettings.index.analysis.filter.ngram_filter.max_gram,
						10,
					),
				});
			}
		}
	}, [updatedSettings, indexSettings]);
	function validateChars(min, max) {
		if (min && max && max >= min) {
			return true;
		}
		return false;
	}

	return (
		<div className={optionContainer}>
			<h6>
				Query Type
				<Tooltip title={settingsMap.queryType.description}>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
				</Tooltip>
			</h6>
			<Radio.Group
				style={{ display: 'flex', marginBottom: 8 }}
				onChange={(e) => handleChange('queryType', e.target.value)}
				value={queryType}
			>
				<Radio value="default">ReactiveSearch</Radio>
				<Radio value="queryString">
					{settingsMap.queryString.title}{' '}
					<Tooltip title={settingsMap.queryString.description}>
						<InfoCircleOutlined />
					</Tooltip>
				</Radio>
				<Radio value="searchOperators" data-cy="search-operators-radio-button">
					{settingsMap.searchOperators.title}{' '}
					<Tooltip title={settingsMap.searchOperators.description}>
						<InfoCircleOutlined />
					</Tooltip>
				</Radio>
			</Radio.Group>
			<h6>
				Query Format{' '}
				<Tooltip title={settingsMap.queryFormat.description}>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
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
				{settingsMap.distinctField.title}{' '}
				<Tooltip title={settingsMap.distinctField.description}>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
				</Tooltip>
			</h6>
			<VersionController version="7.42.0">
				<DataFieldSelector
					// only allow fields with `keyword` and `numeric` mappings
					includeMappings={['keyword']}
					// numeric fields https://www.elastic.co/guide/en/elasticsearch/reference/current/number.html
					includeTypes={[
						'long',
						'integer',
						'short',
						'byte',
						'double',
						'float',
						'half_float',
						'scaled_float',
						'unsigned_long',
					]}
					selectProps={{
						value: distinctField ? distinctField.split('.keyword')[0] : undefined,
						onChange: (val) => {
							if (distinctField === val) {
								// To unselect
								handleChange('distinctField', undefined);
							} else {
								handleChange('distinctField', val);
							}
						},
					}}
				/>
			</VersionController>

			<h6>
				{settingsMap.enableTypoTolerance.title}{' '}
				<Tooltip title={settingsMap.enableTypoTolerance.description}>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
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
						{settingsMap.typoToleranceValue.title}{' '}
						<Tooltip title={settingsMap.typoToleranceValue.description}>
							<InfoCircleOutlined style={{ marginLeft: 5 }} />
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
				Enable Synonyms{' '}
				<Tooltip title={settingsMap.synonyms.description}>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
				</Tooltip>
			</h6>
			<Switch
				checked={enableSynonyms}
				onChange={(value) => handleChange('enableSynonyms', value)}
				data-cy="synonyms-switch"
			/>

			<h6>
				{settingsMap.enableNgram.title}{' '}
				<Tooltip
					title={`${settingsMap.enableNgram.description} Note: This feature requires the index to have analyzers.`}
				>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
				</Tooltip>
			</h6>
			<Switch
				checked={enableNgram}
				disabled={
					!updatedSettings || !updatedSettings.index || !updatedSettings.index.analysis
				}
				onChange={(value) => {
					if (
						value &&
						updatedSettings &&
						updatedSettings.index &&
						!updatedSettings.index.analysis
					) {
						notification.warning({
							message: `The index doesn't contain any analyzers, it's not possible to add N-gram related settings`,
							description: `The index doesn't contain any analyzers, it's not possible to add N-gram related settings`,
						});
						return;
					}
					handleChange('enableNgram', value);
				}}
				data-cy="ngram-switch"
			/>
			{enableNgram && (
				<div>
					<div>
						<h6>
							N-gram Settings{' '}
							<Tooltip title={settingsMap.enableNgram.description}>
								<InfoCircleOutlined style={{ marginLeft: 5 }} />
							</Tooltip>
						</h6>
						<div style={{ display: 'flex' }}>
							<div style={{ margin: '10px 10px 5px 10px' }}>
								Min Chars
								<InputNumber
									style={{ marginLeft: '10px' }}
									value={ngramSettings.min_gram}
									min={1}
									max={20}
									onChange={(val) => {
										setNgramSettings({
											...ngramSettings,
											min_gram: val,
										});
										if (
											validateChars(val, ngramSettings.max_gram) &&
											enableNgram
										) {
											setErrorMsgNgram('');
											handleChange('ngramSettings', enableNgram, {
												ngramSettings: {
													...ngramSettings,
													min_gram: val,
												},
											});
										} else {
											setErrorMsgNgram(`max chars vaue ≥ min chars value`);
										}
									}}
								/>
							</div>
							<div style={{ margin: '10px 0px 5px 10px' }}>
								Max Chars
								<InputNumber
									style={{ marginLeft: '10px' }}
									value={ngramSettings.max_gram}
									min={1}
									max={20}
									onChange={(val) => {
										setNgramSettings({
											...ngramSettings,
											max_gram: val,
										});
										if (
											validateChars(ngramSettings.min_gram, val) &&
											enableNgram
										) {
											setErrorMsgNgram('');
											handleChange('ngramSettings', enableNgram, {
												ngramSettings: {
													...ngramSettings,
													max_gram: val,
												},
											});
										} else {
											setErrorMsgNgram(
												`max chars - min chars should be ≤ 5 and max ≥ min`,
											);
										}
									}}
								/>
							</div>
						</div>
					</div>
					<div style={{ color: 'tomato' }}>{errorMsgNgram}</div>
				</div>
			)}
			<h6>
				{settingsMap.enableAutoSuggestion.title}{' '}
				<Tooltip
					title={`${settingsMap.enableAutoSuggestion.description} Note: This feature requires the index to have analyzers.`}
				>
					<InfoCircleOutlined style={{ marginLeft: 5 }} />
				</Tooltip>
			</h6>
			<Switch
				checked={enableAutoSuggestion}
				disabled={
					!updatedSettings || !updatedSettings.index || !updatedSettings.index.analysis
				}
				onChange={(value) => {
					if (
						value &&
						updatedSettings &&
						updatedSettings.index &&
						!updatedSettings.index.analysis
					) {
						notification.warning({
							message: `The index doesn't contain any analyzers, it's not possible to add N-gram related settings`,
							description: `The index doesn't contain any analyzers, it's not possible to add N-gram related settings`,
						});
						return;
					}
					handleChange('enableAutoSuggestion', value);
				}}
				data-cy="autosuggestion-switch"
			/>
		</div>
	);
};
SettingsOptions.defaultProps = {
	distinctField: undefined,
	enableAutoSuggestion: false,
};

SettingsOptions.propTypes = {
	handleChange: PropTypes.func.isRequired,
	enableNgram: PropTypes.bool.isRequired,
	enableAutoSuggestion: PropTypes.bool,
	enableSynonyms: PropTypes.bool.isRequired,
	fuzziness: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	queryFormat: PropTypes.string.isRequired,
	queryType: PropTypes.string.isRequired,
	distinctField: PropTypes.string,
	updatedSettings: PropTypes.object.isRequired,
	indexSettings: PropTypes.object.isRequired,
};

export default SettingsOptions;
