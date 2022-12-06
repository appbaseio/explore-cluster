import { css } from 'emotion';

const endpointConfigStyles = css`
	.row-data {
		display: flex;
		justify-content: space-between;
		gap: 10px;
	}

	.endpoint-dropdown {
		min-width: 500px;
		max-width: 500px;
		width: 100%;
	}

	.overflow {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		max-width: 400px;
	}

	.description-overflow {
		max-width: 400px;
	}
`;

export { endpointConfigStyles };
