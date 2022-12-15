import { LoadingOutlined } from '@ant-design/icons';
import { Affix, Button } from 'antd';
import get from 'lodash/get';
import { bool, func, object, string } from 'prop-types';
import React, { useContext } from 'react';
import { FieldGroup } from 'react-reactive-form';
import { connect } from 'react-redux';
import PreviewModal from '../../shared/PreviewModal';
import SavePreferences from '../../shared/SavePreferences';
import { FormContext } from '../../utils/utils';

const Footer = ({
	isEditorLoading,
	setIsEditorLoading,
	pipeline,
	getPreferences,
	preferenceId,
	getPreferencesPayload,
	closeForm,
	history,
	isSaveSearchLoading,
	isCodeCommitting,
}) => {
	const form = useContext(FormContext);
	return (
		<Affix offsetBottom={0} className="footer-container">
			<div className="flex space-between card-footer">
				<div className="flex" style={{ gap: 10 }}>
					<PreviewModal
						pipeline={pipeline}
						preferences={getPreferences}
						preferenceId={preferenceId}
						form={form}
						getPreferencesPayload={getPreferencesPayload}
						isEditorLoading={isEditorLoading}
						setIsEditorLoading={setIsEditorLoading}
					/>
					<FieldGroup
						control={form}
						strict={false}
						render={() => (
							<Button
								onClick={() => {
									history.push(`/cluster/search-builder/${preferenceId}/code`);
								}}
								disabled={
									isEditorLoading || isSaveSearchLoading || isCodeCommitting
								}
								size="large"
							>
								<div className="button-label">
									{isEditorLoading || isSaveSearchLoading || isCodeCommitting ? (
										<LoadingOutlined style={{ marginRight: 5 }} />
									) : (
										<img
											alt="code-icon"
											width={15}
											src="/static/images/code-icon.svg"
										/>
									)}
									Code Editor
								</div>
							</Button>
						)}
					/>
				</div>
				<div>
					<SavePreferences
						form={form}
						closeForm={closeForm}
						preferenceId={preferenceId}
						getPreferences={getPreferences}
						getPreferencesPayload={getPreferencesPayload}
					/>
				</div>
			</div>
		</Affix>
	);
};

Footer.propTypes = {
	isEditorLoading: bool,
	setIsEditorLoading: func,
	pipeline: string,
	getPreferences: func.isRequired,
	preferenceId: string,
	getPreferencesPayload: func.isRequired,
	closeForm: func,
	history: object.isRequired,
	isSaveSearchLoading: bool,
	isCodeCommitting: bool,
};

Footer.defaultProps = {
	isEditorLoading: false,
	setIsEditorLoading: () => {},
	pipeline: '',
	preferenceId: '',
	closeForm: () => {},
	isSaveSearchLoading: false,
	isCodeCommitting: false,
};

const mapStateToProps = (state) => ({
	isSaveSearchLoading: get(state, '$saveSearchPreference.isFetching'),
});

export default connect(mapStateToProps, null)(Footer);
