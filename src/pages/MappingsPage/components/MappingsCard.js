import React from 'react';
import { Card, Tooltip, Icon, Button } from 'antd';
import PropTypes from 'prop-types';
import { cardTitle } from './styles';
import NewField from './NewField';

const MappingsCard = ({ getMappings, setMapping, usecase, children }) => {
	return (
		<Card
			title={
				<div className={cardTitle}>
					<h4>Manage Mappings</h4>
					<p>Add new fields or change the types of existing ones.</p>
				</div>
			}
			extra={
				<React.Fragment>
					<Tooltip title="Fetch latest Mappings">
						<Button
							ghost
							style={{ marginRight: 8, color: '#1890ff' }}
							onClick={getMappings}
						>
							<Icon type="reload" />
							Reload Mappings
						</Button>
					</Tooltip>
					<NewField onAddField={setMapping} fields={Object.keys(usecase || {})} />
				</React.Fragment>
			}
		>
			{children}
		</Card>
	);
};

MappingsCard.defaultProps = {
	usecase: {},
};

MappingsCard.propTypes = {
	usecase: PropTypes.object,
	getMappings: PropTypes.func.isRequired,
	setMapping: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default MappingsCard;
