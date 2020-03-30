import { css } from 'emotion';

export const container = css`
	padding: 50px;
	position: relative;

	.space-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.flex-end {
		justify-content: flex-end;
	}

	.flex {
		display: flex;
	}

	.card-footer {
		width: 100%;
		padding: 20px;
		background: white;
		box-sizing: border-box;
		border: 1px solid #e8e8e8;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
	}

	.ant-card-body-padding-bottom-0 {
		.ant-card-body {
			padding-bottom: 0;
		}
	}
`;

export const label = css`
	label {
		font-weight: 600;
		color: #595959;
	}
`;
