/* eslint-disable no-param-reassign */
import { Spin, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { bool, func, object } from 'prop-types';
import { connect } from 'react-redux';
import DNDWrapper from '../../../components/DNDWrapper';
import { getTimeDuration } from '../../../batteries/components/analytics/utils';
import { getAIFAQs, patchAIFAQ } from '../../../batteries/modules/actions/AI';
import FAQCard from './FAQCard';
import SaveAIFAQModal from './SaveAIFAQModal';

const normalizeData = (data) =>
	data?.map((i) => {
		const timeDuration = getTimeDuration(get(i, 'updated_at') * 1000);
		const updatedAt =
			timeDuration.time > 0
				? `${timeDuration.time} ${timeDuration.formattedUnit} ago`
				: 'some time ago';

		return {
			...i,
			updatedAt,
		};
	});

const AIFAQCards = ({
	isAIFAQsLoading,
	fetchAIFAQs,
	AIFAQs,
	isUpdatingAIFAQs,
	updateAIFAQOrder,
}) => {
	const [data, setData] = useState([]);
	const [editFAQ, setEditFAQ] = useState(null);

	useEffect(() => {
		fetchAIFAQs();
	}, []);

	useEffect(() => {
		if (!isAIFAQsLoading && !isUpdatingAIFAQs) setData(AIFAQs);
	}, [AIFAQs]);

	const onDragEnd = (result) => {
		const { draggableId, destination } = result;
		const finalDestinationIndex = destination ? destination.index : null;

		let adjustedDestinationIndex = finalDestinationIndex;
		if (finalDestinationIndex !== null) {
			const isFirstItem = finalDestinationIndex === data[0].order;
			const isLastItem = finalDestinationIndex === data[data.length - 1].order;

			// Adjust the destination index based on the extreme ends
			if (isFirstItem) {
				adjustedDestinationIndex -= 1; // Set a lower value for the first item
				adjustedDestinationIndex = Math.max(adjustedDestinationIndex, 1);
			} else if (isLastItem) {
				adjustedDestinationIndex += 1; // Set a lower value for the first item
			}
		}

		updateAIFAQOrder(draggableId, { order: adjustedDestinationIndex })
			.then((res) => {
				if (res?.error) {
					const errorMessage =
						res?.error?.actual?.message ??
						res?.error?.message ??
						'Oops! there was a problem re-ordering the FAQ';

					notification.error({
						message: 'Error',
						description: errorMessage,
					});
				} else {
					notification.success({
						message: 'Success',
						description: `FAQ re-ordered successfully from ${result.source.index} to ${adjustedDestinationIndex}`,
					});
				}
			})
			.catch(() => {
				notification.error({
					message: 'Error',
					description: 'Oops! there was a problem re-ordering the FAQ',
				});
			});
	};
	return (
		<>
			{' '}
			<div title={null} style={{ marginTop: '4rem' }}>
				<Spin spinning={isUpdatingAIFAQs || isAIFAQsLoading}>
					<DNDWrapper
						onDragEnd={onDragEnd}
						items={normalizeData(data) ?? []}
						dropId="FAQS"
						idKey="faq_id"
						indexKey="order"
					>
						{/* eslint-disable-next-line */}
						{({ item, dragProvided, dragSnapshot, index }) => (
							<FAQCard
								dragProvided={dragProvided}
								dragSnapshot={dragSnapshot}
								faq={item}
								onEdit={(dataParam) => setEditFAQ(dataParam)}
								key={item.faq_id}
							/>
						)}
					</DNDWrapper>
				</Spin>
			</div>
			<SaveAIFAQModal
				visible={!!editFAQ}
				record={editFAQ}
				onClose={() => setEditFAQ(null)}
				onSaveFAQ={() => setEditFAQ(null)}
				title="Edit FAQ"
			/>
		</>
	);
};

AIFAQCards.defaultProps = {};

AIFAQCards.propTypes = {
	fetchAIFAQs: func.isRequired,
	AIFAQs: object.isRequired,
	isAIFAQsLoading: bool.isRequired,
	isUpdatingAIFAQs: bool.isRequired,
	updateAIFAQOrder: func.isRequired,
};

const mapStateToProps = (state) => ({
	isAIFAQsLoading: get(state, '$getAIReducer.faqs.isFetching', false),
	isUpdatingAIFAQs: get(state, '$getAIReducer.faqs.isUpdating', false),
	AIFAQs: get(state, '$getAIReducer.faqs.data', null),
});

const mapDispatchToProps = (dispatch) => ({
	fetchAIFAQs: () => dispatch(getAIFAQs()),
	updateAIFAQOrder: (id, payload) => dispatch(patchAIFAQ(id, payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AIFAQCards);
