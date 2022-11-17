import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ArrowRightOutlined, ClusterOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Button, Input } from 'antd';
import { Redirect, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { loadUser } from '../../actions';
import Logo from '../../components/Logo';
import LoginContainer from '../../components/LoginContainer';
import { container, card, gitlabBtn } from './styles';
import {
	getProtocol,
	getURLCredentials,
	getURLParameters,
	isEmpty,
	removeTrailingSlashes,
} from '../../utils';
import { getURL } from '../../constants/config';
import { isFusion } from '../../batteries/utils';

class LoginPage extends Component {
	state = {
		url: '',
		password: '',
		username: '',
	};

	componentDidMount() {
		const urlValue = getURL() || '';
		const credObj = getURLCredentials(urlValue) || {};
		this.setCredentials(credObj);
		this.setState({ url: this.getURLWithoutCredentials(urlValue) });
	}

	setCredentials(credObj) {
		const username =
			credObj.username ||
			localStorage.getItem('username') ||
			sessionStorage.getItem('username') ||
			'';
		const password =
			credObj.password ||
			localStorage.getItem('password') ||
			sessionStorage.getItem('password') ||
			'';
		this.setState({ username: username.trim(), password: password.trim() });
	}

	login = () => {
		const { loadArcUser } = this.props;
		const { username, password, url } = this.state;
		if (username && password && url) {
			loadArcUser(username, password, url);
		}
	};

	onClusterURLBlur = (event) => {
		const { value } = event.target;
		if (!value) return;
		const credObj = getURLCredentials(value) || {};
		const url = this.getURLWithoutCredentials(value);
		if (!isEmpty(credObj)) {
			this.setCredentials(credObj);
		}
		this.setState({ url });
	};

	getURLWithoutCredentials = (value) => {
		const credObj = getURLCredentials(value) || {};
		const { url } = getURLParameters(value);
		const originURL = value.split('@')[1];
		if (url) return removeTrailingSlashes(url);
		if (!isEmpty(credObj))
			return `${getProtocol(value)}//${removeTrailingSlashes(originURL || '')}`;
		return removeTrailingSlashes(value);
	};

	render() {
		const { user } = this.props;
		const { url, username, password } = this.state;
		const redirectUrl = sessionStorage.getItem('redirectUrl');

		if (user.data) {
			if (redirectUrl) {
				return <Redirect to={`${redirectUrl}`} />;
			}
			return <Redirect to="/" />;
		}
		return (
			<LoginContainer>
				<section className={container} style={{ alignItems: 'center' }}>
					{isFusion() ? <Logo type="lucid_works" width={250} /> : <Logo width={250} />}
					<Card className={card} bordered={false}>
						<h2>Sign in to get started</h2>
						<Input
							size="large"
							value={url}
							prefix={<ClusterOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
							placeholder="Cluster URL"
							onChange={(e) => this.setState({ url: e.target.value })}
							onBlur={this.onClusterURLBlur}
							onPressEnter={this.onClusterURLBlur}
							data-cy="cluster-url"
						/>
						<Input
							style={{
								margin: '6px 0',
							}}
							value={username}
							onChange={(e) => this.setState({ username: e.target.value })}
							size="large"
							prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
							placeholder="Username"
						/>
						<Input
							style={{
								margin: '0 0 6px 0',
							}}
							value={password}
							onChange={(e) => this.setState({ password: e.target.value })}
							size="large"
							prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
							type="password"
							placeholder="Password"
						/>
						<Button
							onClick={this.login}
							className={gitlabBtn}
							size="small"
							block
							data-cy="signin-button"
							style={{ height: 40 }}
						>
							Signin
							<ArrowRightOutlined />
						</Button>
					</Card>
					<Link to="/install">
						<Button
							size="large"
							ghost
							className="link-container"
							style={{ whiteSpace: 'inherit' }}
						>
							Install a new reactivesearch.io instance
							<ArrowRightOutlined />
						</Button>
					</Link>
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

const mapDispatchToProps = (dispatch) => ({
	loadArcUser: (u, p, url) => dispatch(loadUser(u, p, url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
