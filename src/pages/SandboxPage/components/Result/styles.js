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

	.react-expand-collapse__content {
		position: relative;
		overflow: hidden;
	}

	.react-expand-collapse__body {
		display: inline;
	}

	/* expand-collapse button */
	.react-expand-collapse__button {
		color: #22a7f0;
		position: absolute;
		bottom: 0;
		left: 0;
		background-color: #fff;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		width: 100%;
		background: linear-gradient(0, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.82));
	}

	.react-expand-collapse__button:before {
		content: '';
		position: absolute;
		top: 0;
		left: -20px;
		width: 20px;
		height: 100%;
		background: linear-gradient(to right, transparent 0, #fff 100%);
	}

	/* expanded state */
	.react-expand-collapse--expanded .react-expand-collapse__button {
		padding-left: 5px;
		position: relative;
		bottom: auto;
		right: auto;
	}

	.react-expand-collapse--expanded .react-expand-collapse__button:before {
		content: none;
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
