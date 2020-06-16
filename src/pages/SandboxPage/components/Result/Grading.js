import React from 'react';
import { Radio, message, Typography } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { recordGrade } from '../../utils';

const items = new Array(10).fill(1).map((item, index) => index + 1);

const Grading = ({ id, searchTerm, appName }) => {
	const handleGrade = (e) => {
		const {
			target: { value },
		} = e;

		recordGrade({
			id,
			query: searchTerm,
			grade: value,
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
			<Radio.Group size="small" onChange={handleGrade}>
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
	};
};

Grading.propTypes = {
	appName: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	searchTerm: PropTypes.string,
};

Grading.defaultProps = {
	searchTerm: '',
};

export default connect(mapStateToProps, null)(Grading);
