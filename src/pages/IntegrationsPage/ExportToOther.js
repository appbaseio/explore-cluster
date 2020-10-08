import React from 'react';
import { func, object } from 'prop-types';
import { Button, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getInstallationScript } from './utils';

const copyToClipboard = () => {
	message.success('Copied to clipboard', 5);
};

const ExportToOther = ({ control, preferences }) => {
	// Override user credentials to API credentials selected by user
	const credentials = control.get('credentials') ? control.get('credentials').value : undefined;
	const installationScript = getInstallationScript(preferences(), credentials);
	return (
		<React.Fragment>
			<h2>Installation</h2>
			In order to add the appbase.io e-commerce plugin to your store you can embed the
			following snippet in `index.html` file:
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationScript} onCopy={copyToClipboard}>
					<Button
						icon="copy"
						shape="circle"
						css={{
							position: 'absolute',
							right: 10,
							top: 10,
						}}
					/>
				</CopyToClipboard>

				<pre
					css={{
						background: '#eee',
						padding: '0 20px',
						margin: '20px 0',
					}}
				>
					{installationScript}
				</pre>
			</div>
		</React.Fragment>
	);
};

ExportToOther.propTypes = {
	preferences: func.isRequired,
	control: object.isRequired,
};

export default ExportToOther;
