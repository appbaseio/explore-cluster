import React, { useState } from 'react';
import { Button, Icon, Typography } from 'antd';
import CloneRuleModal from './CloneRuleModal';

function CloneRule({
	rule,
	isMobile = false,
	ghost = false,
	buttonStyle = {},
	buttonSize = 'default',
}) {
	const [visible, setVisible] = useState(false);

	function getButton() {
		if (isMobile)
			return (
				// eslint-disable-next-line
				<div onClick={() => setVisible(true)}>
					<Icon type="copy" /> <Typography.Text>Clone</Typography.Text>
				</div>
			);
		return (
			<Button
				onClick={() => setVisible(true)}
				type="primary"
				ghost={ghost}
				style={buttonStyle}
				size={buttonSize}
			>
				<Icon type="copy" /> Clone
			</Button>
		);
	}

	return (
		<>
			{getButton()}
			{visible && <CloneRuleModal rule={rule} handleCancel={() => setVisible(false)} />}
		</>
	);
}

export default CloneRule;
