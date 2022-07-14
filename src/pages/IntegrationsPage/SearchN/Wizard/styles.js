import { css } from 'emotion';

export const SearchTemplateStyles = css`
	.theme-container {
		margin-top: 40px;
	}

	.theme-templates-container {
		display: flex;
		gap: 40px;
	}

	.description-container {
		margin-top: 20px;
		font-size: 18px;
	}

	.card-border {
		border: 1px solid #1890ff;
	}

	.heading > h3 {
		font-weight: 700;
		font-size: 16px;
	}
`;

export const configureConnectionStyles = css`
	.description-container {
		margin-top: 20px;
		font-size: 18px;
	}
	.heading {
		font-weight: 700;
		font-size: 16px;
	}
	.field-container {
		margin-top: 50px;
	}
	.field-description {
		margin-top: 20px;
	}
	.button-container {
		margin: 30px 0px 60px 0px;
		display: flex;
		justify-content: space-evenly;
	}
`;

export const suggestionStyles = css`
	.row-data {
		display: flex;
		justify-content: space-between;
	}
	.overflow {
		max-width: 400px;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: no-wrap;
	}
`;

export const SearchUIStyles = css`
	.description-container {
		margin: 20px 0px 20px 0px;
		font-size: 18px;
	}
`;

export const footerStyles = css`
	.footer-container {
		width: 100%;
		padding: 20px;
		background: white;
		box-sizing: border-box;
		border: 1px solid #e8e8e8;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
		display: flex;
		justify-content: space-between;
	}
`;
