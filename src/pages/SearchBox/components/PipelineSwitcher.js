import React, { useEffect } from 'react';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { Row, Select, Tag, Tooltip } from 'antd';
import { arrayOf, func, string } from 'prop-types';
import styled from 'react-emotion';
import moment from 'moment';
import { getPipelines } from '../../../batteries/modules/actions';
import { loadApps } from '../../../actions';

const StyledOption = styled(Select.Option)`
	position: relative;
`;
const StyledTag = styled(Tag)`
	position: absolute;
	right: 0;
	top: 0;
`;
const Description = styled.div`
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	max-width: 70%;
`;
const TimeDescription = styled(Description)`
	margin-left: auto;
`;

/**
 * @typedef {Object} Route
 * @property {string} path
 * @property {string} method
 *
 * @typedef {Object} Pipeline
 * @property {string} id
 * @property {Route} route
 * @property {boolean} index - true if the pipeline is associated to and index
 *
 *
 * @param {string} index
 * @returns {Pipeline} pipeline
 */

export function formIndexPipeline(index) {
	return {
		id: index,
		route: {
			path: `/${index}/_reactivesearch`,
			method: 'POST',
		},
		index: true,
	};
}

/**
 * Pipeline structure
 * id: string
 * route: {
 *  path: string,
 *  method: string,
 * }
 *
 * A component which is always controlled by the parent
 */
const PipelineSwitcherComponent = ({
	pipelines,
	apps,
	fetchPipelines,
	fetchApps,
	value,
	onChange,
	...props
}) => {
	useEffect(() => {
		if (!pipelines.length) fetchPipelines();
		if (!apps.length) fetchApps();
	}, []);
	const indexPipelines = apps.map((app) => formIndexPipeline(app));
	return (
		<Select onChange={onChange} value={value || undefined} optionFilterProp="label" {...props}>
			{[...pipelines, ...indexPipelines].map((k) => {
				const timestamp = k.updated_at || k.created_at;
				return (
					/*
					 * RS pipelines have duplicate ids, so we need to add the route path to the id
					 */
					<StyledOption
						key={`${k.id}--${k.route.path}`}
						value={`${k.id}--${k.route.path}`}
						label={k.route.path}
						// Prop used to pass to the onChange handler
						pipeline={k}
					>
						<Row>
							<Description>
								<Tooltip title={`${k.route.method} ${k.route.path}`}>
									{k.route.method} {k.route.path}
								</Tooltip>
							</Description>
						</Row>
						<Row>
							{k.description ? (
								<Description>
									<Tooltip title={k.description}>{k.description}</Tooltip>
								</Description>
							) : null}
							{timestamp ? (
								<TimeDescription>
									{moment.unix(timestamp).format('ddd DD MMM, hh:mm A') || 'NA'}
								</TimeDescription>
							) : null}
						</Row>
						{k.index ? <StyledTag>index</StyledTag> : <StyledTag>pipeline</StyledTag>}
					</StyledOption>
				);
			})}
		</Select>
	);
};

PipelineSwitcherComponent.propTypes = {
	pipelines: arrayOf(string).isRequired,
	apps: arrayOf(string).isRequired,
	fetchPipelines: func.isRequired,
	fetchApps: func.isRequired,
	value: string.isRequired,
	onChange: func.isRequired,
};

const mapStateToProps = (state) => {
	const pipelines = get(state, '$getAppPipelines.results', []);
	let pipelineRoutes = [];

	pipelines.forEach((pipeline) => {
		(pipeline.routes || []).forEach((data) => {
			pipelineRoutes = [...pipelineRoutes, { route: data, ...pipeline }];
		});
	});

	return {
		pipelines: pipelineRoutes,
		apps: Object.keys(get(state, 'apps.data') || {})
			.filter((app) => !app.startsWith('.'))
			.filter((k) => !k.includes('metricbeat')),
	};
};

const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines(false)),
	fetchApps: () => dispatch(loadApps()),
});

export const PipelineSwitcher = connect(
	mapStateToProps,
	mapDispatchToProps,
)(PipelineSwitcherComponent);

export default PipelineSwitcher;
