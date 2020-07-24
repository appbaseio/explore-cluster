import { css } from 'emotion';

const listItem = css`
	position: relative;
	padding-bottom: 10px;
	.text-right {
		text-align: right;
	}

	.text-center {
		text-align: center;
	}

	.text-ellipsis {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ant-col {
		margin-bottom: 5px;
	}

	.collapse {
		overflow: hidden;
		max-height: 200px;
	}

	.expand-button-container button {
		margin: 10px 0 0;
		padding: 0;
		color: #1890ff;
		border: 0;
		background: inherit;
		cursor: pointer;
	}

	.expand-button-container {
		width: 100%;
		background: linear-gradient(0, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.82));
	}
`;

const ruleStyle = css`
	display: flex;
	justify-content: space-between;
	padding: 5px 0;

	p {
		margin: 0;
		font-size: 14px;
		color: rgba(0, 0, 0, 0.65);
	}

	p.name {
		font-weight: bold;
	}

	p.expression {
		color: rgba(0, 0, 0, 0.55);
	}

	@media (max-width: 576) {
		flex-direction: column;
	}
`;
export { listItem, ruleStyle };
