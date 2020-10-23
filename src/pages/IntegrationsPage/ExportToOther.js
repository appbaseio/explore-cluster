import React from 'react';
import { func, object } from 'prop-types';
import { Button, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getInstallationHeadScript, getInstallationBodyScript } from './utils';

const copyToClipboard = () => {
	message.success('Copied to clipboard', 5);
};

const ExportToOther = ({ control, preferences }) => {
	// Override user credentials to API credentials selected by user
	const credentials = control.get('credentials') ? control.get('credentials').value : undefined;
	const installationHeadScript = getInstallationHeadScript(preferences(), credentials);
	const installationBodyScript = getInstallationBodyScript(preferences());
	return (
		<React.Fragment>
			<h2>Installation</h2>
			<div>
				Add this snippet within the <strong>head</strong> tag of your{' '}
				<strong>index.html</strong>
			</div>
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationHeadScript} onCopy={copyToClipboard}>
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
					{installationHeadScript}
				</pre>
			</div>
			<div>
				Add this snippet within the <strong>body </strong>tag of your{' '}
				<strong>index.html</strong>
			</div>
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={installationBodyScript} onCopy={copyToClipboard}>
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
					{installationBodyScript}
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
