import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'antd';
import { FieldControl, FieldGroup } from 'react-reactive-form';
import Grid from './Grid';
import Flex from '../../batteries/components/shared/Flex';
import InputElement from '../InputElement';

// Custom rs api restrictions tabular view
class RsApiRestrictions extends React.PureComponent {
	render() {
		const { control, Messages } = this.props;
		const labels = {
			MAX_QUERY_SIZE: 'Max Query Size',
			MAX_AGGREGATION_SIZE: 'Max Aggregations Size',
			ALLOW_DIRECT_DSL: 'Allow Direct DSL Queries',
		};
		return (
			<FieldGroup
				strict={false}
				control={control}
				render={({ controls }) => {
					return (
						<Flex css="margin: 0 4rem" flexDirection="column">
							<InputElement
								name="maxQuerySize"
								label={labels.MAX_QUERY_SIZE}
								toolTipMessage={Messages.maxQuerySize}
								gridRatio={0.7}
								inputProps={{
									placeholder: 'No Limit',
								}}
							/>
							<InputElement
								name="maxAggregationSize"
								label={labels.MAX_AGGREGATION_SIZE}
								toolTipMessage={Messages.maxAggregationSize}
								gridRatio={0.7}
								inputProps={{
									placeholder: 'No Limit',
								}}
							/>

							<Grid
								label="Allow Direct DSL Queries"
								toolTipMessage={Messages.allowDirectDSL}
								gridRatio={0.7}
								component={
									<FieldControl
										control={controls.allowDirectDSL}
										render={({ handler }) => (
											<Switch {...handler('checkbox')} />
										)}
									/>
								}
							/>
						</Flex>
					);
				}}
			/>
		);
	}
}

RsApiRestrictions.defaultProps = {
	Messages: {},
};

RsApiRestrictions.propTypes = {
	control: PropTypes.object.isRequired,
	Messages: PropTypes.object,
};

export default RsApiRestrictions;
