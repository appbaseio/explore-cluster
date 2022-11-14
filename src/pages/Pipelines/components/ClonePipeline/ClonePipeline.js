import React from 'react';
import PropTypes from 'prop-types';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Button, message, notification, Typography } from 'antd';
import { connect } from 'react-redux';
import get from 'lodash/get';
import yamlToJson from 'js-yaml';
import { clonePipeline, getPipelines } from '../../../../batteries/modules/actions';

const ClonePipeline = (props) => {
	const {
		pipeline,
		pipelineScripts,
		isMobile,
		ghost,
		buttonStyle,
		buttonSize,
		clonePipelineAction,
		history,
		fetchPipelines,
	} = props;
	const handleClone = () => {
		const formData = new FormData();
		const pipelineContent =
			pipeline.extension === 'json'
				? JSON.parse(pipeline.content)
				: yamlToJson.load(pipeline.content);
		if (pipelineContent.id) {
			delete pipelineContent.id;
		}
		pipelineContent.description = `Clone of ${pipeline.id} - ${pipeline.description ?? ''}`;

		formData.append(
			'pipeline',
			JSON.stringify({
				content: JSON.stringify(pipelineContent),
				extension: pipeline.extension,
			}),
		);

		const scriptRefs = Object.keys(pipelineScripts);

		if (scriptRefs.length) {
			scriptRefs.forEach((ref) => {
				formData.append(ref, JSON.stringify(pipelineScripts[ref]));
			});
		}

		clonePipelineAction(pipeline, formData).then((res) => {
			if (res && res.error) {
				notification.error({
					message: 'Error',
					description: get(res.error, 'message'),
				});
			} else {
				message.success(`Pipeline cloned successfully`);
				fetchPipelines();
				if (history) {
					history.push('/cluster/pipelines');
				}
			}
		});
	};
	if (isMobile) {
		return (
			// eslint-disable-next-line
			<div onClick={handleClone}>
				<LegacyIcon type={pipeline.isCloning ? 'loading' : 'copy'} />{' '}
				<Typography.Text>Clone</Typography.Text>
			</div>
		);
	}
	return (
		<Button
			onClick={handleClone}
			type="primary"
			ghost={ghost}
			style={buttonStyle}
			size={buttonSize}
			disabled={pipeline.isCloning}
		>
			<LegacyIcon type={pipeline.isCloning ? 'loading' : 'copy'} /> Clone
		</Button>
	);
};

ClonePipeline.propTypes = {
	pipeline: PropTypes.object,
	isMobile: PropTypes.bool,
	ghost: PropTypes.bool,
	buttonStyle: PropTypes.object,
	buttonSize: PropTypes.string,
	clonePipelineAction: PropTypes.func.isRequired,
	pipelineScripts: PropTypes.object,
	history: PropTypes.object,
	fetchPipelines: PropTypes.func.isRequired,
};

ClonePipeline.defaultProps = {
	pipeline: {},
	pipelineScripts: {},
	isMobile: false,
	ghost: false,
	buttonStyle: {},
	buttonSize: 'default',
	history: undefined,
};

const mapStateToProps = (state, props) => {
	return {
		pipelineScripts: get(state, '$getAppPipelines.scriptResults')?.[props.pipeline.id],
	};
};
const mapDispatchToProps = (dispatch) => ({
	fetchPipelines: () => dispatch(getPipelines()),
	clonePipelineAction: (pipeline, newPipeline) => dispatch(clonePipeline(pipeline, newPipeline)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ClonePipeline);
