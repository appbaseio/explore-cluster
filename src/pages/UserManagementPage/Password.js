import React from 'react';
import { Button, Tooltip } from 'antd';
import { css } from 'react-emotion';
import { connect } from 'react-redux';
import { string, bool } from 'prop-types';
import get from 'lodash/get';
import Flex from '../../batteries/components/shared/Flex';

const EyeIcon = require('react-feather/dist/icons/eye').default;
const EyeOffIcon = require('react-feather/dist/icons/eye-off').default;

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
const passwordContainer = css`
	overflow-x: scroll;
	::-webkit-scrollbar {
		width: none;
	}
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
		const { isAdmin, password } = this.props;
		const disabled = !isAdmin;
		const extraMsg = 'Please note that the password is in encrypted form.';
		return (
			<Flex css={main} alignItems="center">
				<Flex justifyContent="space-between" alignItems="center" css={container}>
					<span className={passwordContainer}>
						{viewKey ? password : '##################################'}
					</span>
					<Tooltip
						placement="topLeft"
						title={`${viewKey ? 'Hide password' : 'View password'}, ${extraMsg}`}
					>
						<Button disabled={disabled} onClick={this.handleViewClick} type="normal">
							{viewKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
						</Button>
					</Tooltip>
				</Flex>
			</Flex>
		);
	}
}

Permission.propTypes = {
	password: string.isRequired,
	isAdmin: bool.isRequired,
};

const mapStateToProps = state => ({
	isAdmin: get(state, 'user.data.isAdmin'),
});

export default connect(mapStateToProps)(Permission);
