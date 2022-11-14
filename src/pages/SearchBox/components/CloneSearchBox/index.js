import React from 'react';
import PropTypes from 'prop-types';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Button, message, notification, Typography } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import {
	cloneSearchBox as cloneSearchBoxAction,
	fetchSearchBoxes as fetchSearchBoxesAction,
} from '../../../../batteries/modules/actions';

const CloneSearchBoxComponent = (props) => {
	const {
		searchBox,
		isMobile,
		ghost,
		buttonStyle,
		buttonSize,
		history,
		fetchSearchBoxes,
		cloneSearchBox,
	} = props;
	const handleClone = () => {
		const refSearchBox = { ...searchBox };
		if (refSearchBox.updated_at) {
			delete refSearchBox.updated_at;
		}
		if (refSearchBox.created_at) {
			delete refSearchBox.created_at;
		}
		cloneSearchBox(refSearchBox).then((res) => {
			if (res && res.error) {
				notification.error({
					message: 'Error',
					description: get(res.error, 'message'),
				});
			} else {
				message.success(`Searchbox cloned successfully`);
				fetchSearchBoxes();
				if (history) {
					history.push('/cluster/searchboxes');
				}
			}
		});
	};
	if (isMobile) {
		return (
			// eslint-disable-next-line
			<div onClick={handleClone}>
				<LegacyIcon type={searchBox.isCloning ? 'loading' : 'copy'} />{' '}
				<Typography.Text>Clone</Typography.Text>
			</div>
		);
	}
	return (
		<Button
			onClick={handleClone}
			type="primary"
			ghost={ghost}
			style={buttonStyle}
			size={buttonSize}
			disabled={searchBox.isCloning}
		>
			<LegacyIcon type={searchBox.isCloning ? 'loading' : 'copy'} />
		</Button>
	);
};

CloneSearchBoxComponent.propTypes = {
	searchBox: PropTypes.object,
	isMobile: PropTypes.bool,
	ghost: PropTypes.bool,
	buttonStyle: PropTypes.object,
	buttonSize: PropTypes.string,
	history: PropTypes.object,
	fetchSearchBoxes: PropTypes.func.isRequired,
	cloneSearchBox: PropTypes.func.isRequired,
};

CloneSearchBoxComponent.defaultProps = {
	searchBox: {},
	isMobile: false,
	ghost: false,
	buttonStyle: {},
	buttonSize: 'default',
	history: undefined,
};

const mapStateToProps = () => {
	return {};
};
const mapDispatchToProps = (dispatch) => ({
	fetchSearchBoxes: () => dispatch(fetchSearchBoxesAction()),
	cloneSearchBox: (searchbox) => dispatch(cloneSearchBoxAction(searchbox)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CloneSearchBoxComponent);
