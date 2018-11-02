import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
 Card, Button, Icon, Input,
} from 'antd';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import { loadUser } from '../../actions';
import Logo from '../../components/Logo';
import { container, card, gitlabBtn } from './styles';

class LoginPage extends Component {
	constructor(props) {
		super(props);
		this.username = React.createRef();
		this.password = React.createRef();
	}

	login = () => {
		const { loadArcUser } = this.props;
		const username = this.username.current.input.value.trim();
		const password = this.password.current.input.value;

		if (username && password) {
			loadArcUser(username, password);
		}
	};

	render() {
		const { user } = this.props;
		if (user.data) {
			return <Redirect to="/" />;
		}
		return (
			<section className={container}>
				<Logo width={200} />
				<Card className={card} bordered={false}>
					<h2>Sign in to get started</h2>
					<Input
						ref={this.username}
						size="large"
						prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
						placeholder="Username"
					/>
					<Input
						css={{
							margin: '6px 0',
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

				{/* <Link to="/signup">
					<Button
						size="large"
						ghost
						css={{
							border: 0,
							boxShadow: 'none',
							color: '#424242',
							margin: '20px 0',
							fontSize: 18,
							letterSpacing: '0.02rem',
						}}
					>
						New to appbase? &nbsp; Signup here
						<Icon type="arrow-right" />
					</Button>
				</Link> */}
			</section>
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
	loadArcUser: (u, p) => dispatch(loadUser(u, p)),
});

export default connect(
	mapStateToProps,
	mapDispatchToProps,
)(LoginPage);
