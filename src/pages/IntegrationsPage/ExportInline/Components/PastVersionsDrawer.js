import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Divider, Button, Icon, Row, Tooltip } from 'antd';
import { pastVersionsStyles } from './styles';
import { timeDifference } from '../../utils/index';

const PastVersionsDrawer = ({
	visible,
	setVisible,
	currentVersion,
	allVersions,
	fetchByVersionId,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		setIsLoading(false);
	}, [currentVersion]);

	const ActiveVersion = () => {
		let time = NaN;
		if (currentVersion.updated_at) {
			time = timeDifference(new Date(), new Date(currentVersion.updated_at * 1000));
		} else {
			time = NaN;
		}

		return (
			<div css={pastVersionsStyles}>
				<Icon
					type={isLoading ? 'loading' : 'clock-circle'}
					className="active-version-icon"
				/>
				<div className="title-container">
					<Tooltip title={currentVersion.commit}>
						<p
							style={{ maxWidth: 180 }}
							className="overflow-container commit-header-font"
						>
							{currentVersion.commit}
						</p>
					</Tooltip>

					<img
						src="/static/images/commit.png"
						alt="commit-icon"
						width={20}
						style={{ margin: '0px 5px 0px 5px' }}
					/>
					<Tooltip title={currentVersion.version_id}>
						<p
							style={{ maxWidth: 180 }}
							className="overflow-container  versionid-header-font"
						>
							{currentVersion.version_id}
						</p>
					</Tooltip>
				</div>
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
											currentVersion.updated_at * 1000,
										).toLocaleString()}
									</span>
								</>
							}
						>
							{time}
						</Tooltip>
					) : null}
				</div>
				<Divider />
			</div>
		);
	};

	return (
		<div>
			<Drawer
				width={600}
				placement="right"
				closable={false}
				onClose={() => setVisible(false)}
				visible={visible}
			>
				<Row>
					<ActiveVersion />
				</Row>
				{allVersions
					.filter((i) => i.version_id !== currentVersion.version_id)
					.map((data) => {
						const time = timeDifference(
							new Date(),
							new Date(data.updated_at || data.created_at * 1000),
						);
						return (
							<div css={pastVersionsStyles}>
								<div className="row-data">
									<div className="sub-title-container">
										<Tooltip title={data.metadata.commit}>
											<p className="overflow-container commit-font">
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
											<p className="overflow-container versionid-font">
												{data.version_id}
											</p>
										</Tooltip>
									</div>
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
																data.updated_at ||
																	data.created_at * 1000,
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
					})}
			</Drawer>
		</div>
	);
};

PastVersionsDrawer.propTypes = {
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	currentVersion: PropTypes.object,
	allVersions: PropTypes.array,
	fetchByVersionId: PropTypes.func.isRequired,
};

PastVersionsDrawer.defaultProps = {
	visible: false,
	currentVersion: {},
	allVersions: [],
	setVisible: () => {},
};

export default PastVersionsDrawer;
