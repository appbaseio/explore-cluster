import React from 'react';
import { FieldGroup } from 'react-reactive-form';
import { object } from 'prop-types';
import ExportInline from './ExportInline';
import PreferencesFormWrapper from './PreferencesFormWrapperN';

const CodeSandboxModal = ({ ...props }) => {
	const preferenceId = props.match.params.id;

	const closeForm = () => {
		props.history.push('/cluster/search-builder');
	};

	return (
		<PreferencesFormWrapper closeForm={closeForm} preferenceId={preferenceId}>
			{({ getPreferences, getPreferencesPayload, form }) => {
				return (
					<FieldGroup
						control={form}
						render={() => (
							<ExportInline
								preferences={getPreferences}
								buttonProps={{
									style: {
										marginLeft: 10,
									},
								}}
								control={form}
								closeForm={closeForm}
								preferenceId={preferenceId}
								getPreferencesPayload={getPreferencesPayload}
							/>
						)}
					/>
				);
			}}
		</PreferencesFormWrapper>
	);
};

CodeSandboxModal.propTypes = {
	history: object.isRequired,
	match: object.isRequired,
};

export default CodeSandboxModal;
