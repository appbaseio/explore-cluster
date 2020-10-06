import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import get from 'lodash/get';
import { connect } from 'react-redux';
import SearchPreviewModal from '../SearchPreviewModal';
import CloneIndex from '../CloneIndex';

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
		const {
			loading,
			resetState,
			onReset,
			reviewAndSave = () => {},
			showSearchPreview,
			searchPreviewModalProps,
			app,
			showCopySettings,
			showReset,
			collapsed,
		} = this.props;

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
						{app && showSearchPreview ? (
							<SearchPreviewModal {...searchPreviewModalProps} app={app} />
						) : null}
						{app && showCopySettings ? (
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
										index={app}
									/>
								) : null}
							</React.Fragment>
						) : null}
					</div>
					<div>
						{showReset && (
							<Button
								onClick={onReset}
								style={{ marginRight: 10 }}
								size="large"
								loading={resetState.loading}
								disabled={loading}
							>
								Reset To Default Settings
							</Button>
						)}
						{reviewAndSave()}
					</div>
				</div>
			</div>
		);
	}
}

SettingsFooter.propTypes = {
	searchPreviewModalProps: PropTypes.object,
	loading: PropTypes.bool,
	resetState: PropTypes.object,
	onReset: PropTypes.func.isRequired,
	reviewAndSave: PropTypes.func,
	showSearchPreview: PropTypes.bool,
	app: PropTypes.string,
	showReset: PropTypes.bool,
	showCopySettings: PropTypes.bool,
	collapsed: PropTypes.bool.isRequired,
};

SettingsFooter.defaultProps = {
	searchPreviewModalProps: {},
	loading: false,
	resetState: {},
	reviewAndSave: () => {},
	showSearchPreview: false,
	app: undefined,
	showReset: true,
	showCopySettings: false,
};

const mapStateToProps = (state) => ({
	collapsed: get(state, 'sideBarCollapsed'),
});

export default connect(mapStateToProps)(SettingsFooter);
