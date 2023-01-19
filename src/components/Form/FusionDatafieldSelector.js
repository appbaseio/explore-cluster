import React, { useEffect, useState } from 'react';
import { css } from 'emotion';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Tooltip, AutoComplete } from 'antd';
import { bool, func, object, string } from 'prop-types';
import { getApiGeneralization } from '../../pages/IntegrationsPage/utils/be-apis';
import apisMapper from '../../batteries/utils/apisMapper';
import { BACKENDS } from '../../batteries/utils';
import { transformGeneralMappingsToFusionArrayFormat } from '../../pages/IntegrationsPage/utils/fusion-apis';

const suggestionCls = css`
	display: flex;
	justify-content: space-between;
	.overflow {
		max-width: 145px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`;
const defaultSelectCls = css`
	.ant-select-selection-placeholder {
		text-align: left;
	}
`;

const FusionDatafieldSelector = ({
	value,
	onChange,
	form,
	handleReload,
	backend,
	includeHighlight,
	endpoints,
}) => {
	const [dynamicFields, setDynamicFields] = useState([]);
	const [isInitial, setIsInitial] = useState(true);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (value && typeof value === 'string') fetchFields(value.split('~')[0]);
	}, []);

	const selectPropsCalculated = {
		placeholder: 'Select data field',
		showSearch: true,
		notFoundContent: null,
		style: {
			width: 295,
		},
	};

	const fetchFields = (query, state = 'initial') => {
		setIsLoading(true);
		const profile = form && form.get('profile') ? form.get('profile').value : 'appbase';
		const indexSettings =
			form && form.get('indexSettings') ? form.get('indexSettings').value : {};
		const secondaryProfile = get(indexSettings, 'fusionSettings.profile', '');
		const schemaConfig = endpoints?.schema || apisMapper[backend].schema || {};
		getApiGeneralization(schemaConfig, { index: secondaryProfile || profile, q: query })
			.then((res) => res.json())
			.then((res) => {
				if (Array.isArray(res)) setDynamicFields(res);
				else {
					const transformedResponse = transformGeneralMappingsToFusionArrayFormat(
						res[secondaryProfile || profile],
					);
					setDynamicFields(transformedResponse);
				}
				setIsLoading(false);
			})
			.catch((err) => {
				console.error('Error to fetch search query profiles', err);
				setDynamicFields([]);
				setIsLoading(false);
			});
		if (state !== 'initial') setIsInitial(false);
	};

	const isValidDataField = (fieldsArr) => {
		if (value) {
			if (Array.isArray(value))
				return (
					value.length &&
					isInitial &&
					!isLoading &&
					(!dynamicFields.length || (dynamicFields.length && !fieldsArr.includes(value)))
				);

			return (
				typeof value === 'string' &&
				value.split('~')[0] &&
				isInitial &&
				!isLoading &&
				(!dynamicFields.length ||
					(dynamicFields.length && !fieldsArr.includes(value.split('~')[0])))
			);
		}
		return false;
	};

	const getValue = () => {
		if (typeof value === 'string') return value.split('~')[0];

		return value;
	};

	const fieldsArr = dynamicFields.map((i) => i.name);
	return (
		<>
			{isValidDataField(fieldsArr) ? (
				<Tooltip title="The provided field has no corresponding mappings with the pipeline">
					<span
						style={{ color: 'orange', marginRight: 10 }}
						role="img"
						aria-label="warning"
					>
						⚠️
					</span>
				</Tooltip>
			) : null}
			<AutoComplete
				placeholder="Select dynamic field"
				className={defaultSelectCls}
				allowClear
				{...selectPropsCalculated}
				onSearch={(val) => {
					onChange(val);
					fetchFields(val, 'fetching');
				}}
				value={getValue() || undefined}
				onSelect={(val) => {
					const highlight =
						typeof value === 'string' ? value.split('~')[1] || false : false;
					if (value === val) {
						// To unselect
						if (includeHighlight) onChange(`~${highlight}`);
						else onChange(undefined);
					} else if (includeHighlight) onChange(`${val}~${highlight}`);
					else onChange(val);
					handleReload();
				}}
				filterOption={(inputValue, option) => {
					return (
						option.props?.children?.title
							?.toUpperCase()
							.indexOf(inputValue?.toUpperCase()) !== -1
					);
				}}
				optionLabelProp="title"
			>
				{dynamicFields.length ? (
					(dynamicFields || []).map((k, idx) => {
						return (
							<AutoComplete.Option
								// eslint-disable-next-line
								key={`${k.name}-${idx}`}
								title={k.name}
								value={k.name}
							>
								<div className={suggestionCls}>
									<div className="overflow">{k.name}</div>
									<div>{k.docCount}</div>
								</div>
							</AutoComplete.Option>
						);
					})
				) : (
					<AutoComplete.Option key="empty-query" value="empty-query" disabled>
						Enter a character to see field suggestions
					</AutoComplete.Option>
				)}
			</AutoComplete>
		</>
	);
};

FusionDatafieldSelector.defaultProps = {
	value: '',
	onChange: () => {},
	handleReload: () => {},
	form: null,
	backend: BACKENDS.ELASTICSEARCH.name,
	includeHighlight: false,
	endpoints: {},
};

FusionDatafieldSelector.propTypes = {
	value: string,
	onChange: func,
	form: object,
	handleReload: func,
	backend: string,
	includeHighlight: bool,
	endpoints: object,
};

const mapStateToProps = (state) => ({
	backend: get(state, '$getAppPlan.results.backend'),
	endpoints: get(state, 'endpoints.data'),
});

export default connect(mapStateToProps, null)(FusionDatafieldSelector);
