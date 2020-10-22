import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal } from 'antd';
import get from 'lodash/get';
import { diff } from 'jsondiffpatch';
import styled from 'react-emotion';

const Badge = styled.span`
	background: #f5222d;
	color: #fff;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	top: -10px;
	right: 0px;
	height: 25px;
	width: 25px;
	border-radius: 50%;
	z-index: 100;
`;

class ReviewAndSave extends React.Component {
	state = {
		isOpen: false,
		diffCount: 0,
		diffState: {},
	};

	componentDidMount() {
		// calculate the diff
		this.updateDiff();
	}

	componentDidUpdate(prevProps) {
		const { localRelevancy } = this.props;
		if (JSON.stringify(localRelevancy) !== JSON.stringify(prevProps.localRelevancy)) {
			this.updateDiff();
		}
	}

	updateDiff = () => {
		const { settings, localRelevancy } = this.props;
		const diffData = diff(settings, localRelevancy);
		if (diffData) {
			const topLevelFields = Object.keys(diffData);

			const counter = topLevelFields.reduce((agg, item) => {
				const data = diffData[item];
				const count =
					agg +
					Object.keys(data).reduce((sum, i) => {
						return i === 'highlightOptions'
							? sum + Object.keys(data[i]).length
							: sum + 1;
					}, 0);

				return count;
			}, 0);
			this.setState({ diffCount: counter, diffState: diffData });
		} else {
			this.setState({ diffCount: 0, diffState: {} });
		}
	};

	showModal = () => {
		this.setState({
			isOpen: true,
		});
	};

	handleCancel = () => {
		this.setState({
			isOpen: false,
		});
	};

	render() {
		const { diffCount, isOpen, diffState } = this.state;

		return (
			<div style={{ position: 'relative' }}>
				{diffCount > 0 && <Badge>{diffCount}</Badge>}
				<Button
					style={{ marginRight: 10 }}
					size="large"
					type="primary"
					disabled={!diffCount}
					onClick={this.showModal}
				>
					Reive and Deploy
				</Button>
				<Modal
					visible={isOpen}
					title="Review Settings Before Deploying"
					onOk={() => {}}
					onCancel={this.handleCancel}
				>
					{' '}
					{JSON.stringify(diffState)}
				</Modal>
			</div>
		);
	}
}

ReviewAndSave.propTypes = {
	localRelevancy: PropTypes.object.isRequired,
	settings: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`);
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	const settings = get(state, ['$getAppSettings', 'settings', appName], defaultSettings);
	return {
		localRelevancy,
		settings,
	};
};

export default connect(mapStateToProps)(ReviewAndSave);
