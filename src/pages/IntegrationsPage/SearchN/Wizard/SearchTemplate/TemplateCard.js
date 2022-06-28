import React, { useEffect } from 'react';
import { Card } from 'antd';
import { func, object, string } from 'prop-types';

const { Meta } = Card;

const TemplateCard = ({ template, selectedTemplate, setSelectedTemplate }) => {
	useEffect(() => {
		if (selectedTemplate === template.name) setSelectedTemplate(template.name);
	}, []);

	return (
		<Card
			hoverable
			style={{ width: 240 }}
			className={selectedTemplate === template.name ? 'card-border' : ''}
			cover={
				<img
					alt={template.name}
					src={
						template.image ||
						'https://banksiafdn.com/wp-content/uploads/2019/10/placeholde-image.jpg'
					}
					onError={(event) => {
						// eslint-disable-next-line
						event.target.src =
							'https://banksiafdn.com/wp-content/uploads/2019/10/placeholde-image.jpg'; // eslint-disable-line
					}}
				/>
			}
			onClick={() => {
				setSelectedTemplate(template.name);
			}}
		>
			<Meta title={template.name} description={template.description} />
		</Card>
	);
};

TemplateCard.defaultProps = {
	template: {},
	selectedTemplate: '',
	setSelectedTemplate: () => {},
};

TemplateCard.propTypes = {
	template: object,
	selectedTemplate: string,
	setSelectedTemplate: func,
};

export default TemplateCard;
