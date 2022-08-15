import styled from 'react-emotion';

export const Input = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	max-width: 350px;
	margin-top: 1rem;
	align-items: center;
`;

export const Heading = styled.h1`
	margin: 0rem;
	padding: 0rem;
	font-size: 1rem;
	line-height: 1.5rem;
`;

export const Section = styled.section`
	padding: 1rem;
	width: 100%;

	@media only screen and (max-width: 980px), (min-width: 1400px) {
		display: inline-block;
		float: left;
		width: 50%;
	}
`;
