import { css } from 'emotion';

export const modalContainer = css`
	.form-field-container {
		margin-top: 20px;
		font-weight: 600;
	}

	.title-container {
		margin-bottom: 5px;
	}

	.validate-container {
		margin: 10px;
	}

	.dropdown-container {
		width: 50%;
	}

	.form-sub-field-container {
		margin: 10px;
	}
`;

export const globalVarsCardContainer = css`
	background: #fff;

	.show-on-hover {
		transition: all ease 0.2s;
		transform: scale(0);
		opacity: 0;
	}

	&:hover {
		.show-on-hover {
			transform: scale(1);
			opacity: 1;
		}
	}

	.title-container {
		font-size: 15px;
		margin-bottom: 5px;
	}

	.input-container {
		width: 60%;
	}

	.dropdown-container {
		width: 400px;
		margin-top: 10px;
	}

	.deploy-cluster-option-chooser {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 30px;
	}

	.success-alert {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.choose-cluster {
		display: flex;
		flex-direction: column;
	}

	.cluster-view-button {
		cursor: pointer;
		color: #18a0fb;
	}

	.validate-button {
		margin-left: 20px;
		margin-right: 20px;
	}

	.deploy-button {
		height: 40px;
		width: 150px;
		margin: 20px 0px 0px 20px;
	}

	.create-cluster-button {
		height: 40px;
		width: 275px;
	}

	.error-alert-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.card-title-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
`;

export const popoverContent = css`
	overflow-y: auto;
	overflow-x: auto;
	word-wrap: break-word;
	max-width: 300px;
	max-height: 300px;
`;
