import React from 'react';
import { Card, Icon, Button, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import { MultiList } from '@appbaseio/reactivesearch';
import { settingsMap } from '../../../components/ReviewAndSave/helper';

const Filter = (props) => {
	const { app, aggs } = props;
	return (
		<React.Fragment>
			{aggs.map((agg) => (
				<Card key={agg.dataField}>
					<MultiList
						{...agg}
						title={get(agg, 'dataField[0]', '').replace('.keyword', '')}
						renderNoResults={() =>
							`No Data Found for ${get(agg, 'dataField[0]', '').replace(
								'.keyword',
								'',
							)}`
						}
						componentId={agg.id}
						loader="Loading Items"
					/>
				</Card>
			))}

			<Link to={`/app/${app}/aggs`}>
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

export default Filter;
