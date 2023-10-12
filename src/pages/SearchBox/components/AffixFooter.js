import { Button, Tooltip } from 'antd';
import { any, bool, func, object } from 'prop-types';
import React, { useCallback, useState } from 'react';
import styled from 'react-emotion';
import ExportSearchBoxCode from './ExportSearchBoxCode';

const Container = styled.div`
	position: fixed;
	overflow: hidden;
	bottom: 0;
	left: ${(props) => (props.collapsed ? 80 : 260)}px;
	right: 0;
	z-index: 10;
`;

const Row = styled.div`
	width: 100%;
	padding: 20px;
	margin-top: auto;
	background: white;
	box-sizing: border-box;
	border: 1px solid #e8e8e8;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
	display: flex;
	align-items: center;
	gap: 1.5rem;
	.save-searchbox-button {
		margin-left: auto;
		margin-right: 2.2rem;
	}
`;

export default function Footer({
	collapsed,
	onLivePreview,
	isEditPage,
	onSave,
	isSaving,
	searchBoxItem,
}) {
	const [showExportCode, setShowExportCode] = useState(false);
	const handleExportCode = useCallback(async () => {
		setShowExportCode(true);
	}, [setShowExportCode]);
	return (
		<>
			<ExportSearchBoxCode
				visible={showExportCode}
				onCancel={() => setShowExportCode(false)}
				searchBoxId={isEditPage}
				index={searchBoxItem?.index}
				pipeline={searchBoxItem?.pipeline}
			/>
			<Container collapsed={collapsed}>
				<Row>
					<Button type="primary" onClick={onLivePreview}>
						Live preview
					</Button>
					<Tooltip
						title={
							isEditPage
								? 'Export code for the Searchbox'
								: 'Export Code is available for saved Searchboxes!'
						}
					>
						<Button disabled={!isEditPage} type="primary" onClick={handleExportCode}>
							Export Code
						</Button>
					</Tooltip>
					<Button
						className="save-searchbox-button"
						type="primary"
						onClick={onSave}
						loading={isSaving}
						disabled={isSaving}
					>
						Save
					</Button>
				</Row>
			</Container>
		</>
	);
}
Footer.propTypes = {
	collapsed: bool.isRequired,
	onLivePreview: func.isRequired,
	isEditPage: any.isRequired,
	onSave: func.isRequired,
	isSaving: bool.isRequired,
	searchBoxItem: object.isRequired,
};
