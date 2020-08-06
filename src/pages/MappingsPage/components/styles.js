import { css } from 'emotion';

export const footerStyles = css`
	padding: 15px;
	background: white;
	box-shadow: 0 -2px 5px 0 rgba(0, 0, 0, 0.15);
	text-align: right;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const row = css`
	box-sizing: border-box;
	background-color: rgba(0, 0, 0, 0.02);
	margin: 15px 0;
	padding: 15px;
	padding-right: 0;
	border: 1px solid rgba(0, 0, 0, 0.05);

	p {
		font-size: 15px;
		font-weight: bold;
		margin: 0;
	}
`;

export const deleteRow = css`
	.delete-btn {
		margin-left: 8px;
		transform: scale(0);
		transition: all ease 0.2s;
		background: transparent;
		color: #ff4d4f;
		border: 0;
		box-shadow: none;
	}

	.delete-btn:hover {
		color: #f5222d;
	}

	&:hover {
		.delete-btn {
			transform: scale(1);
		}
	}
`;

export const fieldRow = css`
	border: 1px solid rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	background-color: rgba(255, 255, 255, 0.8);
	padding: 10px;

	p {
		font-weight: normal;
		font-size: 14px;
		margin: 0;
	}

	.mappings-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: 5px;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		cursor: pointer;
		border: 1px solid #d9d9d9;
	}

	${deleteRow};
`;

export const container = css`
	padding: 50px;
`;

export const headerRow = css`
	font-weight: 600;
	p {
		font-size: 14px;
		margin: 0;
	}

	i {
		margin-left: 5px;
	}
`;

export const cardTitle = css`
	h4 {
		font-weight: 600;
		margin: 5px 0;
	}
	p {
		margin: 5px 0;
		color: rgba(0, 0, 0, 0.65);
		font-size: 14px;
		white-space: initial;
	}
`;
