import React from 'react';
import { connect } from 'react-redux';
import { Card, Button, Icon, Checkbox } from 'antd';
import { Redirect, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import EmailAuth from './EmailAuth';
import LoginContainer from '../../components/LoginContainer';

import { card } from '../LoginPage/styles';
import { checkbox } from './styles';

class InstallPage extends React.Component {
	state = {
		hasAgreedTOS: true,
		hasSubscribed: false,
	};

	toggleEmailSignup = () => {
		this.setState(({ isEmailSignup }) => ({
			isEmailSignup: !isEmailSignup,
		}));
	};

	handleChange = e => {
		const {
			target: { name: checkboxName },
		} = e;

		this.setState(state => ({
			...state,
			[checkboxName]: !state[checkboxName],
		}));
	};

	render() {
		const {
			user: { data },
		} = this.props;
		const { hasSubscribed, hasAgreedTOS } = this.state;
		if (data) {
			return <Redirect to="/" />;
		}
		return (
			<LoginContainer>
				<React.Fragment>
					<Card
						className={card}
						style={{
							marginTop: 30,
						}}
						bordered={false}
					>
						<h2>Install A New Arc Instance</h2>

						<section style={{ marginBottom: 20 }}>
							<Checkbox
								onChange={this.handleChange}
								className={checkbox}
								name="hasAgreedTOS"
								checked={hasAgreedTOS}
							>
								<div
									style={{
										display: 'inline-block',
										paddingLeft: 5,
									}}
								>
									By creating an arc instance, you agree to our Terms of Service
									and Privacy Policy.
								</div>
							</Checkbox>
							<Checkbox
								onChange={this.handleChange}
								className={checkbox}
								name="hasSubscribed"
								checked={hasSubscribed}
							>
								<div
									style={{
										display: 'inline-block',
										paddingLeft: 5,
									}}
								>
									Yes, I would like to receive a monthly e-mail on Appbase
									products, use-cases and promotions via e-mail.
								</div>
							</Checkbox>
						</section>
						<EmailAuth
							disabled={!hasAgreedTOS}
							isEmailAuth
							toggleEmailAuth={this.toggleEmailSignup}
							authText="Sign up via Email"
						/>
					</Card>

					<Link to="/login">
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
							Already installed Arc? &nbsp; Sign in here
							<Icon type="arrow-right" />
						</Button>
					</Link>
				</React.Fragment>
			</LoginContainer>
		);
	}
}

InstallPage.propTypes = {
	user: PropTypes.object.isRequired,
};

const mapStateToProps = ({ user }) => ({
	user,
});

export default connect(mapStateToProps, null)(InstallPage);
