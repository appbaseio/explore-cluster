import { Checkbox } from 'antd';
import { css } from 'emotion';
import React, { useContext } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import Flex from '../../../../batteries/components/shared/Flex';
import { FormContext } from '../../../IntegrationsPage/utils/utils';
import SamlConfigForm from './SamlConfigForm';

const CONNECTIONS_NAME_MAP = {
	auth0: 'Username/ Password authentication',
	'google-oauth2': 'Google',
	samlp: 'SAML authentication',
};

const container = css`
	min-height: 300px;
	overflow: auto;

	form#providers-form {
		width: 100%;
		padding: 16px;
		border: 1px solid white;
		margin-top: 8px;
		&.form-error {
			border-color: red;
			border-radius: 4px;
			overflow: visible;
			position: relative;

			&:after {
				content: 'Select atleast one auth provider';
				position: absolute;
				top: -12px;
				left: 50%;
				transform: translateX(-50%);
				width: max-content;
				color: red;
				font-weight: 500;
				background-color: white;
			}
		}
		.flex-container {
			gap: 1rem;
			.ant-checkbox-wrapper + .ant-checkbox-wrapper {
				margin-left: 0;
			}
		}
		h3 {
			margin: 2rem 0 1rem;
			font-weight: 500;
			font-size: 20px;
		}
	}
`;

const Providers = () => {
	const parentForm = useContext(FormContext);
	const {
		controls: { providersForm },
	} = parentForm;

	return (
		<>
			<div className={container}>
				<FieldGroup
					parent={parentForm}
					name="providersForm"
					strict={false}
					render={() => {
						return (
							<>
								<form
									className={`${
										providersForm.submitted && providersForm.errors?.noneChecked
											? 'form-error'
											: ''
									}`}
									id="providers-form"
								>
									<Flex className="flex-container" flexDirection="column">
										<FieldControl
											name="auth0"
											render={({ handler }) => {
												return (
													<Checkbox {...handler('checkbox')}>
														{CONNECTIONS_NAME_MAP.auth0}
													</Checkbox>
												);
											}}
										/>
										{providersForm.value.auth0 && (
											<FieldControl
												name="auth0_enable_signup"
												render={({ handler }) => {
													return (
														<Checkbox
															style={{ marginLeft: '26px' }}
															{...handler('checkbox')}
														>
															Sign up enabled
														</Checkbox>
													);
												}}
											/>
										)}
										<FieldControl
											name="google-oauth2"
											render={({ handler }) => {
												return (
													<Checkbox {...handler('checkbox')}>
														{CONNECTIONS_NAME_MAP['google-oauth2']}
													</Checkbox>
												);
											}}
										/>
									</Flex>
									<h3>Advanced</h3>
									<Flex className="flex-container" flexDirection="column">
										<FieldControl
											name="samlp"
											render={({ handler }) => {
												return (
													<>
														<Checkbox {...handler('checkbox')}>
															{CONNECTIONS_NAME_MAP.samlp}
														</Checkbox>
														<i>
															Enabling SAML is an advanced featured
															and requires specifying additional
															properties.
														</i>
													</>
												);
											}}
										/>
									</Flex>
								</form>
								{providersForm.value.samlp && <SamlConfigForm />}
							</>
						);
					}}
				/>
			</div>
		</>
	);
};

export default React.memo(Providers);
