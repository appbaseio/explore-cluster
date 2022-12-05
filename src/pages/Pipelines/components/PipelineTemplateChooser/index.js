import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import React from 'react';

import PIPELINE_TEMPLATES from '../../utils/pipeline-templates';

const pipelineTemplateCss = css`
	position: absolute;
	z-index: 111;
	height: calc(100vh - 61px);
	max-height: calc(100vh - 61px);
	width: 100%;
	left: 0;
	background: white;
	top: 1px;
	display: flex;
	flex-direction: column;

	.title-wrapper {
		padding: 10px;
		padding-left: 40px;
		h2 {
			margin-bottom: 0;
		}
	}
	.template-cards-wrapper {
		display: flex;
		flex-wrap: wrap;
		flex: 1;
		overflow: auto;
		justify-content: center;
		.template-card {
			cursor: pointer;
			margin: 7px;
			height: 200px;
			text-align: center;
			position: relative;
			p {
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 4;
				-webkit-box-orient: vertical;
				text-align: left;
			}

			.ant-card-head {
				border-bottom: none;
			}
			.ant-card-head-title {
				text-align: left;
			}
			.overlay {
				transform: scale(0);
				transition: all 0.3s;
				position: absolute;
				top: 0;
				left: 0;
				height: 100%;
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				background-color: rgba(0, 0, 0, 0.5);
			}

			&:hover {
				.overlay {
					transform: scale(1);
				}
			}
		}
	}

	.footer-area {
		width: 100%;
		padding: 10px;
		button {
			float: right;
		}
	}
`;

const PipelineTemplateChooser = (props) => {
	const { isVisible, closeTemplateChoser, onTemplateClick } = props;
	const handleCardClick = (templateKey) => {
		onTemplateClick(templateKey);
	};

	const renderTemplateCards = () => {
		return Object.keys(PIPELINE_TEMPLATES).map((template) => {
			return (
				<Card
					key={template}
					hoverable
					className="template-card"
					title={template}
					style={{ width: 300 }}
				>
					<div className="overlay">
						<Button type="primary" onClick={() => handleCardClick(template)}>
							Select Template
						</Button>
					</div>
					<p title={<p>{PIPELINE_TEMPLATES[template].description}</p>}>
						{PIPELINE_TEMPLATES[template].description}
					</p>
				</Card>
			);
		});
	};

	if (!isVisible) {
		return null;
	}
	return (
		<div className={pipelineTemplateCss}>
			<div className="title-wrapper">
				<h2>
					Pipeline Templates{' '}
					<Tooltip title="Pipelines templates to help you start. Click on a template card to use, or create a fresh pipeline.">
						<InfoCircleOutlined />
					</Tooltip>
				</h2>
			</div>

			<div className="template-cards-wrapper">{renderTemplateCards()}</div>
			<div className="footer-area">
				<Button onClick={closeTemplateChoser} type="primary">
					Create a new pipeline
				</Button>
			</div>
		</div>
	);
};
PipelineTemplateChooser.defaultProps = {
	isVisible: false,
};

PipelineTemplateChooser.propTypes = {
	isVisible: PropTypes.bool,
	closeTemplateChoser: PropTypes.func.isRequired,
	onTemplateClick: PropTypes.func.isRequired,
};
export default PipelineTemplateChooser;
