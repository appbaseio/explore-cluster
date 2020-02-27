import React from 'react';
import { css } from 'emotion';
import { Card, Icon, Select } from 'antd';
import { getErrorClass, getErrorMessage } from '../utils/error';
import { hasValuesChanged } from '../utils';
import { getFunctionHealthCheck } from '../../../utils';

const { Option } = Select;

const cardStyles = css`
	border-style: dashed;
`;

const actions = {
	promote_result: {
		name: 'Promote Result',
		data: [],
		toolTip: (
			<>
				Promote a result and show it at a specific position within the search results.
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Rules/#promote-results"
				>
					Learn more
				</a>
			</>
		),
	},
	hide_result: {
		name: 'Hide Result',
		data: [],
		toolTip: (
			<>
				Hide a document from search results.
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Rules/#hide-results"
				>
					Learn more
				</a>
			</>
		),
	},
	replace_search_term: {
		name: 'Replace Search Term',
		data: '',
		isDisabledOnAlways: true,
		toolTip: (
			<>
				Replace the whole search term with another search term.
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Rules/#replace-search-term"
				>
					Learn more
				</a>
			</>
		),
	},
	custom_data: {
		name: 'Return Custom Data',
		data: '',
		toolTip: (
			<>
				Add extra JSON data to be returned with your search results.{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Rules/#custom-data"
				>
					Learn more
				</a>
			</>
		),
	},
	function: {
		name: 'f(x) Apply Function',
		data: '',
		checkHealth: true,
		toolTip: (
			<>
				Add a custom function to make changed without any limitations.{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Functions"
				>
					Learn more
				</a>
			</>
		),
	},
	remove_words: {
		name: 'Remove Word',
		data: [],
		toolTip: (
			<>
				Remove a word(s) from the search term.{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Rules/#remove-words"
				>
					Learn more
				</a>
			</>
		),
	},
	replace_words: {
		name: 'Replace Word',
		data: {},
		toolTip: (
			<>
				Replace all the instances of a word in the applied search term.{' '}
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://docs.appbase.io/docs/search/Rules/#replace-words"
				>
					Learn more
				</a>
			</>
		),
	},
};

class ActionSelector extends React.Component {
	state = { healthy: true };

	async componentDidMount() {
		try {
			await getFunctionHealthCheck();
		} catch (e) {
			this.setState({ healthy: false });
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { healthy } = this.state;
		return (
			hasValuesChanged(nextProps, this.props, ['actions', 'error', 'condition']) ||
			healthy !== nextState.healthy
		);
	}

	handleDropdown = value => {
		const { onChange } = this.props;

		onChange({
			type: value,
			data: actions[value].data,
			toolTip: actions[value].toolTip,
		});
	};

	getDisabled = (condition, action) => {
		if (actions[action].checkHealth) {
			const { healthy } = this.state;
			return !healthy;
		}
		return condition === 'always' ? actions[action].isDisabledOnAlways : false;
	};

	render() {
		const { actions: selectedActions, error, condition } = this.props;
		const optionsToShow = Object.keys(actions).filter(
			action => !selectedActions.find(item => item.type === action),
		);
		return (
			<Card className={css([cardStyles, getErrorClass(error)])} hoverable>
				{getErrorMessage(error)}
				{optionsToShow.length ? (
					<Select
						onChange={this.handleDropdown}
						placeholder="Select Appropriate Action"
						style={{ width: '100%' }}
						value={undefined}
					>
						{optionsToShow.map(action => (
							<Option disabled={this.getDisabled(condition, action)} key={action}>
								{actions[action].name}
							</Option>
						))}
					</Select>
				) : (
					<div
						style={{
							background: '#e6f7ff',
							fontSize: '14px',
							borderRadius: '2px',
							padding: '15px',
						}}
					>
						<Icon type="check-circle" theme="twoTone" style={{ marginRight: 10 }} />
						All actions defined
					</div>
				)}
			</Card>
		);
	}
}

export default ActionSelector;
