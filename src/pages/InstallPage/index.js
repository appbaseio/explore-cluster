import React from 'react';
import { connect } from 'react-redux';
import { Card, Button, Icon, Checkbox } from 'antd';
import { Redirect, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import EmailAuth from './EmailAuth';
import LoginContainer from '../../components/LoginContainer';
import Logo from '../../components/Logo';
import Flex from '../../batteries/components/shared/Flex';
import { card } from '../LoginPage/styles';
import { checkbox } from './styles';
import { isFusion } from '../../batteries/utils';

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

	handleChange = (e) => {
		const {
			target: { name: checkboxName },
		} = e;

		this.setState((state) => ({
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
					<Flex flexDirection="column" alignItems="center" justifyContent="center">
						{isFusion() ? (
							<Logo type="lucid_works" width={250} />
						) : (
							<Logo width={250} />
						)}
						<Card className={card} bordered={false}>
							<h2>Install a new reactivesearch.io instance</h2>

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
										By creating an reactivesearch.io instance, you agree to our
										Terms of Service and Privacy Policy.
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
										Yes, I would like to receive a monthly digest e-mail on
										reactivesearch.io products, use cases and open-source
										updates.
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
									whiteSpace: 'inherit',
								}}
							>
								Already installed reactivesearch.io? &nbsp; Sign in here
								<Icon type="arrow-right" />
							</Button>
						</Link>
					</Flex>
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
