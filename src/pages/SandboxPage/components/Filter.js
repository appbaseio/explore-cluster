import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Button, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import { MultiList, DynamicRangeSlider } from '@appbaseio/reactivesearch';
import settingsMap from '../../../components/ReviewAndSave/helper';

const Filter = (props) => {
	const { app, aggs, handleValueChange, handleModal, page } = props;

	const sentenceCase = (text) => {
		if (text) {
			return text.replace(/(?:_| |\b)(\w)/g, function ($1) {
				return $1.toUpperCase().replace('_', ' ');
			});
		}
		return text;
	};

	return (
		<React.Fragment>
			{aggs?.map((agg) => {
				let dataField = '';
				if (Array.isArray(agg.dataField)) {
					dataField = get(agg, 'dataField[0]', '');
				} else {
					dataField = get(agg, 'dataField', '');
				}
				return (
					<Card
						key={agg.dataField}
						data-cy={`aggs-values-${dataField.replace('.keyword', '')}`}
					>
						{agg.type === 'term' ? (
							<MultiList
								{...agg}
								title={sentenceCase(dataField.replace('.keyword', ''))}
								renderNoResults={() =>
									`No Data Found for ${dataField.replace('.keyword', '')}`
								}
								dataField={dataField}
								onChange={(value) => handleValueChange(agg.id, value)}
								componentId={agg.id}
								loader="Loading Items"
								filterLabel={sentenceCase(dataField.replace('.keyword', ''))}
							/>
						) : (
							<DynamicRangeSlider
								title={sentenceCase(dataField.replace('.keyword', ''))}
								renderNoResults={() =>
									`No Data Found for ${dataField.replace('.keyword', '')}`
								}
								onChange={(value) => handleValueChange(agg.id, value)}
								loader="Loading Items"
								componentId={agg.id}
								dataField={dataField}
								filterLabel={sentenceCase(dataField.replace('.keyword', ''))}
							/>
						)}
					</Card>
				);
			})}
			{
				page !== 'rules' && (
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
				)
			}
		</React.Fragment>
	);
};

Filter.propTypes = {
	aggs: PropTypes.array,
	app: PropTypes.string.isRequired,
	handleValueChange: PropTypes.func,
	handleModal: PropTypes.func,
	page: PropTypes.string,
};

Filter.defaultProps = {
	aggs: [],
	handleValueChange: () => {},
	handleModal: () => {},
	page: '',
};

export default React.memo(Filter);
