import { css } from 'emotion';

export const domainSettingsTabStyles = css`
	.input-container {
		display: flex;
		grid-gap: 5;
		align-items: center;
	}

	.domain-status-container {
		padding: 20px;
		margin: 30px 10px 10px 10px;
		border: 1px solid #ebedf0;
		width: 90%;
	}

	.deployment-status-container {
		padding: 20px;
		margin: 20px 0px;
		border: 1px solid #ebedf0;
		width: 70vw;
		font-size: 20px;
	}

	.warning-icon {
		color: orange;
		margin: 0px 5px;
		font-size: 30px;
	}

	.domain-row {
		display: flex;
		align-items: center;
		gap: 10px;
		justify-content: space-between;
		font-size: 15px;
	}

	.domain-name {
		width: 400px;
    	max-width: 400px;
}
	}
	.delete-icon {
		font-size: 20px !important;
		cursor: pointer;
	}

	.restore-icon {
		font-size: 15px;
		cursor: pointer;
	}

	.tag-container {
		font-size: 15px;
		padding: 5px;
	}
	.add-icon {
		cursor: pointer;
		color: grey;
		&: hover {
			color: #91d5ff;
		}
	}
`;

export const hoverStyles = css`
	.show-on-hover {
		transform: rotateX(90deg);
		opacity: 0;
		transition: all ease 0.3s;
		font-size: 16px;
	}
	&:hover {
		.show-on-hover {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}
`;
