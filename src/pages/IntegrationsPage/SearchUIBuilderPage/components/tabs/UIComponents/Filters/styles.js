import { css } from 'emotion';

export const DatePickerStyles = css`
	.ant-form-item-control {
		line-height: 12px;
	}
	.DayPickerInput {
		width: 100%;
	}
	input {
		width: 100%;
		height: 32px;
		padding: 4px 11px;

		border: 1px solid #d9d9d9;
		border-radius: 4px;
	}
`;

export const filterModalStyles = css`
	display: flex;

	.resizer {
		width: 2px;
		cursor: ew-resize;
		background-color: #cbd5e0;
	}
	.left-container {
		width: 50%;
		padding-right: 20px;
		height: calc(80vh - 20px);
		overflow: scroll;
	}
	.right-container {
		padding: 0px 20px;
		width: 100%;
		max-width: 65%;
		min-width: 50%;
		height: calc(80vh - 20px);
		overflow: scroll;
	}
	.preview-container {
		padding: 20px;
		background: #e3e4e5;
		display: flex;
		justify-content: center;
	}
	.section-header {
		font-weight: bold;
		margin-top: 20px;
	}
	.icon-active {
		float: right;
		font-size: 18px;
		&:hover {
			color: #40a9ff;
		}
	}
`;
