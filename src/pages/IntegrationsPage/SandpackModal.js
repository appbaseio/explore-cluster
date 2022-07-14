import React, { useEffect, useState } from 'react';
import { object, string } from 'prop-types';
import get from 'lodash/get';
import {
	SandpackProvider,
	SandpackPreview,
	SandpackThemeProvider,
} from '@codesandbox/sandpack-react';
import { transformContent } from './ExportInline/Components/ModalHeader';
import Loader from '../../components/Loader';
import {
	generateInlineSandboxURL,
	getLatestVersion,
	preferencesInConstants,
} from './utils/sandpack-generator';
import { getTemplate } from './utils/index';

const SandpackModal = ({ preferences, preferenceId }) => {
	const [sandpackCode, setSandpackCode] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const iframeHeight = window.innerHeight - 60;

	useEffect(() => {
		fetchLatestVersion();
	}, [preferences]);

	const fetchLatestVersion = () => {
		getLatestVersion(preferenceId)
			.then(async (res) => {
				if (res.content) {
					const content = transformContent(res.content);
					const newContent = preferencesInConstants(content, preferences);
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
	const route = templateObj.pages[currentPage];

	return isLoading ? (
		<Loader />
	) : (
		<SandpackProvider
			template="react"
			customSetup={{ files: { ...sandpackCode } }}
			startRoute={route}
		>
			<SandpackThemeProvider>
				<SandpackPreview
					viewportSize={{ height: `${iframeHeight}px` }}
					showRefreshButton
					showOpenInCodeSandbox
				/>
			</SandpackThemeProvider>
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
