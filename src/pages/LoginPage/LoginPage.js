import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
 Card, Button, Icon, Input,
} from 'antd';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { loadUser } from '../../actions';
import LoginContainer from '../../components/LoginContainer';
import { container, card, gitlabBtn } from './styles';
import { getURL } from '../../constants/config';

class LoginPage extends Component {
	constructor(props) {
		super(props);
		this.username = React.createRef();
		this.password = React.createRef();
		this.url = React.createRef();
	}

	login = () => {
		const { loadArcUser } = this.props;
		const username = this.username.current.input.value.trim();
		const password = this.password.current.input.value;
		const url = this.url.current.input.value;

		if (username && password) {
			loadArcUser(username, password, url);
		}
	};

	render() {
		const { user } = this.props;
		if (user.data) {
			return <Redirect to="/" />;
		}
		const ACC_API = getURL();
		return (
			<LoginContainer>
				<section className={container}>
					<Card className={card} bordered={false}>
						<h2>Sign in to get started</h2>
						<Input
							ref={this.url}
							size="large"
							defaultValue={ACC_API}
							prefix={<Icon type="cluster" style={{ color: 'rgba(0,0,0,.25)' }} />}
							placeholder="Cluster URL"
						/>
						<Input
							css={{
								margin: '6px 0',
							}}
							ref={this.username}
							size="large"
							prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
							placeholder="Username"
						/>
						<Input
							css={{
								margin: '0 0 6px 0',
							}}
							ref={this.password}
							size="large"
							prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
							type="password"
							placeholder="Password"
						/>
						<Button onClick={this.login} className={gitlabBtn} size="small" block>
							Signin
							<Icon type="arrow-right" />
						</Button>
					</Card>
				</section>
			</LoginContainer>
		);
	}
}

LoginPage.propTypes = {
	user: PropTypes.object.isRequired,
	loadArcUser: PropTypes.func.isRequired,
};

const mapStateToProps = ({ user }) => ({
	user,
});

const mapDispatchToProps = dispatch => ({
	loadArcUser: (u, p, url) => dispatch(loadUser(u, p, url)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(LoginPage);
