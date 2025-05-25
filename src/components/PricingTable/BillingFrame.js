import React from 'react';
import { Card } from 'antd';
import { string } from 'prop-types';
import styled from 'react-emotion';

const StyledLink = styled.a`
	color: dodgerblue;
	cursor: pointer;
`;

const openChatWindow = () => {
	if (window.Tawk_API) {
		window.Tawk_API.toggle();
	} else if (window.Intercom) {
		window.Intercom('show');
	}
};

const BillingFrame = ({ id, url }) => (
	<div>
		<iframe
			title={id}
			id={id}
			src={url}
			width="100%"
			// TODO: We need to manage it manually
			height={1600}
			scrolling="no"
			frameBorder={0}
			style={{
				border: 'none',
			}}
		/>
		<Card bodyStyle={{ padding: '20px 50px' }}>
			<p style={{ marginBottom: '0' }}>
				Do you want to change your current plan?{' '}
				<StyledLink onClick={openChatWindow}>Chat with us</StyledLink>
			</p>
		</Card>
	</div>
);

BillingFrame.propTypes = {
	id: string.isRequired,
	url: string.isRequired,
};
export default BillingFrame;
