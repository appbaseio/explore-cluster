import React from 'react';
import {
	SandpackThemeProvider,
	SandpackPreview,
	useLoadingOverlayState,
} from '@codesandbox/sandpack-react';
import ReactivesearchLoader from '../../components/ReactivesearchLoader/ReactivesearchLoader';

const SandpackPreviewContainer = () => {
	const iframeHeight = window.innerHeight - 60;
	const loading = useLoadingOverlayState();

	return (
		<SandpackThemeProvider>
			<SandpackPreview
				viewportSize={{ height: `${iframeHeight}px` }}
				showRefreshButton={false}
				showOpenInCodeSandbox={false}
			/>
			{loading === 'LOADING' ? <ReactivesearchLoader /> : null}
		</SandpackThemeProvider>
	);
};

export default SandpackPreviewContainer;
