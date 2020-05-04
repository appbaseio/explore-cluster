import PropTypes from 'prop-types';
import { values } from 'lodash';
import { ARC_PLANS, CLUSTER_PLANS } from '../batteries/utils';

export const allowedTiers = PropTypes.oneOf([...values(ARC_PLANS), ...values(CLUSTER_PLANS)]);
export const children = PropTypes.oneOfType([
	PropTypes.arrayOf(PropTypes.node),
	PropTypes.node,
	PropTypes.func,
]);
export const synonymTypes = PropTypes.oneOf(['one-way', 'equivalent']);
