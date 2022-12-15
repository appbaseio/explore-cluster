import React, { useContext } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, InputNumber } from 'antd';
import { css } from 'react-emotion';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../../../components/CreateCredentials/Grid';
import { suggestionsMessages as Messages } from '../../../../utils/messages';
import styles from '../styles';
import { FormContext } from '../../../IntegrationsPage/utils/utils';
import IndexMultiSelect from './IndexMultiSelect';

export const PreferenceFormContext = React.createContext();

const modal = css`
	max-width: 800px;
	margin: 20px auto;
	background-color: #fff;
	width: 100%;
	.error {
		color: tomato;
		padding: 5px 0;
	}
	.input-error {
		border-color: tomato;
	}
	.select-error {
		border: 1px solid tomato;
		border-radius: 2px;
	}
	.heading {
		font-weight: bold;
		margin-bottom: 30px;
		margin-top: 40px;
	}
	.required-marker {
		color: red;
		font-size: 1rem;
	}
`;

const content = (message) => {
	return <div>{message}</div>;
};

function PreferenceForm() {
	const mainForm = useContext(FormContext);
	const control = mainForm.get('popular');
	return (
		<FieldGroup
			control={control}
			strict={false}
			render={(
				{ invalid: invalidForm, submitted }, // eslint-disable-line
			) => {
				return (
					<div css={modal} data-cy="popular-suggestions-fields-container">
						<FieldControl
							name="indices"
							render={({ handler, errors, touched }) => {
								const showError = (submitted || touched) && errors?.required;
								return (
									<Grid
										label={
											<p css={styles.labelContainer} data-cy="indices-label">
												<span className="required-marker">*</span>
												Indices
												<Popover
													content={content(Messages.indices)}
													css={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<div>
												<IndexMultiSelect
													className={showError ? 'select-error' : ''}
													{...handler()}
												/>
												{showError && (
													<div className="error">
														This is a required field
													</div>
												)}
											</div>
										}
									/>
								);
							}}
						/>
						<FieldControl
							name="minCount"
							render={({ handler, value, touched, errors }) => {
								const showError = (submitted || touched) && errors?.required;
								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												<span>Min Count</span>
												<Popover
													content={content(Messages.minCount)}
													css={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<div>
												<InputNumber
													{...handler()}
													className={showError ? 'input-error' : ''}
													style={{ width: '100%' }}
													defaultValue={value}
													value={value}
													min={0}
													max={1000}
												/>
												{showError && (
													<div className="error">
														This is a required field
													</div>
												)}
											</div>
										}
									/>
								);
							}}
						/>
						<FieldControl
							name="minChars"
							render={({ handler, value, touched, errors }) => {
								const showError = (submitted || touched) && errors?.required;

								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												<span>Min Chars</span>
												<Popover
													content={content(Messages.minChars)}
													css={styles.iconContainer}
												>
													<InfoCircleOutlined />
												</Popover>
											</p>
										}
										component={
											<div>
												<InputNumber
													{...handler()}
													className={showError ? 'input-error' : ''}
													style={{ width: '100%' }}
													defaultValue={value}
													value={value}
													min={0}
													max={1000}
												/>
												{showError && (
													<div className="error">
														This is a required field
													</div>
												)}
											</div>
										}
									/>
								);
							}}
						/>
						<FieldControl
							name="size"
							render={({ handler, value, touched, errors }) => {
								const showError = (submitted || touched) && errors?.required;

								return (
									<Grid
										label={
											<p css={styles.labelContainer}>
												<span>Size</span>
											</p>
										}
										component={
											<div>
												<InputNumber
													{...handler()}
													className={showError ? 'input-error' : ''}
													style={{ width: '100%' }}
													defaultValue={value}
													value={value}
													min={0}
													max={1000}
												/>
												{showError && (
													<div className="error">
														This is a required field
													</div>
												)}
											</div>
										}
									/>
								);
							}}
						/>
					</div>
				);
			}}
		/>
	);
}

export default PreferenceForm;
