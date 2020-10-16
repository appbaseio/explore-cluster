import React from 'react';
import { Radio } from 'antd';
import { FieldControl, FieldGroup } from 'react-reactive-form';

const Platform = () => (
	<div>
		<h2>Choose E-Commerce Platform</h2>
		<p>Choosing an E-Commerce Platform provides specific installation steps</p>
		<FieldGroup name="exportSettings">
			{() => (
				<div>
					<FieldControl name="type">
						{({ handler }) => (
							<Radio.Group {...handler()}>
								<Radio value="shopify">Shopify</Radio>
								<Radio value="other">
									Other (Wordpress, Magento, Big Commerce, others)
								</Radio>
							</Radio.Group>
						)}
					</FieldControl>
				</div>
			)}
		</FieldGroup>
	</div>
);

export default Platform;
