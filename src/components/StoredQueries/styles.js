import { css } from 'emotion';

export const titleStyle = css`
	h3 {
		margin-bottom: 0;
	}

	p {
		font-weight: 300;
		font-size: 0.8rem;
		margin-bottom: 0;
	}
`;

export const main = css`
	.ant-btn {
		margin-left: 5px;
		padding: 0 5px;

		&.danger-btn {
			background: transparent;
			svg {
				fill: #ff4d4f;
			}
		}
	}
`;
