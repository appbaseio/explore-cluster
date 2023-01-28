import { css } from 'emotion';

const deleteUIBuilderStyles = css`
	margin-top: 30px;
	.delete-message {
		color: rgba(0, 0, 0, 0.88);
	}
	.delete-button {
		float: right;
		background-color: grey;
		&:hover {
			background-color: #1677ff;
		}
	}
	.ant-popconfirm-buttons {
		display: flex;
	}
`;

export { deleteUIBuilderStyles };
