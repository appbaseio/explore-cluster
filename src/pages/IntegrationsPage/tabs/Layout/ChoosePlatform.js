import React from 'react';

import { Radio } from 'antd';
import { FieldControl, FieldGroup } from 'react-reactive-form';

const ChoosePlatform = () => (
	<div>
		<h2>Choose E-Commerce Platform</h2>
		<FieldGroup name="exportSettings">
			{() => (
				<React.Fragment>
					<FieldControl name="type">
						{({ handler }) => (
							<Radio.Group {...handler()}>
								<Radio value="shopify">Shopify</Radio>
								<Radio value="other">Other</Radio>
							</Radio.Group>
						)}
					</FieldControl>
				</React.Fragment>
			)}
		</FieldGroup>
	</div>
);

export default ChoosePlatform;
