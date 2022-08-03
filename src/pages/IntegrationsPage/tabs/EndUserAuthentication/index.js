import { Checkbox } from 'antd';
import { css } from 'emotion';
import React, { useContext } from 'react';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import Flex from '../../../../batteries/components/shared/Flex';
import { FormContext } from '../../utils';

const container = css`
	min-height: 300px;
	overflow: auto;

	div#end-user-auth-form {
		width: 100%;
		padding: 16px;
		margin-top: 8px;

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

	&.pad-left {
		padding-left: 2rem;
		padding-top: 2rem;
	}
`;

const EndUserAuthentication = () => {
	const endUserAuthForm = useContext(FormContext);

	return (
		<div css={container}>
			<FieldGroup
				parent={endUserAuthForm}
				name="authenticationSettings"
				strict={false}
				render={() => {
					return (
						<div id="end-user-auth-form">
							<Flex className="flex-container" flexDirection="column">
								<FieldControl
									name="enableAuth0"
									render={({ handler }) => {
										return (
											<Checkbox {...handler('checkbox')}>
												Enable end-user authentication for this search UI
											</Checkbox>
										);
									}}
								/>
								<FieldControl
									name="enableProfilePage"
									render={({ handler }) => {
										return (
											<div>
												<Checkbox {...handler('checkbox')}>
													Show profile page at (`/profile`) route where
													end users can view and edit their preferences{' '}
												</Checkbox>
												{handler().value && (
													<div className={`${container} pad-left`}>
														<FieldGroup
															parent={
																endUserAuthForm.authenticationSettings
															}
															name="profileSettingsForm"
															strict={false}
															render={() => {
																return (
																	<div id="profile-settings-form">
																		<Flex
																			className="flex-container"
																			flexDirection="column"
																		>
																			<FieldControl
																				name="viewData"
																				render={({
																					handler:
																						subHandler,
																				}) => {
																					return (
																						<Checkbox
																							{...subHandler(
																								'checkbox',
																							)}
																						>
																							User can
																							view
																							their
																							data
																						</Checkbox>
																					);
																				}}
																			/>
																			<FieldControl
																				name="editData"
																				render={({
																					handler:
																						subHandler,
																				}) => {
																					return (
																						<Checkbox
																							{...subHandler(
																								'checkbox',
																							)}
																						>
																							User can
																							edit
																							their
																							data{' '}
																						</Checkbox>
																					);
																				}}
																			/>
																			<FieldControl
																				name="closeAccount"
																				render={({
																					handler:
																						subHandler,
																				}) => {
																					return (
																						<Checkbox
																							{...subHandler(
																								'checkbox',
																							)}
																						>
																							User can
																							close
																							their
																							account
																							(GDPR
																							compliance){' '}
																						</Checkbox>
																					);
																				}}
																			/>{' '}
																			<FieldControl
																				name="editThemeSettings"
																				render={({
																					handler:
																						subHandler,
																				}) => {
																					return (
																						<Checkbox
																							{...subHandler(
																								'checkbox',
																							)}
																						>
																							Allow
																							user to
																							set
																							theme
																							settings{' '}
																						</Checkbox>
																					);
																				}}
																			/>
																			<FieldControl
																				name="editSearchPreferences"
																				render={({
																					handler:
																						subHandler,
																				}) => {
																					return (
																						<Checkbox
																							{...subHandler(
																								'checkbox',
																							)}
																						>
																							Allow
																							users to
																							specify
																							search
																							preferences{' '}
																						</Checkbox>
																					);
																				}}
																			/>
																		</Flex>
																	</div>
																);
															}}
														/>
													</div>
												)}
											</div>
										);
									}}
								/>
							</Flex>
						</div>
					);
				}}
			/>
		</div>
	);
};

export default React.memo(EndUserAuthentication);
