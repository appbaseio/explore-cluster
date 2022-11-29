import React, { useState, useContext } from 'react';

import {
	DeleteOutlined,
	EditOutlined,
	FileAddOutlined,
	FolderAddOutlined,
	MoreOutlined,
} from '@ant-design/icons';

import { Input, Menu, Dropdown } from 'antd';
import PropTypes from 'prop-types';
import { useSandpack } from '@codesandbox/sandpack-react';
import { DirectoryIcon } from './icons';
// eslint-disable-next-line
import { SandpackCodeContext } from '../..';
import { hoverStyles } from './styles';

const CreateNew = ({ path, selectFile, active, onClick, depth, setNewFolder, newFolder }) => {
	const [showInput, setShowInput] = useState(false);
	const [mode, setMode] = useState('file-add');
	const [value, setvalue] = useState('');

	const { sandpack } = useSandpack();
	const { sandpackCode, updateSandpackCode, themeType } = useContext(SandpackCodeContext);

	const clickFile = () => {
		if (selectFile) {
			selectFile(path);
		}
	};

	const handleCreateFile = (val) => {
		const regex = /\/\//gm;
		const newPath = path.replace(regex, `/${newFolder}/${val}`);
		const newSandpackCode = {
			...sandpackCode,
			[newPath]: '',
		};
		updateSandpackCode(newSandpackCode);
		closeInput();
		setNewFolder('');
		setTimeout(() => {
			sandpack.openFile(newPath);
		}, 0);
	};

	const handleCreateFolder = (val) => {
		setNewFolder(val);
		closeInput();
	};

	const handleRenameFolder = (val) => {
		setNewFolder(val);
		closeInput();
		setMode('file-add');
	};

	const handleRenameFile = (val) => {
		setNewFolder(val);
		setvalue(val);
		setMode('file-add');
	};

	const handleDelete = () => {
		setNewFolder('');
		setvalue('');
	};

	const closeInput = () => {
		setShowInput(false);
		setvalue('');
	};

	const handleAction = (val) => {
		if (mode === 'file-add') handleCreateFile(val);
		else if (mode === 'folder-add') handleCreateFolder(val);
		else if (mode === 'folder-edit') handleRenameFolder(val);
		else if (mode === 'file-edit') handleRenameFile(val);
		else console.log('Different mode:', mode);
	};

	const menu = (
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
					handleDelete();
				}}
			>
				<DeleteOutlined style={{ margin: '0.25rem' }} />
				Delete
			</Menu.Item>
		</Menu>
	);

	return (
		<div className={hoverStyles(themeType)}>
			<div
				className="sp-button sp-explorer"
				data-active={active}
				onClick={selectFile ? clickFile : onClick}
				style={{ paddingLeft: `${8 * (depth + 1)}px` }}
				type="button"
			>
				<DirectoryIcon isOpen={false} />
				<span className="directory-container">
					{mode === 'folder-edit' || mode === 'file-edit' ? (
						<Input
							defaultValue={newFolder}
							value={value || newFolder}
							onChange={(e) => {
								setvalue(e.target.value);
							}}
							onPressEnter={(e) => handleAction(e.target.value)}
							onBlur={() => closeInput()}
						/>
					) : (
						newFolder
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
					onChange={(e) => {
						setvalue(e.target.value);
					}}
					className="input-container"
					onPressEnter={(e) => handleAction(e.target.value)}
					onBlur={() => closeInput()}
				/>
			) : null}
		</div>
	);
};

CreateNew.propTypes = {
	path: PropTypes.string.isRequired,
	selectFile: PropTypes.func,
	active: PropTypes.bool,
	onClick: PropTypes.func,
	depth: PropTypes.number.isRequired,
	newFolder: PropTypes.string,
	setNewFolder: PropTypes.func,
};

CreateNew.defaultProps = {
	setNewFolder: () => {},
	selectFile: () => {},
	onClick: () => {},
	active: false,
	newFolder: '',
};

export default CreateNew;
