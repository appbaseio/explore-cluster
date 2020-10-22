import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import SearchPreviewModal from '../SearchPreviewModal';
import CloneIndex from '../CloneIndex';
import ReviewAndSave from '../ReviewAndSave';

class SettingsFooter extends React.Component {
	state = {
		copySettingsModal: false,
	};

	toggleCopySettingsModal = () => {
		this.setState((state) => ({
			copySettingsModal: !state.copySettingsModal,
		}));
	};

	render() {
		const { appName, collapsed, localRelevancy } = this.props;
		const { copySettingsModal } = this.state;
		return (
			<div
				style={{
					position: 'fixed',
					overflow: 'hidden',
					bottom: 0,
					left: collapsed ? 80 : 260,
					right: 0,
				}}
			>
				<div
					className="flex space-between card-footer"
					style={{ paddingLeft: 50, paddingRight: 50 }}
				>
					<div>
						{Boolean(localRelevancy) && (
							<SearchPreviewModal
								app={appName}
								searchPreviewProps={{
									testSettings: get(localRelevancy, appName),
									hasTestSettings: true,
								}}
							/>
						)}
						<React.Fragment>
							<Button
								onClick={this.toggleCopySettingsModal}
								style={{ marginLeft: 10 }}
								size="large"
							>
								Copy Search Settings
							</Button>
							{copySettingsModal ? (
								<CloneIndex
									handleCancel={this.toggleCopySettingsModal}
									index={appName}
								/>
							) : null}
						</React.Fragment>
					</div>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<ReviewAndSave />
						<Button style={{ marginRight: 10 }} size="large">
							Reset To Default Settings
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

SettingsFooter.propTypes = {
	appName: PropTypes.string.isRequired,
	collapsed: PropTypes.bool.isRequired,
	localRelevancy: PropTypes.object,
};

SettingsFooter.defaultProps = {
	localRelevancy: null,
};

const mapStateToProps = (state) => {
	const appName = get(state, '$getCurrentApp.name');
	const localRelevancy = get(state, `$getLocalRelevancy`);
	const collapsed = get(state, 'sideBarCollapsed');
	return {
		appName,
		localRelevancy,
		collapsed,
	};
};
export default connect(mapStateToProps)(SettingsFooter);
