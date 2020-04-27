import React from 'react';
import { Layout } from 'antd';
import { object } from 'prop-types';
import { connect } from 'react-redux';

import Logo from '../Logo';
import UserMenu from '../AppHeader/UserMenu';
import headerStyles from './styles';

const { Header } = Layout;

const FullHeader = ({ user }) => (
	<Header className={headerStyles}>
		<div className="row">
			<Logo />
		</div>
		<UserMenu user={user} />
	</Header>
);

FullHeader.propTypes = {
	user: object.isRequired,
};

const mapStateToProps = (state) => ({
	user: state.user.data,
});

export default connect(mapStateToProps)(FullHeader);
