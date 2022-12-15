import React, { useEffect } from 'react';
import { bool, func, object, string } from 'prop-types';
import get from 'lodash/get';
import { SandpackProvider } from '@codesandbox/sandpack-react';
import { atomDark } from '@codesandbox/sandpack-themes';
import { connect } from 'react-redux';
import SandpackPreviewContainer from './SandpackPreviewContainer';
import ReactivesearchLoader from '../../../../../components/ReactivesearchLoader/ReactivesearchLoader';
import {
	generateInlineSandboxURL,
	preferencesInConstants,
} from '../../../utils/sandpack-generator';
import {
	getTemplate,
	removeEmpty,
	transformPreferences,
	transformResultsDefaultFields,
} from '../../../utils/index';
import { getSearchPreferenceLatestVersion } from '../../../../../batteries/modules/actions';
import AppConstants from '../../../../../batteries/modules/constants';
import { transformContent } from '../../ExportInline/Components/ModalHeader';

const SandpackModal = ({
	preferences,
	preferenceId,
	getLatestVersionCode,
	updateVersionStateForPreference,
	versionState,
	isLoading,
}) => {
	const { sandpackCode } = versionState[preferenceId] ?? {};
	useEffect(() => {
		if (!isLoading) fetchLatestVersion();
	}, []);

	const fetchLatestVersion = () => {
		getLatestVersionCode(preferenceId)
			.then(async (response) => {
				if (response.payload) {
					const { res } = response.payload;
					if (res.content) {
						const content = transformContent(res.content);
						const newPreferences = removeEmpty({
							...transformResultsDefaultFields(transformPreferences(preferences)),
						});
						const newContent = preferencesInConstants(content, newPreferences);

						updateVersionStateForPreference({
							preferenceId,
							patchPayload: {
								sandpackCode: newContent,
							},
						});
					}
					if (res.error) getSandPackCode();
				}
				if (response.error) getSandPackCode();
			})
			.catch((err) => {
				console.error('Error to fetch latest version', err);
				getSandPackCode();
			});
	};

	const getSandPackCode = async () => {
		const newPreferences = {
			...transformResultsDefaultFields(transformPreferences(preferences)),
		};
		const response = await generateInlineSandboxURL(newPreferences);
		updateVersionStateForPreference({
			preferenceId,
			patchPayload: {
				sandpackCode: response,
			},
		});
	};

	const pageSettings = get(preferences, 'pageSettings', {});
	const themeType = get(preferences, 'themeSettings.type', '');
	const templateObj = getTemplate(themeType);
	const { currentPage } = pageSettings;
	const route = templateObj.pages ? templateObj.pages[currentPage] || '/' : '/';

	return isLoading || !sandpackCode ? (
		<ReactivesearchLoader />
	) : (
		<SandpackProvider
			template={templateObj.template || 'react'}
			files={{ ...sandpackCode }}
			customSetup={{
				entry: 'src/index.js',
			}}
			startRoute={route}
			options={{
				startRoute: route,
			}}
			theme={atomDark}
		>
			<SandpackPreviewContainer />
		</SandpackProvider>
	);
};

SandpackModal.propTypes = {
	preferences: object.isRequired,
	preferenceId: string,
	updateVersionStateForPreference: func.isRequired,
	getLatestVersionCode: func.isRequired,
	versionState: object.isRequired,
	isLoading: bool.isRequired,
};

SandpackModal.defaultProps = {
	preferenceId: '',
};

const mapStateToProps = (state) => {
	return {
		versionState: get(state, '$getSearchPreferencesVersions.results', {}),
		isLoading: get(state, '$getSearchPreferencesVersions.isLoading', false),
	};
};
const mapDispatchToProps = (dispatch) => ({
	getLatestVersionCode: (preferenceId) =>
		dispatch(getSearchPreferenceLatestVersion(preferenceId)),
	updateVersionStateForPreference: (payload) =>
		dispatch({
			type: AppConstants.APP.UI_BUILDER.SEARCH_PREFERENCE_VERSIONS
				.UPDATE_PREFERENCE_STATE_SUCCESS,
			payload,
		}),
});

export default connect(mapStateToProps, mapDispatchToProps)(SandpackModal);
