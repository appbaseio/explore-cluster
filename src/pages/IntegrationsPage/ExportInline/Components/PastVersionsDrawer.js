import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarTwoTone, LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Drawer, Divider, Row, Tooltip } from 'antd';
// eslint-disable-next-line import/no-cycle
import List from './List';
import { pastVersionsStyles } from './styles';
import { timeDifference } from '../../utils/index';

const PastVersionsDrawer = ({
	visible,
	setVisible,
	currentVersion,
	allVersions,
	preferenceId,
	updatedCode,
	updateVersionStateForPreference,
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
			<div className={pastVersionsStyles}>
				{isLoading ? <LoadingOutlined /> : <ClockCircleOutlined />}
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
									<CalendarTwoTone style={{ marginRight: 5 }} />
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
				width={700}
				placement="right"
				closable={false}
				onClose={() => setVisible(false)}
				open={visible}
			>
				<Row>
					<ActiveVersion />
				</Row>
				{allVersions
					.filter((i) => i.version_id !== currentVersion.version_id)
					.map((data) => {
						return (
							<List
								data={data}
								setIsLoading={setIsLoading}
								preferenceId={preferenceId}
								updatedCode={updatedCode}
								updateVersionStateForPreference={updateVersionStateForPreference}
							/>
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
	preferenceId: PropTypes.string,
	updatedCode: PropTypes.object,
	updateVersionStateForPreference: PropTypes.func.isRequired,
};

PastVersionsDrawer.defaultProps = {
	visible: false,
	currentVersion: {},
	allVersions: [],
	setVisible: () => {},
	preferenceId: '',
	updatedCode: {},
};

export default PastVersionsDrawer;
