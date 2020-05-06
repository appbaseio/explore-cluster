/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Slider, Modal, Alert, Icon } from 'antd';
import { cardTitle } from '../../batteries/components/Mappings/styles';

const Replicas = ({
	replicas,
	totalNodes,
	allocated_replicas,
	updateReplicas,
	handleSlider,
	replicasModal,
	handleModal,
	loading,
}) => (
	<React.Fragment>
		<Card
			hoverable
			title={
				<div className={cardTitle}>
					<div>
						<h4>Manage Replicas</h4>
						<p>Configure the number of replicas for your index.</p>
					</div>
					<Button
						disabled={loading}
						onClick={() => handleModal('replicasModal')}
						type="primary"
					>
						{loading ? <Icon type="loading" /> : null}
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
			<h4>Move slider to change the number of replicas for your index.</h4>
			{totalNodes - 1 > 0 || +allocated_replicas > totalNodes - 1 ? (
				<Slider
					step={1}
					marks={{ 0: '0', 1: '1', 2: '2' }}
					max={
						+allocated_replicas > totalNodes - 1 ? +allocated_replicas : totalNodes - 1
					}
					value={+replicas}
					onChange={(value) => handleSlider('replicas', value)}
				/>
			) : (
				<Alert message="Cannot add any replicas to the index as you are running a single-node instance." />
			)}
		</Modal>
	</React.Fragment>
);

Replicas.propTypes = {
	replicas: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	totalNodes: PropTypes.number,
	allocated_replicas: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	updateReplicas: PropTypes.func.isRequired,
	handleSlider: PropTypes.func.isRequired,
	replicasModal: PropTypes.bool,
	handleModal: PropTypes.func.isRequired,
	loading: PropTypes.bool,
};

Replicas.defaultProps = {
	replicasModal: false,
	loading: false,
	replicas: null,
	totalNodes: undefined,
	allocated_replicas: null,
};

export default Replicas;
