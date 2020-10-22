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

const getDiffData = (oldObj, newObj) => {
	const diffData = diff(oldObj, newObj);
	if (!diffData) {
		return [0, {}];
	}
	const topLevelFields = Object.keys(diffData);

	const counter = topLevelFields.reduce((agg, item) => {
		const data = diffData[item];
		const count =
			agg +
			Object.keys(data).reduce((sum, i) => {
				return i === 'highlightOptions' ? sum + Object.keys(data[i]).length : sum + 1;
			}, 0);

		return count;
	}, 0);

	return [counter, diffData];
};

class ReviewAndSave extends React.Component {
	state = {
		isOpen: false,
		diffCount: 0,
		diffState: {},
		resetting: false,
	};

	componentDidMount() {
		// calculate the diff
		const { localRelevancy } = this.props;
		this.updateDiff(localRelevancy);
	}

	componentDidUpdate(prevProps) {
		const { localRelevancy } = this.props;
		if (JSON.stringify(localRelevancy) !== JSON.stringify(prevProps.localRelevancy)) {
			this.updateDiff(localRelevancy);
		}
	}

	updateDiff = () => {
		const { settings, localRelevancy } = this.props;
		const [counter, diffData] = getDiffData(settings, localRelevancy);
		this.setState({ diffCount: counter, diffState: diffData });
	};

	showModal = () => {
		this.setState({
			isOpen: true,
		});
	};

	handleCancel = () => {
		this.setState(
			{
				isOpen: false,
			},
			() => {
				this.setState({ resetting: false });
			},
		);
	};

	onResetToDefault = () => {
		this.setState({ resetting: true }, () => {
			this.setState({
				isOpen: true,
			});
		});
	};

	render() {
		const { diffCount, isOpen, diffState, resetting } = this.state;
		const { defaultSettings } = this.props;

		return (
			<>
				<div style={{ display: 'flex', alignItems: 'center' }}>
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
					</div>
					<Button
						style={{ marginRight: 10 }}
						size="large"
						onClick={this.onResetToDefault}
					>
						Reset To Default Settings
					</Button>
				</div>
				<Modal
					visible={isOpen}
					title={
						resetting ? 'Reset To Default Settings' : 'Review Settings Before Deploying'
					}
					onOk={() => {}}
					onCancel={this.handleCancel}
				>
					{JSON.stringify(defaultSettings)}
					{JSON.stringify(diffState)}
				</Modal>
			</>
		);
	}
}

ReviewAndSave.propTypes = {
	localRelevancy: PropTypes.object.isRequired,
	settings: PropTypes.object.isRequired,
	defaultSettings: PropTypes.object,
};

ReviewAndSave.defaultProps = {
	defaultSettings: {},
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy.${appName}`);
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	console.log(defaultSettings);
	const settings = get(state, ['$getAppSettings', 'settings', appName], defaultSettings);
	return {
		localRelevancy,
		settings,
		defaultSettings,
	};
};

export default connect(mapStateToProps)(ReviewAndSave);
