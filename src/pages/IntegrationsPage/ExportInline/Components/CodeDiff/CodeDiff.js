import React, { useEffect, useState } from 'react';
import { diff } from 'jsondiffpatch';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import ReactDiffViewer from 'react-diff-viewer';
import { Collapse, Empty, Spin, Tooltip } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Flex from '../../../../../batteries/components/shared/Flex';
import DiffStatBlock from './DiffStateBlock';
import { getChangedDetails } from '../../../utils/sandpack-generator';

const CodeDiff = ({ oldCode, newCode, currentVersion: versionStatus, versionState, match }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [totalChanges, setTotalChanges] = useState({ added: 0, removed: 0 });
	const diffData = diff(oldCode, newCode);

	useEffect(() => {
		loaderAsyncCall()
			.then(() => {
				setIsLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setIsLoading(false);
			});

		getTotalDiffData();
	}, []);

	const loaderAsyncCall = () => {
		return new Promise((resolve) => setTimeout(() => resolve(), 2500));
	};

	const getTotalDiffData = () => {
		let adds = 0;
		let removes = 0;
		Object.keys(diffData || {}).forEach((path) => {
			const changedDetails = getChangedDetails(
				Diff.diffLines(oldCode[path] || '', newCode[path] || ''),
			);
			adds += changedDetails.added;
			removes += changedDetails.removed;
		});
		setTotalChanges({
			added: adds,
			removed: removes,
		});
	};

	if (isLoading)
		return (
			<Flex justifyContent="center">
				<Spin />
			</Flex>
		);
	const diffDataKeys = [...Object.keys(diffData || {})];
	const preferenceId = match.params.id;
	const { currentVersion = {} } = versionState[preferenceId] ?? {};
	const diffDataLength = diffDataKeys.length;
	console.log({ currentVersion, versionStatus });
	if (diffDataLength)
		return (
			<div>
				<Flex justifyContent="flex-end">
					{diffDataLength && (
						<Flex style={{ marginBottom: 15, gap: 20 }}>
							<div>
								{diffDataLength} {diffDataLength === 1 ? 'file' : 'files'} changed
							</div>
							<div>
								{(totalChanges.added || totalChanges.removed) && (
									<DiffStatBlock changedDetails={totalChanges} />
								)}
							</div>
						</Flex>
					)}
				</Flex>
				<Flex justifyContent="space-between">
					<Tooltip
						title={
							currentVersion && currentVersion.version_id
								? currentVersion.version_id
								: 'Current Changes'
						}
					>
						<span>
							{currentVersion && currentVersion.commit
								? currentVersion.commit
								: 'Current Changes'}
						</span>
					</Tooltip>
					<Tooltip
						title={
							versionStatus && versionStatus.version_id
								? versionStatus.version_id
								: 'New Changes'
						}
					>
						<span>
							{versionStatus &&
							versionStatus.metadata &&
							versionStatus.metadata.commit
								? versionStatus.metadata.commit
								: 'New Changes'}
						</span>
					</Tooltip>
				</Flex>
				<Collapse defaultActiveKey={diffDataLength < 5 ? diffDataKeys : []}>
					{(Object.keys(diffData || {}) || []).map((path) => {
						const changedDetails = getChangedDetails(
							Diff.diffLines(oldCode[path] || '', newCode[path] || ''),
						);

						return (
							<Collapse.Panel
								header={
									<Flex justifyContent="space-between" style={{ fontWeight: 30 }}>
										<div>{path}</div>
										{(changedDetails.added || changedDetails.removed) && (
											<DiffStatBlock changedDetails={changedDetails} />
										)}
									</Flex>
								}
								key={path}
							>
								<ReactDiffViewer
									oldValue={oldCode[path] || ''}
									newValue={newCode[path] || ''}
									splitView
									compareMethod="diffLines"
								/>
							</Collapse.Panel>
						);
					})}
				</Collapse>
			</div>
		);

	return <Empty description="No diff available" />;
};

CodeDiff.propTypes = {
	oldCode: PropTypes.object,
	newCode: PropTypes.object,
	currentVersion: PropTypes.string,
	versionState: PropTypes.object,
	match: PropTypes.object.isRequired,
};

CodeDiff.defaultProps = {
	oldCode: {},
	newCode: {},
	currentVersion: '',
	versionState: {},
};

const mapStateToProps = (state) => ({
	versionState: get(state, '$getSearchPreferencesVersionsN.results', {}),
});

export default connect(mapStateToProps, null)(withRouter(CodeDiff));
