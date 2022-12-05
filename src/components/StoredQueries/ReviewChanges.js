import React from 'react';
import PropTypes from 'prop-types';
import { Card, Empty, Table, Tag, Modal, Alert } from 'antd';
import { diff } from 'jsondiffpatch';
import get from 'lodash/get';
import { connect } from 'react-redux';
import Flex from '../../batteries/components/shared/Flex';
import MonacoDiffEditor from '../../batteries/components/SearchSandbox/containers/MonacoDiffEditor';

const getDiffData = (oldObj, newObj) => {
	const diffData = diff({ ...oldObj }, { ...newObj });
	return diffData || {};
};
class ReviewChanges extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			diffData: {
				id: {
					title: 'Stored Query Id',
				},
				description: {
					title: 'Query Description',
				},
			},
			disableSave: false,
		};
	}

	componentDidMount() {
		const { diffData } = this.state;
		const { defaultData, updatedData } = this.props;
		const jsonDiffData = getDiffData(defaultData, updatedData);
		const constructDiffData = { ...diffData };
		Object.keys(jsonDiffData).forEach((key) => {
			if (key !== 'query') {
				Object.assign(constructDiffData, {
					[key]: {
						...constructDiffData[key],
						oldVal: jsonDiffData[key][0],
						newVal: jsonDiffData[key][1],
					},
				});
			}
		});
		this.setState({
			diffData: {
				...constructDiffData,
			},
			disableSave:
				Object.keys(jsonDiffData).length === 0 && defaultData.query === updatedData.query,
		});
	}

	renderDiffTables = () => {
		const { diffData } = this.state;
		const { defaultData = {}, updatedData = {}, storedQueriesUsage } = this.props;
		const editMode = !!defaultData.id;
		const query = {
			title: 'Query',
			oldVal: defaultData.query,
			newVal: updatedData.query,
		};
		const queryDiff =
			query.oldVal === query.newVal ? null : (
				<Flex justifyContent="space-between" style={{ width: '100%', margin: '1rem auto' }}>
					<div style={{ width: '16%', margin: '0 1rem' }}>
						<h3>{query.title}</h3>
					</div>
					<div style={{ flex: 1 }}>
						<MonacoDiffEditor
							language="json"
							theme="vs-dark"
							options={{
								cursorStyle: 'line',
								lineNumbersMinChars: 2,
								fontFamily: 'Monaco, monospace',
								fontSize: 14,
								padding: {
									top: 10,
									bottom: 10,
								},
								minimap: {
									enabled: false,
								},
								scrollBeyondLastLine: false,
								readOnly: true,
							}}
							height="300px"
							originalCode={query.oldVal}
							modifiedCode={query.newVal}
						/>
					</div>
				</Flex>
			);
		const jsxArray = [
			...Object.keys(diffData).map((key) => {
				const { title, oldVal, newVal } = diffData[key];
				if (!oldVal && !newVal) {
					return null;
				}
				return (
					<Flex
						key={key}
						justifyContent="space-between"
						style={{ width: '100%', margin: '1rem auto' }}
					>
						<div style={{ width: '16%', margin: '0 1rem' }}>
							<h3>{title}</h3>
						</div>
						<div style={{ flex: 1 }}>
							<Table
								bordered
								key={title}
								pagination={false}
								size="small"
								rowKey="key"
								dataSource={[
									{
										key: Date.now() + key,
										oldVal: oldVal ?? '',
										newVal: newVal ?? '',
									},
								]}
								style={{
									height: 'max-content',
									marginBottom: '7px',
									overflow: 'auto',
								}}
								columns={[
									{
										title: 'Old Value',
										key: 'oldVal',
										dataIndex: 'oldVal',
										render: (ov) => (
											<Tag
												color={!editMode ? 'gray' : 'volcano'}
												style={{
													...(!editMode && {
														textDecoration: 'line-through',
													}),
												}}
												data-cy={`old-value-${title.replace(
													/ /g,
													'',
												)}-status`}
											>
												{ov.toString()}
											</Tag>
										),
										width: '50%',
									},
									{
										title: 'New Value',
										key: 'newVal',
										dataIndex: 'newVal',
										render: (nv) => (
											<Tag
												color="green"
												data-cy={`new-value-${title.replace(
													/ /g,
													'',
												)}-status`}
											>
												{nv.toString()}
											</Tag>
										),
									},
								]}
							/>
						</div>
					</Flex>
				);
			}),
			queryDiff,
		].filter((item) => !!item);
		return (
			<>
				<Card>
					<div style={{ maxHeight: '56vh', overflow: 'auto' }}>
						{jsxArray.length ? (
							jsxArray
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>No change in stored query configuration</span>}
							/>
						)}
					</div>
				</Card>
				{!!editMode && jsxArray.length ? (
					<Alert
						style={{ margin: '1rem 0 ' }}
						type="info"
						showIcon
						message={
							storedQueriesUsage[defaultData.id]?.count > 0
								? `Used ${
										storedQueriesUsage[defaultData.id]?.count
								  } times in last 30 days`
								: 'Not used in the last 30 days'
						}
					/>
				) : null}
			</>
		);
	};

	handleSave = () => {};

	render() {
		const { handleCancel, isSaving, handleSaveStoredQuery } = this.props;
		const { disableSave } = this.state;
		return (
			<Modal
				visible
				title="Review Changes Before Saving"
				onOk={handleSaveStoredQuery}
				width={1000}
				height="90vh"
				style={{
					top: 20,
				}}
				destroyOnClose
				okText="Review and Save"
				confirmLoading={isSaving}
				onCancel={handleCancel}
				cancelButtonProps={{ 'data-cy': 'cancel-modal-button' }}
				okButtonProps={{
					'data-cy': 'review-save-button',
					disabled: disableSave,
				}}
			>
				<>
					{!disableSave && (
						<Alert
							type="warning"
							showIcon
							message="Saving the stored query can cause a side-effect to any web or mobile applications that make use of this query."
							style={{
								marginBottom: 10,
							}}
						/>
					)}
					{this.renderDiffTables()}
				</>
			</Modal>
		);
	}
}

ReviewChanges.propTypes = {
	defaultData: PropTypes.object.isRequired,
	updatedData: PropTypes.object.isRequired,
	handleCancel: PropTypes.func.isRequired,
	handleSaveStoredQuery: PropTypes.func.isRequired,
	isSaving: PropTypes.bool.isRequired,
	storedQueriesUsage: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	isSaving: get(state, '$saveAppStoredQuery.isFetching', false),
	storedQueriesUsage: get(state, '$getAppStoredQueriesUsage.results', {}),
});

export default connect(mapStateToProps)(ReviewChanges);
