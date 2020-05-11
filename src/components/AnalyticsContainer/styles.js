import { css } from 'emotion';

export const drawerClass = css`
	width: 0;
	transition: all 0.2s ease;
	right: 0;
	top: 60px;
	position: fixed;
	height: calc(100vh - 60px);
	border-left: 1px solid transparent;
	box-sizing: border-box;
	overflow-y: scroll;
	background: #f5f5f5;
	&.open {
		box-shadow: -2px 0px 10px 0 rgba(0, 0, 0, 0.15);
		width: 350px;
	}

	.insights-header {
		display: flex;
		padding: 16px;
		background: #1890ff;
		align-items: center;
		justify-content: space-between;
	}

	.insights-header > div > h6 {
		font-size: 16px;
		color: white;
		margin: 0;
	}

	.insights-header > div > p {
		font-size: 14px;
		color: #fafafa;
		margin: 0;
	}

	.insight-sidebar-content {
		opacity: 0;
		transition: all ease 0.4s;
		transition-delay: 0.2s;
	}

	&.open .insight-sidebar-content {
		opacity: 1;
	}
`;

export const collapseStyles = css`
	.ant-collapse {
		border-radius: 0;
	}

	.panel-header .insight-title {
		color: rgba(0, 0, 0, 0.85);
		font-weight: 600;
		margin: 0;
		font-size: 15px;
	}

	.panel-header .insight-description {
		color: rgba(0, 0, 0, 0.45);
		font-size: 14px;
		line-height: 18px;
		margin: 0;
		margin-top: 5px;
	}

	.recommendation-title {
		color: rgba(0, 0, 0, 0.65);
		font-weight: 600;
		margin: 0;
		font-size: 14px;
	}

	.recommendation-link {
		width: 100%;
		transition: all ease-in 0.2s;
	}

	.title,
	.list-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.title .icon,
	.list-title .icon {
		transform: translateX(-10px);
		opacity: 0;
		transition: all 0.2s ease-out;
	}

	.report-btn {
		font-size: 13px;
		margin-top: 5px;
	}

	.panel:hover {
		.title .icon {
			transform: translateX(0px);
			opacity: 1;
		}
	}

	.recommendation-link:hover {
		.ant-list-item-meta-title {
			color: #1890ff;
		}

		.list-title .icon {
			transform: translateX(0px);
			opacity: 1;
		}
	}
`;
