import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';
import { PlusOutlined } from '@ant-design/icons';
import { Card, Modal, Upload } from 'antd';
import JsonView from '../../../components/JsonView';

const uploadClass = css`
	.avatar-uploader > .ant-upload {
		width: 100%;
		height: 75px;
	}
`;
const antCardBody = css`
	.ant-card-body {
		background-color: #e6f7ff;
	}
`;
const tabListNoTitle = [
	{
		key: 'json',
		tab: 'JSON example',
	},
	{
		key: 'csv',
		tab: 'CSV example',
	},
];
const contentListNoTitle = {
	json: (
		<JsonView
			json={[
				{
					type: 'equivalent',
					synonym: 'pants, trousers',
				},
				{
					type: 'equivalent',
					synonym: 'Eins, Uno, One',
				},
				{
					type: 'one-way',
					synonym: 'ipod => i-pod, apple',
				},
			]}
		/>
	),
	csv: (
		<>
			<div>pants, trousers</div>
			<div>Eins, Uno, One</div>
			<div>ipod =&gt; i-pod, apple</div>
		</>
	),
};

class UploadSynonymsModal extends React.Component {
	state = { tabKey: 'json' };

	onTabChange = (key) => {
		this.setState({ tabKey: key });
	};

	render() {
		const { onRemove, beforeUpload, appName, fileList, file, onOk, onCancel, confirmLoading } =
			this.props;
		const { tabKey } = this.state;
		return (
			<Modal
				onCancel={onCancel}
				title={`Upload synonyms to index "${appName}"`}
				visible
				className={uploadClass}
				onOk={onOk}
				confirmLoading={confirmLoading}
				okText="Upload Synonyms"
				centered
			>
				<Card
					style={{
						backgroundColor: '#e6f7ff',
						marginBottom: 13,
					}}
				>
					Supported formats <b>(max. 10 MB)</b> :
					<br />
					<b>JSON</b>: containing either a single object or an array of objects
					<br />
					<b>CSV (synonyms only)</b>: comma separated
				</Card>
				<Upload
					accept=".json,.csv"
					listType={file ? 'text' : 'picture-card'}
					className="avatar-uploader"
					fileList={fileList}
					beforeUpload={beforeUpload}
					onRemove={onRemove}
				>
					{file ? null : (
						<div>
							<PlusOutlined />
							<div className="ant-upload-text">Choose File</div>
						</div>
					)}
				</Upload>
				<Card
					tabList={tabListNoTitle}
					activeTabKey={tabKey}
					style={file ? { marginTop: 19 } : null}
					className={antCardBody}
					onTabChange={this.onTabChange}
				>
					{contentListNoTitle[tabKey]}
				</Card>
			</Modal>
		);
	}
}

UploadSynonymsModal.propTypes = {
	onRemove: PropTypes.func.isRequired,
	beforeUpload: PropTypes.func.isRequired,
	appName: PropTypes.string.isRequired,
	fileList: PropTypes.array,
	file: PropTypes.any,
	onOk: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	confirmLoading: PropTypes.bool,
};

UploadSynonymsModal.defaultProps = {
	fileList: [],
	file: null,
	confirmLoading: false,
};

export default UploadSynonymsModal;
