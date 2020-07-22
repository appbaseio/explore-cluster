import React from 'react';
import { Radio, message, Typography } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { recordGrade } from '../../utils';
import { allowedTiers } from '../../../../utils/prop-types';
import { isValidPlan } from '../../../../batteries/utils';
import SandboxContext from '../SandboxContext';

const items = Array.from({ length: 10 }, (_, index) => index + 1);

class Grading extends React.Component {
	handleGrade = (e) => {
		const { id } = this.props;
		const { searchTerm, app } = this.context;

		const {
			target: { value: grade },
		} = e;

		recordGrade({
			id,
			query: searchTerm,
			grade,
			index: app,
		})
			.then((res) => message.success(res.message))
			.catch((error) => {
				console.error(error);
			});
	};

	render() {
		const { tier, featureGrade, id } = this.props;
		const { queryGrades, isGradingEnabled } = this.context;

		if (!isGradingEnabled) {
			return null;
		}

		const value = get(queryGrades, id);

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
					onChange={this.handleGrade}
				>
					{items.map((item) => (
						<Radio.Button value={item}>{item}</Radio.Button>
					))}
				</Radio.Group>
			</div>
		);
	}
}

Grading.contextType = SandboxContext;

const mapStateToProps = (state) => ({
	tier: get(state, '$getAppPlan.results.tier'),
	featureGrade: get(state, '$getAppPlan.results.feature_search_grader'),
});

Grading.propTypes = {
	id: PropTypes.string.isRequired,
	tier: allowedTiers.isRequired,
	featureGrade: PropTypes.bool,
};

Grading.defaultProps = {
	featureGrade: false,
};

export default connect(mapStateToProps, null)(Grading);
