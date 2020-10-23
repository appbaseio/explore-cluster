/**
 * conditions in which mapping change should be called
 * 1. enable / disable ngrams should re-index with/without .search field
 * 2. change in number of searchable fields, because this could change the mapping
 * 3. language change
 *
 * conditions in which setting change should be called
 * 1. enable / disable diacricts should add / remove `asciifolding` filter from analyzer filters
 * 2. language change with stop words / stemming exceptions
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Modal } from 'antd';
import get from 'lodash/get';
import { diff } from 'jsondiffpatch';
import styled from 'react-emotion';

import DiffList from './DiffList';

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

	const diffCount = topLevelFields.reduce((agg, item) => {
		const data = diffData[item];
		const count =
			agg +
			Object.keys(data).reduce((sum, i) => {
				return i === 'highlightOptions' ? sum + Object.keys(data[i]).length : sum + 1;
			}, 0);

		return count;
	}, 0);

	return [diffCount, diffData];
};

class ReviewAndSave extends React.Component {
	state = {
		isOpen: false,
		resetting: false,
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
		const { isOpen, resetting } = this.state;
		const { defaultSettings, settings, localRelevancy, appName } = this.props;
		const [diffCount, diffData] = resetting
			? getDiffData(settings, defaultSettings)
			: getDiffData(settings, get(localRelevancy, `${appName}`));

		console.log('here....', settings, localRelevancy);

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
						disabled={!diffCount}
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
					width={1000}
					style={{
						top: 20,
					}}
					onCancel={this.handleCancel}
				>
					{isOpen && <DiffList diff={diffData} />}
				</Modal>
			</>
		);
	}
}

ReviewAndSave.propTypes = {
	localRelevancy: PropTypes.object.isRequired,
	settings: PropTypes.object.isRequired,
	defaultSettings: PropTypes.object,
	appName: PropTypes.string.isRequired,
};

ReviewAndSave.defaultProps = {
	defaultSettings: {},
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy`);
	const defaultSettings = get(state, `$getAppSettings.defaultSettings`);
	const settings = get(state, ['$getAppSettings', 'settings', appName], defaultSettings);
	return {
		appName,
		localRelevancy,
		settings,
		defaultSettings,
	};
};

export default connect(mapStateToProps)(ReviewAndSave);
