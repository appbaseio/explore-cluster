import { css } from 'emotion';

const searchInputStyle = css`
	text-align: center;
	padding: 10px 16px;
	input {
		opacity: 0.3;

		&:focus {
			opacity: 1;
		}
	}
`;

export default searchInputStyle;
