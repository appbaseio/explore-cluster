/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Card, Button, InputNumber, Alert } from 'antd';
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
						<p>Configure the number of shards for your index.</p>
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
				Update value to change the number of shards for your index. Read more{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/relevancy/#index-settings"
				>
					here
				</a>
				.
			</h4>
			{+allocated_shards !== +shards ? (
				<Alert
					type="warning"
					style={{ marginBottom: 10 }}
					description="Re-indexing is required for applying shards changes."
				/>
			) : null}
			<InputNumber
				max={100}
				min={1}
				value={+shards}
				onChange={(value) => handleSlider('shards', value)}
			/>
		</Modal>
	</React.Fragment>
);

Shards.propTypes = {
	shards: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	allocated_shards: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	updateShards: PropTypes.func.isRequired,
	shardsModal: PropTypes.bool,
	handleModal: PropTypes.func.isRequired,
	handleSlider: PropTypes.func.isRequired,
};

Shards.defaultProps = {
	shardsModal: false,
	shards: null,
	allocated_shards: null,
};

export default Shards;
