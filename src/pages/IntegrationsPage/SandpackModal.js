import React, { useEffect, useState } from 'react';
import { object, string } from 'prop-types';
import get from 'lodash/get';
import { SandpackProvider } from '@codesandbox/sandpack-react';
import { transformContent } from './ExportInline/Components/ModalHeader';
import SandpackPreviewContainer from './SandpackPreviewContainer';
import ReactivesearchLoader from '../../components/ReactivesearchLoader/ReactivesearchLoader';
import {
	generateInlineSandboxURL,
	getLatestVersion,
	preferencesInConstants,
} from './utils/sandpack-generator';
import { getTemplate, removeEmpty, transformPreferences } from './utils/index';

const SandpackModal = ({ preferences, preferenceId }) => {
	const [sandpackCode, setSandpackCode] = useState({});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchLatestVersion();
	}, [preferences]);

	const fetchLatestVersion = () => {
		getLatestVersion(preferenceId)
			.then(async (res) => {
				if (res.content) {
					const content = transformContent(res.content);
					const newPreferences = removeEmpty({ ...transformPreferences(preferences) });
					const newContent = preferencesInConstants(content, newPreferences);
					setSandpackCode(newContent);
					setIsLoading(false);
				}
			})
			.catch((err) => {
				console.error('Error to fetch latest version', err);
				getSandPackCode();
			});
	};

	const getSandPackCode = async () => {
		const response = await generateInlineSandboxURL(preferences);
		setSandpackCode(response);
		setIsLoading(false);
	};

	const pageSettings = get(preferences, 'pageSettings', {});
	const themeType = get(preferences, 'themeSettings.type', '');
	const templateObj = getTemplate(themeType);
	const { currentPage } = pageSettings;
	const route = templateObj.pages ? templateObj.pages[currentPage] || '/' : '/';

	return isLoading ? (
		<ReactivesearchLoader />
	) : (
		<SandpackProvider
			template="react"
			customSetup={{ files: { ...sandpackCode } }}
			startRoute={route}
		>
			<SandpackPreviewContainer />
		</SandpackProvider>
	);
};

SandpackModal.propTypes = {
	preferences: object.isRequired,
	preferenceId: string,
};

SandpackModal.defaultProps = {
	preferenceId: '',
};

export default SandpackModal;
