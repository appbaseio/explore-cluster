import React from 'react';
import { Slider, Modal, Card, Button, InputNumber } from 'antd';
import { cardTitle } from '../../batteries/components/Mappings/styles';

const Shards = ({
	shards,
	allocated_shards,
	updateShards,
	shardsModal,
	handleModal,
	handleSlider,
}) => (
	<React.Fragment>
		<Card
			hoverable
			title={
				<div className={cardTitle}>
					<div>
						<h4>Manage Shards</h4>
						<p>Configure the number of shards for your app.</p>
					</div>
					<Button onClick={() => handleModal('shardsModal')} type="primary">
						Change Shards
					</Button>
				</div>
			}
			bodyStyle={{ padding: 0 }}
		/>
		<Modal
			visible={shardsModal}
			onOk={updateShards}
			title="Configure Shards"
			okText="Update"
			okButtonProps={{ disabled: +allocated_shards === +shards }}
			onCancel={() => handleModal('shardsModal')}
		>
			<h4>
				Update value to change the number of shards for your app. Read more{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Mappings/#manage-shards"
				>
					here
				</a>
				.
			</h4>
			<InputNumber
				max={100}
				min={1}
				value={+shards}
				onChange={value => handleSlider('shards', value)}
			/>
		</Modal>
	</React.Fragment>
);

export default Shards;
