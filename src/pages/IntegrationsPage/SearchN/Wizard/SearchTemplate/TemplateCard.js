import React, { useEffect, useState } from 'react';
import { EyeTwoTone } from '@ant-design/icons';
import { Card, Modal } from 'antd';
import { func, object, string } from 'prop-types';
import Preview from './Preview';
import { modalStyles } from '../../../PreviewModal';

const { Meta } = Card;

const TemplateCard = ({ template, selectedTemplate, setSelectedTemplate }) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (selectedTemplate === template.name) setSelectedTemplate(template.name);
	}, []);

	const handleCancel = () => {
		setVisible(false);
	};

	return (
		<div>
			<Card
				hoverable
				style={{ width: 240 }}
				className={selectedTemplate === template.name ? 'card-border' : ''}
				cover={
					<img
						style={{ width: 238, height: 280 }}
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
				<Meta
					title={
						<div className="meta-title">
							<>{template.label}</> <EyeTwoTone onClick={() => setVisible(true)} />
						</div>
					}
					description={<div dangerouslySetInnerHTML={{ __html: template.description }} />}
				/>
			</Card>
			<Modal
				title="Preview"
				open={visible}
				className={modalStyles}
				onCancel={handleCancel}
				footer={null}
				width="100%"
			>
				<Preview theme={selectedTemplate} />
			</Modal>
		</div>
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
