import React, { useEffect } from 'react';
import { Button, Card, notification, Tooltip, Icon } from 'antd';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { displayErrors } from '../../utils/helper';
import { evictCache } from '../../batteries/modules/actions';
import usePrevious from '../../batteries/hooks/usePrevious';

const EvictCache = ({ isLoading, errors, handleEvictCache }) => {
	const prevErrors = usePrevious(errors);
	useEffect(() => {
		displayErrors(errors, prevErrors, true);
	}, errors);
	const onEvictCache = () => {
		try {
			handleEvictCache().then((action) => {
				if (get(action, 'payload')) {
					notification.success({
						message: 'Deleted cached requests successfully.',
					});
				}
			});
		} catch (e) {
			notification.error({
				message: e.message,
			});
		}
	};
	return (
		<Card
			style={{
				padding: '0 50px',
			}}
			bodyStyle={{
				display: 'flex',
				justifyContent: 'space-between',
				padding: '15px 0',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					flex: 1,
					flexDirection: 'column',
				}}
			>
				<h3>
					Evict cache contents{' '}
					<Tooltip
						css="margin-left: 5px;color:#898989"
						overlay="Evict Cache action allows you to delete the cached requests immediately to free up the memory."
						placement="rightTop"
					>
						<Icon type="info-circle" theme="outlined" />
					</Tooltip>
				</h3>
			</div>

			<Button onClick={onEvictCache} loading={isLoading} type="primary">
				Evict Cache
			</Button>
		</Card>
	);
};

EvictCache.propTypes = {
	handleEvictCache: PropTypes.func.isRequired,
	isLoading: PropTypes.bool.isRequired,
	errors: PropTypes.array.isRequired,
};

const mapStateToProps = (state) => ({
	isLoading: get(state, '$evictCache.isFetching', false),
	errors: [get(state, '$evictCache.error')],
});

const mapDispatchToProps = (dispatch) => ({
	handleEvictCache: () => dispatch(evictCache()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EvictCache);
