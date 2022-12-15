import React, { useContext } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, InputNumber } from 'antd';
import { css } from 'react-emotion';
import { FieldGroup, FieldControl } from 'react-reactive-form';
import Grid from '../../../../components/CreateCredentials/Grid';
import { suggestionsMessages as Messages } from '../../../../utils/messages';
import styles from '../styles';
import { FormContext } from '../../../IntegrationsPage/utils';
import IndexMultiSelect from '../PopularSuggestions/IndexMultiSelect';

export const PreferenceFormContext = React.createContext();

const modal = css`
	max-width: 800px;
	margin: 20px auto;
	background-color: #fff;
	padding: 50px 70px;
	width: 100%;
	.error {
		color: tomato;
		padding: 5px 0;
	}

	.select-error {
		border: 1px solid tomato;
		border-radius: 2px;
	}
	.input-error {
		border-color: tomato;
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
	const control = mainForm.get('recent');

	return (
		<FieldGroup
			control={control}
			strict={false}
			render={(
				{ invalid: invalidForm, submitted }, // eslint-disable-line
			) => (
				<div css={modal} data-cy="recent-suggestions-fields-container">
					<FieldControl
						name="minHits"
						render={({ handler, value, touched, errors }) => {
							const showError =
								(submitted || touched) && (errors?.required || errors?.invalidLink);

							return (
								<Grid
									label={
										<p css={styles.labelContainer}>
											<span>Min hits</span>
											<Popover
												content={content(Messages.minHits)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<div style={{ margin: 'auto 0px' }}>
											<InputNumber
												{...handler()}
												className={showError ? 'input-error' : ''}
												style={{ width: '100%', margin: 'auto' }}
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
							const showError = touched && (errors?.required || errors?.invalidLink);

							return (
								<Grid
									label={
										<p css={styles.labelContainer}>
											<span>Size</span>
										</p>
									}
									component={
										<div style={{ margin: 'auto 0px' }}>
											<InputNumber
												{...handler()}
												className={showError ? 'input-error' : ''}
												style={{ width: '100%', margin: 'auto' }}
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
							const showError = touched && (errors?.required || errors?.invalidLink);

							return (
								<Grid
									label={
										<p css={styles.labelContainer}>
											<span>Min chars</span>
											<Popover
												content={content(Messages.minChars)}
												css={styles.iconContainer}
											>
												<InfoCircleOutlined />
											</Popover>
										</p>
									}
									component={
										<div style={{ margin: 'auto 0px' }}>
											<InputNumber
												{...handler()}
												className={showError ? 'input-error' : ''}
												style={{ width: '100%', margin: 'auto' }}
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
						name="indices"
						render={({ handler, errors }) => {
							return (
								<Grid
									label={
										<p
											css={styles.labelContainer}
											data-cy="recent-suggestions-indices-label"
										>
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
										<div style={{ margin: 'auto 0px' }}>
											<IndexMultiSelect
												className={errors?.required ? 'select-error' : ''}
												{...handler()}
											/>
											{errors?.required && (
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
			)}
		/>
	);
}

export default PreferenceForm;
