import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, message } from 'antd';
import { Validators } from 'react-reactive-form';
import { emailBtn, inputStyles, smallBtn } from './styles';
import { ACC_API } from '../../constants/config';
import Flex from '../../batteries/components/shared/Flex';

class EmailAuth extends React.Component {
	state = {
		emailInput: sessionStorage.getItem('signup-email'),
		isLoading: false,
		isVerifying: false,
		showOtp: false,
		otp: '',
	};

	handleInput = (e) => {
		const {
			target: { name, value },
		} = e;
		this.setState({
			[name]: value.trim(),
		});
	};

	toggleLoading = () => {
		this.setState(({ isLoading }) => ({
			isLoading: !isLoading,
		}));
	};

	toggleVerifyLoading = () => {
		this.setState(({ isVerifying }) => ({
			isVerifying: !isVerifying,
		}));
	};

	handleEmailSubmission = async () => {
		const { emailInput } = this.state;
		const hasError = Validators.email({ value: emailInput });

		if (!hasError) {
			this.toggleLoading();
			try {
				const response = await fetch(`${ACC_API}/arc/instance`, {
					method: 'PUT',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						email: emailInput,
					}),
				});
				const data = await response.json();
				if (response.status >= 400) {
					message.error(data.message);
					this.toggleLoading();
				} else {
					this.toggleLoading();
					message.success(data.message);
					this.setState({
						showOtp: true,
						otp: '',
					});
				}
			} catch (e) {
				message.error('Something went wrong.');
			}
		} else {
			message.error('Please enter a valid email');
		}
	};

	verifyOtp = async () => {
		const { emailInput, otp } = this.state;
		this.toggleVerifyLoading();
		try {
			const response = await fetch(`${ACC_API}/arc/instance`, {
				method: 'PUT',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					email: emailInput,
					otp,
				}),
			});
			const data = await response.json();
			if (response.status >= 400) {
				message.error(data.message);
				this.toggleVerifyLoading();
			} else {
				message.success(
					'We have sent you the Arc installation instructions in the e-mail.',
				);
				this.toggleVerifyLoading();
				setTimeout(() => {
					window.location.href = '/install';
				}, 1000);
			}
		} catch (e) {
			message.error('Something went Wrong.');
		}
	};

	resetEmail = () => {
		this.setState({
			emailInput: '',
			isLoading: false,
			isVerifying: false,
			showOtp: false,
			otp: '',
		});
	};

	render() {
		const {
            isEmailAuth, toggleEmailAuth, authText, disabled,
		} = this.props; // prettier-ignore
		const {
            isLoading, showOtp, emailInput, otp, isVerifying,
		} = this.state; // prettier-ignore

		return (
			<React.Fragment>
				{isEmailAuth ? (
					<Input
						placeholder="Enter Email"
						name="emailInput"
						disabled={showOtp}
						onChange={this.handleInput}
						size="large"
						className={inputStyles}
						value={emailInput}
					/>
				) : null}
				{showOtp ? (
					<React.Fragment>
						<Input
							placeholder="Enter OTP"
							name="otp"
							onChange={this.handleInput}
							value={otp}
							size="large"
							className={inputStyles}
						/>

						<Button
							onClick={this.verifyOtp}
							icon="check-circle"
							size="small"
							loading={isVerifying}
							className={emailBtn}
							block
						>
							Verify OTP
						</Button>
						<Flex flexDirection="column" alignItems="flex-end">
							<Button
								onClick={isEmailAuth ? this.handleEmailSubmission : toggleEmailAuth}
								icon={isEmailAuth ? '' : 'mail'}
								size="small"
								disabled={disabled}
								className={smallBtn}
								type="link"
							>
								{isLoading ? 'Sending ...' : 'Resend OTP'}
							</Button>
							<Button
								type="link"
								onClick={this.resetEmail}
								size="small"
								className={smallBtn}
							>
								Try with a different email
							</Button>
						</Flex>
					</React.Fragment>
				) : (
					<Button
						onClick={isEmailAuth ? this.handleEmailSubmission : toggleEmailAuth}
						icon={isEmailAuth ? '' : 'mail'}
						size="large"
						disabled={disabled}
						loading={isLoading}
						className={emailBtn}
						type="primary"
						block
					>
						{isEmailAuth ? 'Receive OTP' : authText}
					</Button>
				)}
			</React.Fragment>
		);
	}
}

EmailAuth.propTypes = {
	isEmailAuth: PropTypes.bool,
	toggleEmailAuth: PropTypes.func,
	authText: PropTypes.string,
	disabled: PropTypes.bool,
};

EmailAuth.defaultProps = {
	isEmailAuth: false,
	toggleEmailAuth: () => {},
	authText: '',
	disabled: false,
};

export default EmailAuth;
