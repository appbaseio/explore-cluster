import React from 'react';
import { css } from 'emotion';
import Container from '../../../../components/Container';
import PreferenceForm from './PreferenceForm';
import ErrorToaster from '../../../../batteries/components/shared/ErrorToaster';

const main = css`
	.actionBtn {
		position: absolute;
		right: 50px;
	}
`;

function EndpointSuggestions() {
	return (
		<React.Fragment>
			<Container css={main}>
				<ErrorToaster>
					<PreferenceForm />
				</ErrorToaster>
			</Container>
		</React.Fragment>
	);
}

export default EndpointSuggestions;
