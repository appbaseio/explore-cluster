import React from 'react';
import { Card, Tag } from 'antd';
import { FieldControl } from 'react-reactive-form';

const { Meta } = Card;

const themeTypes = [
	{
		type: 'classic',
		name: 'Classic',
		description:
			'Theme appropriate for an e-commerce or site search UI having many facet filters',
		image: '/static/images/ecomm/classic.png',
	},
	{
		type: 'minimal',
		name: 'Minimal',
		description: 'Theme appropriate for a search site with a basic facet navigation',
		image: '/static/images/ecomm/minimal.png',
	},
	{
		type: 'geo',
		name: 'Geo',
		description: 'Theme appropriate for a geo / map search UI',
		image: '/static/images/ecomm/geo.png',
	},
];

const SearchLayout = () => (
	<div>
		<h2>Search Layout</h2>
		<p>Search Layout lets you choose a layout preset for the search view</p>
		<FieldControl name="themeType">
			{({ value, onChange }) => (
				<div style={{ display: 'flex', alignItems: 'baseline' }}>
					{themeTypes.map((themeObject) => (
						<Card
							hoverable={themeObject.type !== value}
							key={themeObject.type}
							onClick={() => {
								onChange(themeObject.type);
							}}
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
