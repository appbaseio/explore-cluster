import React from 'react';
import { Card, Tooltip, Icon, Button } from 'antd';
import PropTypes from 'prop-types';
import { cardTitle } from './styles';
import NewField from './NewField';
import HeaderRow from './HeaderRow';
import { VIEWS } from '../../../constants/props';

const MappingsCard = ({
	getMappings,
	setMapping,
	usecase,
	children,
	hideCardTitle,
	cardProps,
	headerRowProps,
	view,
}) => {
	return (
		<Card
			title={
				hideCardTitle ? null : (
					<div className={cardTitle}>
						<h4>Manage Mappings</h4>
						<p>Add new fields or change the types of existing ones.</p>
					</div>
				)
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
					{!view === VIEWS.SCHEMA ? (
						<NewField onAddField={setMapping} fields={Object.keys(usecase || {})} />
					) : null}
				</React.Fragment>
			}
			{...cardProps}
		>
			<HeaderRow {...headerRowProps} />
			{children}
		</Card>
	);
};

MappingsCard.defaultProps = {
	cardProps: {},
	hideCardTitle: false,
	headerRowProps: {},
	usecase: {},
	view: VIEWS.SCHEMA,
};

MappingsCard.propTypes = {
	usecase: PropTypes.object,
	hideCardTitle: PropTypes.bool,
	getMappings: PropTypes.func.isRequired,
	setMapping: PropTypes.func.isRequired,
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
	cardProps: PropTypes.object,
	headerRowProps: PropTypes.object,
	view: PropTypes.string,
};

export default MappingsCard;
