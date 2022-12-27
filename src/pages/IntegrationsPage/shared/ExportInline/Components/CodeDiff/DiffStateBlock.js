import React from 'react';
import { css } from 'emotion';
import PropTypes from 'prop-types';
import Flex from '../../../../../../batteries/components/shared/Flex';

const diffStatStyles = css`
	.block-added {
		width: 8px;
		height: 8px;
		margin-left: 1px;
	}
	.outline {
		border: 1px solid rgba(27, 31, 36, 0.15);
	}
	.diffstat-block-added {
		background-color: #2da44e;
	}
	.diffstat-block-removed {
		background-color: #cf222e;
	}
	.added-color {
		color: #2da44e;
	}
	.removed-color {
		color: #cf222e;
	}
`;

const DiffStatBlock = ({ changedDetails }) => {
	const { added, removed } = changedDetails;

	const getStyles = () => {
		if (added && removed) {
			if (added > removed)
				return [
					'diffstat-block-added',
					'diffstat-block-added',
					'diffstat-block-added',
					'diffstat-block-removed',
				];
			if (removed > added)
				return [
					'diffstat-block-added',
					'diffstat-block-removed',
					'diffstat-block-removed',
					'diffstat-block-removed',
				];
			return [
				'diffstat-block-added',
				'diffstat-block-added',
				'diffstat-block-removed',
				'diffstat-block-removed',
			];
		}
		if (!added && removed) {
			return [
				'diffstat-block-removed',
				'diffstat-block-removed',
				'diffstat-block-removed',
				'diffstat-block-removed',
			];
		}
		if (!removed && added) {
			return [
				'diffstat-block-added',
				'diffstat-block-added',
				'diffstat-block-added',
				'diffstat-block-added',
			];
		}

		return ['', '', '', ''];
	};

	const blockStyles = getStyles();
	return (
		<Flex alignItems="center" className={diffStatStyles}>
			<Flex>
				{added ? <span className="added-color">+{added}&nbsp;</span> : <></>}
				{removed ? <span className="removed-color">-{removed}&nbsp;</span> : <></>}
			</Flex>
			<Flex>
				<div className={`block-added outline ${blockStyles[0]}`} />
				<div className={`block-added outline ${blockStyles[1]}`} />
				<div className={`block-added outline ${blockStyles[2]}`} />
				<div className={`block-added outline ${blockStyles[3]}`} />
			</Flex>
		</Flex>
	);
};

DiffStatBlock.propTypes = {
	changedDetails: PropTypes.object,
};

DiffStatBlock.defaultProps = {
	changedDetails: {},
};

export default DiffStatBlock;
