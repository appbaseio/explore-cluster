import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Icon, Divider } from 'antd';
import { pastVersionsStyles } from './styles';
import { timeDifference } from '../../utils/index';
import CodeDiffModal from './CodeDiff/CodeDiffModal';
import { getByVersionId } from '../../utils/sandpack-generator';
// eslint-disable-next-line
import { transformContent } from './ModalHeader';

const List = ({
	data,
	setIsLoading,
	preferenceId,
	updatedCode,
	updateVersionStateForPreference,
}) => {
	const [open, setOpen] = useState(false);
	const [reponseByVersion, setReponseByVersion] = useState({});

	useEffect(() => {
		fetchByVersionId(data.version_id);
	}, []);

	const handleCancel = () => {
		setOpen(false);
	};

	const fetchByVersionId = (versionId) => {
		getByVersionId(preferenceId, versionId)
			.then((response) => {
				setReponseByVersion(response);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const restoreByVersionId = () => {
		const newContent = transformContent(reponseByVersion.content);
		updateVersionStateForPreference({
			preferenceId,
			patchPayload: {
				currentVersion: {
					version_id: reponseByVersion.version_id,
					updated_at: reponseByVersion.updated_at || reponseByVersion.created_at,
					commit: reponseByVersion.metadata.commit || '',
				},
				updatedCode: newContent,
				sandpackCode: newContent,
				initialCode: newContent,
			},
		});
	};

	const validFilePaths = (response) => {
		const newObj = {};
		Object.keys(response).forEach((path) => {
			if (path[0] === '/') {
				const newPath = path.slice(1);
				newObj[newPath] = response[path];
			} else {
				newObj[path] = response[path];
			}
		});
		return newObj;
	};

	const time = timeDifference(new Date(), new Date(data.updated_at || data.created_at * 1000));

	return (
		<div className={pastVersionsStyles}>
			<div className="row-data">
				<div className="sub-title-container">
					<Tooltip title={data.metadata.commit}>
						<p className="overflow commit-font" style={{ margin: 0, maxWidth: '60%' }}>
							{data.metadata.commit}
						</p>
					</Tooltip>
					<img
						src="/static/images/commit.png"
						alt="commit-icon"
						width={20}
						style={{ margin: '0px 5px 0px 5px' }}
					/>
					<Tooltip title={data.version_id}>
						<p className="overflow versionid-font" style={{ margin: 0 }}>
							{data.version_id}
						</p>
					</Tooltip>
				</div>
				<div>{data.metadata.user || ''}</div>
				{/* {deploymentStatus && deploymentStatus.status ? (
					<Button type="link" onClick={() => showDeployLogsModal()}>
						Build Status
					</Button>
				) : null} */}
			</div>
			<div className="row-data">
				<div>
					{time ? (
						<Tooltip
							title={
								<>
									<Icon
										type="calendar"
										theme="twoTone"
										style={{ marginRight: 5 }}
									/>
									<span style={{ fontSize: 12 }}>
										{new Date(
											data.updated_at || data.created_at * 1000,
										).toLocaleString()}
									</span>
								</>
							}
						>
							{time}
						</Tooltip>
					) : null}
				</div>
				<div>
					<Button
						type="link"
						onClick={() => {
							setOpen(true);
						}}
						icon="swap"
						className="show-on-hover"
					>
						View diff
					</Button>
					<Button
						type="link"
						onClick={() => {
							setIsLoading(true);
							restoreByVersionId();
						}}
						className="show-on-hover"
						icon="undo"
					>
						Restore
					</Button>
				</div>
			</div>
			<Divider />
			<CodeDiffModal
				open={open}
				handleCancel={handleCancel}
				oldCode={validFilePaths(updatedCode)}
				newCode={reponseByVersion.content}
				currentVersion={data}
				time={time}
			/>
		</div>
	);
};

List.propTypes = {
	setIsLoading: PropTypes.func,
	data: PropTypes.object,
	preferenceId: PropTypes.string,
	updatedCode: PropTypes.object,
	updateVersionStateForPreference: PropTypes.func.isRequired,
};

List.defaultProps = {
	data: {},
	setIsLoading: () => {},
	preferenceId: '',
	updatedCode: {},
};

export default List;
