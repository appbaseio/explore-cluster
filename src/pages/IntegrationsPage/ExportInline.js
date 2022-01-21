import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Input, Icon, Popover } from 'antd';
import { FieldControl } from 'react-reactive-form';
import { connect } from 'react-redux';
import { func, object } from 'prop-types';
import { css } from 'react-emotion';
import Loader from '../../components/Loader';
import { generateInlineSandboxURL } from './utils/sandbox-generator';
import { saveSearchPreferenceN, getSearchPreferencesN } from '../../batteries/modules/actions';

const modalStyles = (csbUrl) => css`
	padding-bottom: 0 !important;
	position: absolute;
	right: 0;
	left: 0;
	z-index: 999;
	background: white;
	bottom: 0;
	top: 60px;

	.ant-modal {
		top: 0;
	}
	.ant-modal-content {
		border-radius: 0;
		min-height: 100%;
		.ant-modal-body {
			padding: 0;
		}
	}
	@media (max-width: 767px) {
		margin: 0 !important;
	}
	.footer-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.input-container {
		width: 170px;
	}
	.ant-input {
		border: 1px solid ${csbUrl.length !== 5 ? 'red' : '#d9d9d9'};
	}
`;

const ExportInline = ({
	preferences,
	control,
	history,
	match,
	getSearchPreferences,
	getPreferencesPayload,
	updateSearchPreferences,
}) => {
	const preferenceId = match.params.id;
	const [csbUrl, setCsbUrl] = useState(control?.get('csbID').value);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchCsbUrl = async () => {
			if (!control?.get('hasEdited').value) {
				const response = await generateInlineSandboxURL(preferences);
				setCsbUrl(response.sandbox_id);
				// eslint-disable-next-line
				control.get('csbID').setValue(response.sandbox_id);
				setIsLoading(false);
			} else {
				setCsbUrl(control?.get('csbID').value);
				setIsLoading(false);
			}
		};

		fetchCsbUrl();
	}, []);

	const handleSave = () => {
		control.get('csbID').setValue(csbUrl);
		// eslint-disable-next-line
		control?.get('hasEdited').setValue(true);
		updateSearchPreferences(getPreferencesPayload()).then((action) => {
			if (!(action && action.error)) {
				// fetch preferences
				getSearchPreferences();
			}
		});
	};

	const closeModal = () => {
		// closeModal
		history.push(`/cluster/search-builder/${preferenceId}`);
	};

	return (
		<div className={modalStyles(csbUrl)}>
			{isLoading ? (
				<Loader />
			) : (
				<>
					<iframe
						title="Edit-Inline-Sandbox"
						id="edit-inline-sandbox"
						src={`https://codesandbox.io/s/${
							control?.get('csbID').value
						}?module=%2Fpublic%2Findex.html`}
						width="100%"
						height={window.innerHeight - 140}
						scrolling="no"
						frameBorder={0}
						style={{
							border: 'none',
						}}
					/>
					<div style={{ padding: '16px 24px' }}>
						<div className="footer-container">
							<p style={{ fontWeight: 'bold', margin: 0 }}>
								Enter your updated CodeSandbox ID as shown in the browser to persist
								the changes
								<Popover content="A CSB ID should be of length 5. Make sure you’ve entered a correct ID.">
									<Icon type="info-circle" style={{ marginLeft: 5 }} />
								</Popover>
							</p>
							<FieldControl name="csbID" strict={false}>
								{/* eslint-disable-next-line */}
								{({ value, onChange }) => {
									return (
										<div>
											<Input
												className="input-container"
												suffix=".csb.app"
												size="large"
												value={csbUrl}
												onChange={(e) => {
													setCsbUrl(e.target.value);
												}}
											/>
										</div>
									);
								}}
							</FieldControl>
							<div>
								<Button
									size="large"
									type="primary"
									style={{ marginRight: 10 }}
									disabled={
										control?.get('csbID').value === csbUrl ||
										csbUrl.length !== 5
									}
									onClick={handleSave}
								>
									Save
								</Button>
								<Button
									onClick={() => {
										handleSave();
										closeModal();
									}}
									disabled={
										control?.get('csbID').value === csbUrl ||
										csbUrl.length !== 5
									}
									size="large"
									style={{ marginRight: 10 }}
								>
									Save and Exit
								</Button>
							</div>
						</div>
						<div style={{ height: 10 }}>
							{csbUrl.length !== 5 && (
								<div style={{ color: 'red', display: 'flex', marginLeft: '61%' }}>
									CSB ID should be of length 5.
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

ExportInline.propTypes = {
	preferences: func.isRequired,
	control: object.isRequired,
	updateSearchPreferences: func.isRequired,
	getPreferencesPayload: func.isRequired,
	getSearchPreferences: func.isRequired,
	history: object.isRequired,
	match: object.isRequired,
};

const mapDispatchToProps = (dispatch, props) => ({
	getSearchPreferences: () => dispatch(getSearchPreferencesN()),
	updateSearchPreferences: (payload) =>
		dispatch(saveSearchPreferenceN(props.preferenceId, payload)),
});

export default connect(null, mapDispatchToProps)(withRouter(ExportInline));
