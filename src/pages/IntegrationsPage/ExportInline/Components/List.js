import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Button, Icon, Divider } from 'antd';
import { pastVersionsStyles } from './styles';
import { timeDifference } from '../../utils/index';

const List = ({ data, setIsLoading, fetchByVersionId }) => {
	const time = timeDifference(new Date(), new Date(data.updated_at || data.created_at * 1000));

	return (
		<div css={pastVersionsStyles}>
			<div className="row-data">
				<div className="sub-title-container">
					<Tooltip title={data.metadata.commit}>
						<p className="overflow-container commit-font">{data.metadata.commit}</p>
					</Tooltip>
					<img
						src="/static/images/commit.png"
						alt="commit-icon"
						width={20}
						style={{ margin: '0px 5px 0px 5px' }}
					/>
					<Tooltip title={data.version_id}>
						<p className="overflow-container versionid-font">{data.version_id}</p>
					</Tooltip>
				</div>
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

				<Button
					type="link"
					onClick={() => {
						setIsLoading(true);
						fetchByVersionId(data.version_id);
					}}
				>
					Restore
				</Button>
			</div>
			<Divider />
		</div>
	);
};

List.propTypes = {
	setIsLoading: PropTypes.func,
	data: PropTypes.object,
	fetchByVersionId: PropTypes.func.isRequired,
};

List.defaultProps = {
	data: {},
	setIsLoading: () => {},
};

export default List;
