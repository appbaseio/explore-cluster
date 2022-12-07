import React, { useState, useContext } from 'react';

import {
	CaretDownOutlined,
	CaretRightOutlined,
	DeleteOutlined,
	EditOutlined,
	FileAddOutlined,
	FolderAddOutlined,
	MoreOutlined,
} from '@ant-design/icons';

import { Input, Menu, Dropdown } from 'antd';
import PropTypes from 'prop-types';
import { useSandpack } from '@codesandbox/sandpack-react';
import { FileIcon } from './icons';
// eslint-disable-next-line
import { SandpackCodeContext } from '../..';
import { hoverStyles } from './styles';

const File = ({ path, selectFile, active, onClick, depth, createNew, setNewFolder }) => {
	const [showInput, setShowInput] = useState(false);
	const [mode, setMode] = useState('file-add');
	const [value, setvalue] = useState('');
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { sandpack } = useSandpack();
	const { handleRenameFile, handleRenameFolder, handleDelete, handleCreateFile, themeType } =
		useContext(SandpackCodeContext);

	const clickFile = () => {
		if (selectFile) {
			selectFile(path);
		}
	};

	const handleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const handleFileCreation = (val) => {
		handleCreateFile(val, path, sandpack);
		closeInput();
	};

	const handleFolderCreation = (val) => {
		setNewFolder(val);
		closeInput();
	};

	const closeInput = () => {
		setMode('file-add');
		setShowInput(false);
		setvalue('');
	};

	const handleFolderRename = (data) => {
		handleRenameFolder(data, path);
		setMode('file-add');
	};

	const handleFileRename = (data) => {
		handleRenameFile(data, path);
		setMode('file-add');
	};

	const handleAction = (val) => {
		if (mode === 'file-add') handleFileCreation(val);
		else if (mode === 'folder-add') handleFolderCreation(val);
		else if (mode === 'folder-edit') handleFolderRename(val);
		else if (mode === 'file-edit') handleFileRename(val);
		else console.log('Different mode:', mode);
	};

	const menu = createNew ? (
		<Menu>
			<Menu.Item
				onClick={() => {
					setShowInput(true);
					setMode('file-add');
				}}
			>
				<FileAddOutlined style={{ margin: '0.25rem' }} />
				New File
			</Menu.Item>
			<Menu.Item
				onClick={() => {
					setShowInput(true);
					setMode('folder-add');
				}}
			>
				<FolderAddOutlined style={{ margin: '0.25rem' }} />
				New Folder
			</Menu.Item>
			<Menu.Item
				onClick={() => {
					setMode('folder-edit');
				}}
			>
				<EditOutlined style={{ margin: '0.25rem' }} />
				Rename
			</Menu.Item>
			<Menu.Item
				onClick={() => {
					setMode('folder-delete');
					handleDelete(path);
				}}
			>
				<DeleteOutlined style={{ margin: '0.25rem' }} />
				Delete
			</Menu.Item>
		</Menu>
	) : (
		<Menu>
			<Menu.Item
				onClick={() => {
					setMode('file-edit');
				}}
			>
				<EditOutlined style={{ margin: '0.25rem' }} />
				Rename
			</Menu.Item>
			<Menu.Item
				onClick={() => {
					setMode('file-delete');
					handleDelete(path);
				}}
			>
				<DeleteOutlined style={{ margin: '0.25rem' }} />
				Delete
			</Menu.Item>
		</Menu>
	);

	const fileName = path.split('/').filter(Boolean).pop();

	return (
		<div className={hoverStyles(themeType)}>
			<div
				className="sp-button sp-explorer"
				data-active={active}
				onClick={selectFile ? clickFile : onClick}
				style={{ paddingLeft: `${8 * depth}px` }}
				type="button"
			>
				{!createNew ? (
					<FileIcon />
				) : (
					<div onClick={handleCollapse} style={{ display: 'flex' }}>
						{isCollapsed ? (
							<CaretRightOutlined onClick={onClick} />
						) : (
							<CaretDownOutlined onClick={onClick} />
						)}
					</div>
				)}
				<span className="directory-container">
					{mode === 'folder-edit' || mode === 'file-edit' ? (
						<Input
							defaultValue={fileName}
							value={value || fileName}
							onChange={(e) => setvalue(e.target.value)}
							onPressEnter={(e) => handleAction(e.target.value)}
							onBlur={() => closeInput()}
						/>
					) : (
						<div className="filename-container">{fileName}</div>
					)}
					<Dropdown
						overlay={menu}
						trigger={['click']}
						onClick={(e) => e.preventDefault()}
					>
						<div style={{ cursor: 'pointer' }}>
							<MoreOutlined className="show-on-hover" />
						</div>
					</Dropdown>
				</span>
			</div>
			{showInput ? (
				<Input
					value={value}
					onChange={(e) => setvalue(e.target.value)}
					className="input-container"
					onPressEnter={(e) => handleAction(e.target.value)}
					onBlur={() => closeInput()}
				/>
			) : null}
		</div>
	);
};

File.propTypes = {
	path: PropTypes.string.isRequired,
	selectFile: PropTypes.func,
	active: PropTypes.bool,
	onClick: PropTypes.func,
	depth: PropTypes.number.isRequired,
	createNew: PropTypes.bool,
	setNewFolder: PropTypes.func,
};

File.defaultProps = {
	selectFile: () => {},
	onClick: () => {},
	active: false,
	createNew: false,
	setNewFolder: () => {},
};

export default File;
