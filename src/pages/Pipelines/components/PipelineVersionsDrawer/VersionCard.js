import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Tag, Button, Tooltip } from 'antd';
import { css } from 'emotion';
import moment from 'moment';
import Flex from '../../../../batteries/components/shared/Flex';

const versionCardStyles = css`
	.tag-wrapper {
		position: relative;
		margin: 0 auto 20px;
		height: 30px;
		.edit-version-btn {
			margin-left: auto;
			margin-right: 1rem;
		}
		.edit-version-btn,
		.make-live-btn {
			display: none;
		}

		&:hover {
			.edit-version-btn,
			.make-live-btn {
				display: unset;
			}
		}
	}

	.usage-stats-wrapper {
		gap: 10px;
		flex-wrap: wrap;
	}
`;
const VersionCard = ({
	usage,
	version,
	versionDescription,
	createdAt,
	isLive,
	onClickMakeLive,
	updatingLiveStatus,
	setActivePipelineVersion,
	id,
}) => {
	const getStatsArray = () => {
		const statsMap = {
			count: 'Invoked Count',
			took: 'Avg. Latency',
			success_rate: 'Success Rate',
		};

		return ['count', 'took', 'success_rate'].map((item) => ({
			key: statsMap[item],
			value: usage[item] ?? '--',
		}));
	};

	return (
		<Card
			title={
				<Flex style={{ gap: '10px' }}>
					<code>v{version}</code>
					<Tooltip title={versionDescription}>
						<Typography.Text ellipsis>{versionDescription}</Typography.Text>
					</Tooltip>
					{createdAt ? (
						<Tooltip
							title={
								<div>
									<p>{moment.unix(createdAt).format('ddd D MMM, hh:mm A')}</p>
								</div>
							}
						>
							<Typography.Text style={{ marginLeft: 'auto' }}>
								{moment.unix(createdAt).stdFromNow()}
							</Typography.Text>
						</Tooltip>
					) : (
						'-'
					)}
				</Flex>
			}
			css={versionCardStyles}
			hoverable
		>
			<Flex justifyContent="space-between" alignItems="center" className="tag-wrapper">
				<Tag color={isLive ? 'green' : 'grey'} style={{ fontSize: '1rem' }}>
					{isLive ? 'Live' : 'Draft'}
				</Tag>
				<Button
					className="edit-version-btn"
					onClick={() => {
						setActivePipelineVersion(id, version);
					}}
					icon="edit"
				>
					Edit this version
				</Button>
				{!isLive && (
					<Button
						loading={updatingLiveStatus}
						className="make-live-btn"
						onClick={onClickMakeLive}
					>
						Make this version live
					</Button>
				)}
			</Flex>
			<Flex
				justifyContent="space-between"
				alignItems="center"
				className="usage-stats-wrapper"
			>
				{getStatsArray().map((item) => (
					<Card hoverable key={item.key} style={{ width: 161, textAlign: 'center' }}>
						<h3>{item.key}</h3>
						<p>{item.value}</p>
					</Card>
				))}
			</Flex>
		</Card>
	);
};

VersionCard.propTypes = {
	usage: PropTypes.object.isRequired,
	version: PropTypes.number.isRequired,
	versionDescription: PropTypes.string.isRequired,
	createdAt: PropTypes.string.isRequired,
	isLive: PropTypes.bool.isRequired,
	onClickMakeLive: PropTypes.func.isRequired,
	updatingLiveStatus: PropTypes.bool.isRequired,
	setActivePipelineVersion: PropTypes.func.isRequired,
	id: PropTypes.string.isRequired,
};

VersionCard.defaultProps = {};
export default VersionCard;
