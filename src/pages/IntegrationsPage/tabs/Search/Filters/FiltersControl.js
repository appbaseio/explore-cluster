import React from 'react';
import get from 'lodash/get';
import { List } from 'antd';
import { Draggable } from 'react-beautiful-dnd';
import { array, bool, func, object } from 'prop-types';
import ListItem from '../Charts/ListItem';
import DynamicFilters from './DynamicFilters';
import DynamicCharts from '../Charts/DynamicCharts';

const FiltersControl = ({ controls, traversedMappings, form, getPreferencesPayload, isFilter }) => {
	function getItemStyle(isDragging, draggableStyle) {
		return {
			border: isDragging ? '1px solid #d2d2d2' : null,
			background: isDragging ? '#ffffff' : 'transparent',
			boxShadow: isDragging ? '0px 0px 2px 0px rgba(0,0,0,0.5)' : null,
			...draggableStyle,
		};
	}

	return !controls.length ? (
		<div
			style={{
				padding: '10px 0',
				display: 'flex',
				justifyContent: 'space-between',
			}}
		>
			{isFilter ? (
				<>
					<h3>Facets</h3>
					<DynamicFilters form={form} getPreferencesPayload={getPreferencesPayload} />
				</>
			) : (
				<>
					<h3>Charts</h3>
					<DynamicCharts form={form} getPreferencesPayload={getPreferencesPayload} />
				</>
			)}
		</div>
	) : (
		<>
			<div
				style={{
					padding: '10px 0',
					display: 'flex',
					justifyContent: 'space-between',
				}}
			>
				{isFilter ? (
					<>
						<h3>Custom Filters</h3>
						<DynamicFilters form={form} getPreferencesPayload={getPreferencesPayload} />
					</>
				) : (
					<>
						<h3>Custom Charts</h3>
						<DynamicCharts form={form} getPreferencesPayload={getPreferencesPayload} />
					</>
				)}
			</div>
			<List
				dataSource={controls}
				bordered={isFilter}
				renderItem={(control, index) => {
					const metaKey = `${get(control, 'meta.key')}-${String(index)}`;
					return (
						<div key={metaKey}>
							<Draggable key={metaKey} draggableId={metaKey} index={index}>
								{(provided, snapshot) => (
									<div
										ref={provided.innerRef}
										{...provided.draggableProps}
										style={getItemStyle(
											snapshot.isDragging,
											provided.draggableProps.style,
										)}
									>
										<ListItem
											traversedMappings={traversedMappings}
											control={control}
											getPreferencesPayload={getPreferencesPayload}
											form={form}
											index={index}
											isFilter={isFilter}
											provided={provided}
										/>
									</div>
								)}
							</Draggable>
						</div>
					);
				}}
			/>
		</>
	);
};

FiltersControl.defaultProps = {
	traversedMappings: [],
	isFilter: false,
};

FiltersControl.propTypes = {
	controls: array.isRequired,
	traversedMappings: array,
	getPreferencesPayload: func.isRequired,
	form: object.isRequired,
	isFilter: bool,
};

export default FiltersControl;
