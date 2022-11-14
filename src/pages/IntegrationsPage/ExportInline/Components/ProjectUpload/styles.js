import { css } from 'emotion';

const uploadStyles = css`
	input[type='file'] {
		display: none;
	}
	.custom-file-upload {
		display: inline-block;
		padding: 6px 12px;

		border: 1px solid transparent;
		box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
		user-select: none;
		touch-action: manipulation;

		border-radius: 4px;
		color: rgba(0, 0, 0, 0.65);
		background-color: #fff;
		border-color: #d9d9d9;

		&:hover {
			color: #40a9ff;
			background-color: #fff;
			border-color: #40a9ff;
		}
	}
`;

export { uploadStyles };
