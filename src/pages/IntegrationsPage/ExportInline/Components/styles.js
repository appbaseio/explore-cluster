import { css } from 'react-emotion';

const commitModalStyles = css`
	.label-container {
		font-size: 16px;
		margin: 10px 0px 5px 0px;
	}
	.suggestion {
		width: 100%;
		display: flex;
		align-items: center;
	}
	.commit-message {
		width: 65%;
	}
	.overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.version-id {
		width: 30%;
	}
`;

const pastVersionsStyles = css`
	.active-version-icon {
		position: absolute;
		right: 10px;
		font-size: 20px;
	}
	.title-container {
		font-weight: 550;
		font-size: 16px;
		color: rgb(51 50 50 / 65%);
		display: flex;
		align-items: center;
	}
	.row-data {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.sub-title-container {
		color: rgb(51 50 50 / 65%);
		display: flex;
		align-items: center;
		width: 100%;
	}
	.commit-font {
		font-size: 14px;
	}
	.versionid-font {
		font-size: 12px;
	}
	.versionid-header-font {
		font-size: 14px;
	}
	.commit-header-font {
		font-size: 16px;
	}
	.overflow-container {
		max-width: 150px;
		margin: 0;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	.label {
		font-weight: 550;
	}

	.max-width {
		max-width: 450px;
	}
	.overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	.icon-active {
		&:hover {
			color: #40a9ff;
		}
	}
	.clickable-url {
		cursor: pointer;
		&:hover {
			color: #40a9ff;
		}
	}
	.navigation-buttons-container {
		float: right;
		display: flex;
		gap: 10px;
		margin-top: 15px;
	}
`;

const deployModalStyles = css`
	.title-container {
		background: red;
	}
`;

const editorContainer = css`
	overflow: scroll;
	margin-top: 10px;
	.log-line {
		display: flex;
		line-height: 30px;
		&: hover {
			background-color: #eaeaea;
		}
	}

	.log-component {
		margin-left: 5px;
	}

	.width {
		width: 120px;
		min-width: 120px;
	}

	.bg-warning {
		background-color: #ffefcf;
		&: hover {
			background-color: #ffdf9e;
		}
	}

	.bg-error {
		background-color: #f7d4d6;
		&: hover {
			background-color: #efa9ac;
		}
	}
`;

export { commitModalStyles, pastVersionsStyles, deployModalStyles, editorContainer };
