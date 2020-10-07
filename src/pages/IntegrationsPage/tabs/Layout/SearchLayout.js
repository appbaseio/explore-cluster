import React from 'react';
import { FieldControl } from 'react-reactive-form';
import { Card, Tag } from 'antd';

const { Meta } = Card;

const themeTypes = [
	{
		type: 'classic',
		name: 'Classic',
		description:
			'Theme appropriate for store having multiple categories like electronics, clothing, etc.',
		image: '/static/images/ecomm/classic.png',
	},
	{
		type: 'minimal',
		name: 'Minimal',
		description: 'Theme appropriate for Fashion store.',
		image: '/static/images/ecomm/minimal.png',
	},
];

const SearchLayout = () => (
	<div>
		<h2>Search Layout</h2>
		<p>Search Layout lets you choose a layout preset for the search view.</p>
		<FieldControl name="themeType">
			{({ value, onChange }) => (
				<div style={{ display: 'flex', alignItems: 'baseline' }}>
					{themeTypes.map((themeObject) => (
						<Card
							hoverable={themeObject.type !== value}
							key={themeObject.type}
							onClick={() => onChange(themeObject.type)}
							style={{
								width: 240,
								border: 0,
								marginRight: 30,
							}}
							cover={<img alt={themeObject.name} src={themeObject.image} />}
						>
							<Meta
								title={
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
										}}
									>
										{themeObject.name}
										{themeObject.type === value ? (
											<Tag
												style={{
													marginLeft: 8,
												}}
												color="blue"
											>
												Selected
											</Tag>
										) : null}
									</div>
								}
								description={themeObject.description}
							/>
						</Card>
					))}
				</div>
			)}
		</FieldControl>
	</div>
);

export default SearchLayout;
