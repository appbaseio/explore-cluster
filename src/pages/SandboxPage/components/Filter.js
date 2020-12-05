import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Button, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import { MultiList } from '@appbaseio/reactivesearch';
import settingsMap from '../../../components/ReviewAndSave/helper';

const Filter = (props) => {
	const { app, aggs, handleValueChange, handleModal } = props;
	return (
		<React.Fragment>
			{aggs.map((agg) => (
				<Card
					key={agg.dataField}
					data-cy={`aggs-values-${get(agg, 'dataField[0]', '').replace('.keyword', '')}`}
				>
					<MultiList
						{...agg}
						title={get(agg, 'dataField[0]', '').replace('.keyword', '')}
						renderNoResults={() =>
							`No Data Found for ${get(agg, 'dataField[0]', '').replace(
								'.keyword',
								'',
							)}`
						}
						dataField={get(agg, 'dataField[0]')}
						onChange={(value) => handleValueChange(agg.id, value)}
						componentId={agg.id}
						loader="Loading Items"
					/>
				</Card>
			))}

			<Link
				onClick={window.location.pathname === `/app/${app}/aggs` ? handleModal : null}
				to={`/app/${app}/aggs`}
			>
				<Tooltip title={settingsMap.set_aggs.description}>
					<Button style={{ marginTop: 8 }} block type="primary">
						<Icon type="edit" />
						{settingsMap.set_aggs.title}
					</Button>
				</Tooltip>
			</Link>
		</React.Fragment>
	);
};

Filter.propTypes = {
	aggs: PropTypes.array,
	app: PropTypes.string.isRequired,
	handleValueChange: PropTypes.func,
	handleModal: PropTypes.func,
};

Filter.defaultProps = {
	aggs: [],
	handleValueChange: () => {},
	handleModal: () => {},
};

export default React.memo(Filter);
