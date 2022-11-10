import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Drawer, Typography } from 'antd';
import { css } from 'emotion';
import { connect } from 'react-redux';
import { orderBy } from 'lodash';
import VersionCard from './VersionCard';
import { updateCurrentActiveVersion } from '../../../../batteries/modules/actions';

const pipelineVersionsStyles = css``;
const drawerStyles = css`
	.ant-drawer-body {
		padding: 0;
	}
`;
const PipelineVersionsDrawer = ({
	setActivePipelineVersion,
	visible,
	setVisible,
	allVersions,
	makePipelineVersionLive,
}) => {
	const sortedVersions = useCallback(() => {
		const newVersions = orderBy(
			allVersions ?? [],
			[
				(a) => {
					return a.is_live ? 1 : 0;
				},
				(a) => {
					const timestamp = a.updated_at || a.created_at;
					const timeInMilliSecondsSinceEpoch = new Date(timestamp).valueOf();
					return timeInMilliSecondsSinceEpoch;
				},
			],
			['desc', 'desc'],
		);

		return newVersions ?? [];
	}, [allVersions]);
	return (
		<div className={pipelineVersionsStyles}>
			<Drawer
				width={700}
				placement="right"
				closable={false}
				onClose={() => setVisible(false)}
				visible={visible}
				css={drawerStyles}
			>
				<Typography.Title level={3} style={{ margin: '1rem' }}>
					All versions of this pipeline
				</Typography.Title>
				{sortedVersions().map(
					/* eslint-disable camelcase */
					({
						_version,
						_version_description,
						usage = {},
						created_at,
						updated_at,
						is_live,
						updatingLiveStatus = false,
						id,
					}) => {
						const formattedUsage = {};

						Object.keys(usage).forEach((key) => {
							if (key === 'took' && typeof usage[key] === 'number') {
								formattedUsage[key] = `${usage[key].toFixed(0)}ms`;
								return;
							}
							if (key === 'success_rate' && typeof usage[key] === 'number') {
								formattedUsage[key] = `${usage[key].toFixed(2)}%`;
								return;
							}
							formattedUsage[key] = `${usage[key]}`;
						});

						return (
							<VersionCard
								key={_version}
								usage={formattedUsage}
								version={_version}
								versionDescription={_version_description}
								createdAt={String(updated_at || created_at)}
								isLive={is_live}
								onClickMakeLive={() => {
									makePipelineVersionLive(_version);
								}}
								updatingLiveStatus={updatingLiveStatus}
								id={id}
								setActivePipelineVersion={(pipelineId, version) => {
									setVisible(false);
									setActivePipelineVersion(pipelineId, version);
								}}
							/>
						);
					},
					/* eslint-enable camelcase */
				)}
			</Drawer>
		</div>
	);
};

PipelineVersionsDrawer.propTypes = {
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	allVersions: PropTypes.array,
	makePipelineVersionLive: PropTypes.func.isRequired,
	setActivePipelineVersion: PropTypes.func.isRequired,
};

PipelineVersionsDrawer.defaultProps = {
	visible: false,
	allVersions: [],
	setVisible: () => {},
};
const mapDispatchToProps = (dispatch) => ({
	setActivePipelineVersion: (pipelineId, version) =>
		dispatch(updateCurrentActiveVersion(pipelineId, version)),
});

export default connect(null, mapDispatchToProps)(PipelineVersionsDrawer);
