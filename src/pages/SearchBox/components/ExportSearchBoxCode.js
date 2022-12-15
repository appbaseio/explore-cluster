import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { CopyOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { css } from 'emotion';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { getURL } from '../../../constants/config';
import CredentialsSelector from './CredentialsSelector';

const modalStyles = css`
	width: 80vw !important;
`;
const ExportSearchBoxCode = ({ visible, onCancel, searchBoxId, initialCredentials = '' }) => {
	const [credentialValue, setCredentialValue] = useState(initialCredentials);

	function getExportCode() {
		return `<head>\n  <script defer src="https://searchbox-export-demo.netlify.app/static/js/main.js"></script> \n  <link rel="stylesheet" href="https://searchbox-export-demo.netlify.app/static/css/main.css" > \n</head>\n<div id="searchbox-root" searchbox-id="${searchBoxId}" cluster-url="${getURL()}" credentials="${
			credentialValue ?? 'Select a credential from the dropdown'
		}" />`;
	}
	const copyToClipboard = () => {
		if (!credentialValue) {
			message.error('Choose an API credential value!');
			return;
		}
		message.success('Copied to clipboard', 5);
	};
	return (
		<Modal
			title="Export Code"
			open={visible}
			onCancel={onCancel}
			className={modalStyles}
			footer={null}
		>
			<h4>Choose Credentials</h4>
			<CredentialsSelector
				value={credentialValue}
				onChange={(valueParam) => {
					setCredentialValue(valueParam);
				}}
			/>
			<div
				css={{
					position: 'relative',
					marginBottom: 25,
				}}
			>
				<CopyToClipboard text={getExportCode()} onCopy={copyToClipboard}>
					<Button
						icon={<CopyOutlined />}
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
						padding: '20px',
						margin: '20px 0',
						overflow: 'auto',
					}}
				>
					{getExportCode()}
				</pre>
			</div>
		</Modal>
	);
};
ExportSearchBoxCode.defaultProps = {
	initialCredentials: '',
};
ExportSearchBoxCode.propTypes = {
	visible: PropTypes.bool.isRequired,
	onCancel: PropTypes.func.isRequired,
	searchBoxId: PropTypes.oneOfType([PropTypes.string, PropTypes.any]).isRequired,
	initialCredentials: PropTypes.string,
};
const mapStateToProps = (state, props) => {
	const searchBoxData = get(state, '$getSearchBoxes.results', []).find(
		(item) => item.id === props.searchBoxId,
	);
	return {
		initialCredentials: searchBoxData?.searchbox?.featured?.design?.credentials ?? '',
	};
};

export default connect(mapStateToProps, null)(ExportSearchBoxCode);
