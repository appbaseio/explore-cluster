import { css } from 'emotion';

export const UIBuildersListStyles = css`
	.ant-card {
		margin-bottom: 20px;
	}
	.sub-item {
		margin: 0px 0px 10px 0px;
	}
	b {
		margin-right: 15px;
	}
	.status-container {
		margin-right: 5px;
	}
	.card-body {
		gap: 20px;
	}
	.content {
		width: 100%;
	}
	.preview-image {
		width: 270px;
		height: 150px;
		border: 1px solid #f0f0f0;
		border-radius: 5px;
	}
	.clickable-url {
		cursor: pointer;
		&:hover {
			color: #40a9ff;
		}
	}
	.overflow {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.ellipsis-overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.max-width {
		max-width: 90%;
	}
	.ui-builder-actions {
		float: right;
	}
	.domain-link {
		max-width: 90%;
		margin: 2px;
	}
	.link-content {
		color: #fff;
		&:hover {
			text-decoration: underline;
		}
	}
	.ml-5 {
		margin-left: 5px;
	}
`;
