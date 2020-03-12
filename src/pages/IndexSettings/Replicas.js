import React from 'react';
import { Card, Button, Slider, Modal } from 'antd';
import { cardTitle } from '../../batteries/components/Mappings/styles';

const Replicas = ({
	replicas,
	totalNodes,
	allocated_replicas,
	updateReplicas,
	handleSlider,
	replicasModal,
	handleModal,
}) => (
	<React.Fragment>
		<Card
			hoverable
			title={
				<div className={cardTitle}>
					<div>
						<h4>Manage Replicas</h4>
						<p>Configure the number of replicas for your app.</p>
					</div>
					<Button onClick={() => handleModal('replicasModal')} type="primary">
						Change Replicas
					</Button>
				</div>
			}
			style={{ marginTop: 16 }}
			bodyStyle={{ padding: 0 }}
		/>

		<Modal
			visible={replicasModal}
			onOk={updateReplicas}
			title="Configure Replicas"
			okText="Update"
			okButtonProps={{
				disabled: allocated_replicas === +replicas,
			}}
			onCancel={() => handleModal('replicasModal')}
		>
			<h4>Move slider to change the number of replicas for your app.</h4>
			<Slider
				step={1}
				marks={{ 0: '0', 1: '1', 2: '2' }}
				max={totalNodes}
				value={+replicas}
				onChange={value => handleSlider('replicas', value)}
			/>
		</Modal>
	</React.Fragment>
);

export default Replicas;
