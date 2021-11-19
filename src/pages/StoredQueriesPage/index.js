import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Overlay from '../../components/Overlay';
import Banner from '../../batteries/components/shared/UpgradePlan/Banner';
import StoredQueries from '../../components/StoredQueries';
import VersionController from '../../batteries/components/shared/VersionController';

const bannerMessagesStoredQueries = {
	free: {
		title: 'Stored Queries',
		description:
			'GUI to manage your stored queries. Use them as direct REST APIs or with ReactiveSearch API.',
		buttonText: 'Read Docs',
		icon: 'info-circle',
		href: 'https://docs.appbase.io/docs/data/stored-queries/',
	},
};
const StoredQueriesView = ({ isPaidUser }) => {
	return (
		<React.Fragment>
			{isPaidUser ? (
				<VersionController version="7.49.0">
					<StoredQueries />
				</VersionController>
			) : (
				<React.Fragment>
					<Banner {...bannerMessagesStoredQueries.free} />
					<Overlay
						style={{
							maxWidth: '70%',
						}}
						src="https://i.imgur.com/t87c3bp.png"
						alt="Stored Queries"
					/>
				</React.Fragment>
			)}
		</React.Fragment>
	);
};
StoredQueriesView.propTypes = {
	isPaidUser: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	isPaidUser: get(state, '$getAppPlan.results.isPaid'),
});

export default connect(mapStateToProps)(StoredQueriesView);
