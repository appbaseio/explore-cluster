import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DataSearch } from '@appbaseio/reactivesearch';
import { css } from 'react-emotion';
import { Icon } from 'antd';
import get from 'lodash/get';
import { getSettings as getSearchSettings } from '../../batteries/modules/actions';

const inputBox = css`
	&:hover,
	&:focus {
		.search-icon {
			color: rgba(0, 0, 0, 0.85);
		}
	}
`;

class GlobalSearch extends PureComponent {
	state = {
		searchValue: '',
	};

	handleSearchValueChange = (searchValue) => {
		this.setState({
			searchValue,
		});
	};

	componentDidMount() {
		const { app, getSettingsAction } = this.props;
		if (app) {
			getSettingsAction(app);
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.app != prevProps.app) {
			const { app, getSettingsAction } = this.props;
			getSettingsAction(app);
		}
	}

	render() {
		const {
			className,
			dataFields,
			onKeyDown,
			onValueSelected,
			subprops,
			dataFieldSettings,
		} = this.props;
		const { searchValue } = this.state;
		const isFieldDefined = Array.isArray(dataFieldSettings) && dataFieldSettings.length;
		return (
			<div className={inputBox} css={{ position: 'relative' }}>
				<DataSearch
					componentId="GlobalSearch"
					innerClass={{
						input: `ant-input ${css`
							padding-left: 35px !important;
							background: #fff !important;
							margin-bottom: 0 !important;
							height: 34px !important;
						`} ${className}`,
						list: css`
							top: 34px !important;
							font-size: 0.8rem !important;
							border-radius: 5px !important;
							max-height: 420px !important;
						`,
					}}
					debounce={5}
					showIcon={false}
					showDistinctSuggestions
					onChange={this.handleSearchValueChange}
					value={searchValue}
					onKeyDown={onKeyDown}
					onValueSelected={onValueSelected}
					{...subprops}
					// Prioritize the data fields from search settings
					dataField={isFieldDefined ? undefined : dataFields}
					fieldWeights={isFieldDefined ? undefined : subprops.fieldWeights}
				/>
				<Icon
					className="search-icon"
					type="search"
					css={{
						position: 'absolute',
						top: '50%',
						transform: 'translateY(-50%)',
						left: '10px',
						color: 'rgba(0, 0, 0, 0.45)',
					}}
				/>
			</div>
		);
	}
}

GlobalSearch.propTypes = {
	className: PropTypes.string,
	dataFields: PropTypes.array.isRequired,
	onKeyDown: PropTypes.func,
	onValueSelected: PropTypes.func,
	getSettingsAction: PropTypes.func.isRequired,
	app: PropTypes.string,
	dataFieldSettings: PropTypes.array,
	subprops: PropTypes.object,
};

const noop = () => {};
GlobalSearch.defaultProps = {
	className: '',
	onKeyDown: noop,
	onValueSelected: noop,
	subprops: {},
};

const mapStateToProps = (state, props) => ({
	dataFieldSettings: get(state, [
		'$getAppSettings',
		'settings',
		props.app,
		'search',
		'dataField',
	]),
});

const mapDispatchToProps = (dispatch) => ({
	getSettingsAction: (name) => dispatch(getSearchSettings(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(GlobalSearch);
