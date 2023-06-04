import React from 'react';
import { object, string } from 'prop-types';
import get from 'lodash/get';
import { Tooltip } from 'antd';

import { connect } from 'react-redux';
import { css } from 'emotion';
import { colorBar } from '../AppCard/StatsBox';
import Flex from '../../batteries/components/shared/Flex';
import { ALLOWED_SLS } from '../../constants';

const healthStatsCSS = css`
	margin: 0 1rem;
	line-height: initial;

	> span {
		display: flex;
		align-items: center;
		gap: 10px;
	}
`;

const getHealthBadge = (isGreen) => {
	return (
		<span
			style={{
				backgroundColor: isGreen ? 'limegreen' : 'red',
			}}
			className={colorBar}
		/>
	);
};

const tooltipContentCSS = css`
	width: max-content;
	.content-row {
		justify-content: space-between;
		gap: 10px;
		align-items: center;
		white-space: nowrap;
	}
`;

const HealthStats = ({ healthStats, backendImage }) => {
	const renderTooltipContent = () => {
		return (
			<div css={tooltipContentCSS}>
				<Flex className="content-row">
					ReactiveSearch API server health:{' '}
					{getHealthBadge(healthStats.SERVER_HEALTH.health)}
				</Flex>
				{!(healthStats.SEARCH_ENGINE_HEALTH?.error?.error?.status === 405) ? (
					<Flex className="content-row">
						Search Engine server health:
						{getHealthBadge(healthStats.SEARCH_ENGINE_HEALTH.health)}
					</Flex>
				) : null}
			</div>
		);
	};

	if (
		!ALLOWED_SLS.includes(backendImage) ||
		healthStats.SEARCH_ENGINE_HEALTH?.loading ||
		healthStats.SEARCH_ENGINE_HEALTH?.loading
	) {
		return null;
	}

	return (
		<div css={healthStatsCSS}>
			<Tooltip title={renderTooltipContent()} overlayStyle={{ maxWidth: 'max-content' }}>
				Service Health{' '}
				{getHealthBadge(
					healthStats.SERVER_HEALTH.health &&
						(healthStats.SEARCH_ENGINE_HEALTH?.error?.error?.status !== 405
							? healthStats.SEARCH_ENGINE_HEALTH?.health
							: true),
				)}
			</Tooltip>
		</div>
	);
};

HealthStats.propTypes = {
	healthStats: object.isRequired,
	backendImage: string.isRequired,
};
const mapStateToProps = (state) => ({
	healthStats: get(state, '$getHealthStats'),
	backendImage: get(state, '$getAppPlan.results.image_type'),
});

export default connect(mapStateToProps)(HealthStats);
