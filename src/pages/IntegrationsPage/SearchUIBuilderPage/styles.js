import { css } from 'emotion';

export const container = css`
	padding: 50px;
	position: relative;
	margin-bottom: 100px;

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
	.button-label {
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.footer-container {
		background-color: #fff;
		padding: 15px 10px;
		width: calc(100% - 50px);
	}
`;
