import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SearchBox } from '@appbaseio/reactivesearch';
import { css } from 'react-emotion';
import { SearchOutlined } from '@ant-design/icons';
import get from 'lodash/get';
import createDOMPurify from 'dompurify';
import { getSettings as getSearchSettings } from '../../batteries/modules/actions';
import { withErrorToaster } from '../../batteries/components/shared/ErrorToaster/ErrorToaster';

const DOMPurify = createDOMPurify(window);
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

	componentDidMount() {
		const { app, getSettingsAction, avoidApi } = this.props;
		if (app && !avoidApi) {
			getSettingsAction(app);
		}
	}

	componentDidUpdate(prevProps) {
		const { app, getSettingsAction } = this.props;
		if (app !== prevProps.app) {
			getSettingsAction(app);
		}
	}

	handleSearchValueChange = (searchValue) => {
		this.setState({
			searchValue,
		});
	};

	render() {
		const { className, dataFields, onValueSelected, subprops, dataFieldSettings } = this.props;
		const { searchValue } = this.state;
		const isFieldDefined = Array.isArray(dataFieldSettings) && dataFieldSettings.length;
		const isFieldWeightDefined =
			subprops &&
			subprops.fieldWeights &&
			Array.isArray(subprops.fieldWeights) &&
			subprops.length;
		const fieldWithWeights = isFieldDefined
			? dataFields.map((field, i) => ({
					field,
					weight: isFieldWeightDefined ? subprops.fieldWeights[i] : 1,
			  }))
			: null;

		return (
			<div className={inputBox} style={{ position: 'relative' }}>
				<SearchBox
					componentId="GlobalSearch"
					innerClass={{
						input: `ant-input ${css`
							padding-left: 35px !important;
							background: #fff !important;
							margin-bottom: 0 !important;
							height: 34px !important;
						`} ${className}`,
						list: css`
							top: 42px !important;
							font-size: 0.8rem !important;
							border-radius: 5px !important;
							max-height: 420px !important;
						`,
					}}
					debounce={50}
					showIcon={false}
					showDistinctSuggestions
					onChange={this.handleSearchValueChange}
					value={searchValue}
					onValueSelected={(value, cause, source) => {
						if (source) {
							onValueSelected(value, cause, source);
						}
						this.handleSearchValueChange('');
					}}
					{...subprops}
					// Prioritize the data fields from search settings
					dataField={isFieldDefined ? undefined : fieldWithWeights}
					render={({ rawData, downshiftProps }) => {
						const suggestionsArr = rawData?.hits?.hits;
						if (suggestionsArr && suggestionsArr?.length && downshiftProps.isOpen) {
							return (
								<div
									style={{
										position: 'absolute',
										color: '#424242',
										fontSize: '0.9rem',
										border: '1px solid #ddd',
										background: 'white',
										borderRadius: 2,
										marginTop: 0,
										width: '100%',
										overflowY: 'scroll',
										zIndex: 10,
										maxHeight: '100vh',
										boxShadow: '0 2px 4px #d9d9d9',
									}}
								>
									{suggestionsArr.map(
										(suggestion, index) =>
											suggestion.label && (
												<div
													style={{
														padding: 10,
														fontSize: '0.8rem',
														background:
															index ===
															downshiftProps.highlightedIndex
																? '#eee'
																: 'transparent',
													}}
													key={`${suggestion._id}-${index}`} // eslint-disable-line react/no-array-index-key
													onClick={() => {
														onValueSelected(
															suggestion.value,
															'SUGGESTION_SELECT',
															suggestion,
														);
														this.handleSearchValueChange('');
													}}
												>
													<div
														{...downshiftProps.getItemProps({
															item: suggestion,
														})}
														// eslint-disable-next-line
														dangerouslySetInnerHTML={{
															__html: DOMPurify.sanitize(
																suggestion.label,
															),
														}}
													/>
												</div>
											),
									)}
								</div>
							);
						}
						return null;
					}}
				/>
				<SearchOutlined
					className="search-icon"
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
	dataFieldSettings: PropTypes.array.isRequired,
	subprops: PropTypes.object,
	avoidApi: PropTypes.bool,
};

const noop = () => {};
GlobalSearch.defaultProps = {
	className: '',
	onKeyDown: noop,
	onValueSelected: noop,
	subprops: {},
	avoidApi: false,
	app: '',
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

const GlobalSearchWrapper = withErrorToaster(
	connect(mapStateToProps, mapDispatchToProps)(GlobalSearch),
);

export default React.forwardRef((props, ref) => <GlobalSearchWrapper innerRef={ref} {...props} />);
