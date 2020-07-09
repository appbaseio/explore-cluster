import React from 'react';
import { Radio, message, Typography } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { recordGrade } from '../../utils';
import { allowedTiers } from '../../../../utils/prop-types';
import { isValidPlan } from '../../../../batteries/utils';

const items = Array.from({ length: 10 }, (_, index) => index + 1);

const Grading = ({ id, searchTerm, appName, tier, featureGrade, value }) => {
	const handleGrade = (e) => {
		const {
			target: { value: grade },
		} = e;

		recordGrade({
			id,
			query: searchTerm,
			grade,
			index: appName,
		})
			.then((res) => message.success(res.message))
			.catch((error) => {
				console.error(error);
			});
	};
	return (
		<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 15 }}>
			<Typography.Text strong style={{ marginRight: 5 }}>
				Grade this result
			</Typography.Text>
			<Radio.Group
				defaultValue={value}
				key={value}
				size="small"
				disabled={!isValidPlan(tier, featureGrade)}
				onChange={handleGrade}
			>
				{items.map((item) => (
					<Radio.Button value={item}>{item}</Radio.Button>
				))}
			</Radio.Group>
		</div>
	);
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name', 'default');
	return {
		appName,
		tier: get(state, '$getAppPlan.results.tier'),
		featureGrade: get(state, '$getAppPlan.results.feature_search_grader'),
	};
};

Grading.propTypes = {
	appName: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	searchTerm: PropTypes.string,
	tier: allowedTiers.isRequired,
	featureGrade: PropTypes.bool,
	value: PropTypes.number,
};

Grading.defaultProps = {
	searchTerm: '',
	featureGrade: false,
	value: null,
};

export default connect(mapStateToProps, null)(Grading);
