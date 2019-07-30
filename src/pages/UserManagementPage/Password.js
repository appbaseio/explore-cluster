import React from 'react';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import { string } from 'prop-types';
import get from 'lodash/get';
import Flex from '../../batteries/components/shared/Flex';

const main = css`
	.ant-btn {
		border: transparent;
		margin-left: 5px;
		padding: 0 5px;
	}
`;
const container = css`
	border: 1px solid #e8e8e8;
	padding: 2px 10px;
	.ant-btn {
		border: transparent;
		background-color: transparent;
		margin-left: 5px;
		padding: 0 5px;
	}
	width: 370px;
`;

class Permission extends React.Component {
	state = {
		viewKey: false,
	};

	handleViewClick = () => {
		this.setState(prevState => ({
			viewKey: !prevState.viewKey,
		}));
	};

	render() {
		const { viewKey } = this.state;
		const { password } = this.props;

		return (
			<Flex css={main} alignItems="center">
				<Flex justifyContent="space-between" alignItems="center" css={container}>
					<span>{viewKey ? password : '##################################'}</span>
				</Flex>
			</Flex>
		);
	}
}

Permission.propTypes = {
	password: string.isRequired,
};

const mapStateToProps = state => ({
	isAdmin: get(state, 'user.data.isAdmin'),
});

export default connect(mapStateToProps)(Permission);
