import { css } from 'emotion';

const searchInputStyle = css`
	text-align: center;
	padding: 10px 16px;
	opacity: 0.3;
	&:focus-within {
		opacity: 1;
	}
`;

export default searchInputStyle;
