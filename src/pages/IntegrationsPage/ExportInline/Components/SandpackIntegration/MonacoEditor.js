import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useActiveCode, SandpackStack, FileTabs, useSandpack } from '@codesandbox/sandpack-react';
import '@codesandbox/sandpack-react/dist/index.css';
import { func, number, object, string } from 'prop-types';
import { css } from 'emotion';
import { Button } from 'antd';

const MonacoEditor = ({ iframeHeight, highlightLine, path, setOpenCommitModal, setSearchType }) => {
	const { code, updateCode } = useActiveCode();
	const [isImage, setIsImage] = useState(false);
	const [updatedCode, setUpdatedCode] = useState(code);

	const editorRef = useRef(null);
	const { sandpack } = useSandpack();

	useEffect(() => {
		setUpdatedCode(code);
	}, [code]);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			updateCode(updatedCode);
		}, 1500);

		return () => clearTimeout(delayDebounceFn);
	}, [updatedCode]);

	useEffect(() => {
		renderImage();
	}, [path]);

	useEffect(() => {
		if (!editorRef.current) return;
		highlightLines();
	}, [highlightLine]);

	const highlightLines = () => {
		const { monaco, editor } = editorRef.current;
		if (path === highlightLine.path) {
			highlightLine.lines.forEach((line) => {
				// Highlight the selected line while searching in all files.
				const r = new monaco.Range(line, 1, line, 1);
				editor.deltaDecorations(
					[],
					[
						{
							range: r,
							options: {
								inlineClassName: css`
									background-color: #ffefcf;
								`,
								isWholeLine: line,
							},
						},
					],
				);
			});
		}
	};

	const handleEditorDidMount = (editor, monaco) => {
		editorRef.current = {
			editor,
			monaco,
		};

		editor.onKeyDown(function (e) {
			if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
				e.preventDefault();
				setOpenCommitModal(true);
			}
			if ((e.ctrlKey || e.metaKey) && e.code === 'KeyP') {
				e.preventDefault();
				// Enable File Search
				setSearchType('fileSearch');
				document.getElementById('file-explorer-search').focus();
			}
		});

		highlightLines();

		const undo = editor.createContextKey('undo', false); // eslint-disable-line
		const redo = editor.createContextKey('redo', false); // eslint-disable-line
		editor.addAction({
			id: 'my-undo-id',
			label: 'Undo',
			keybindings: [
				// eslint-disable-next-line
				monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ,
				// eslint-disable-next-line
				monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ),
			],
			precondition: null,
			keybindingContext: null,
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1.5,
			run() {
				editor.trigger('', 'undo');
			},
		});

		editor.addAction({
			id: 'my-redo-id',
			label: 'Redo',
			keybindings: [
				// eslint-disable-next-line
				monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
				monaco.KeyMod.chord(
					// eslint-disable-next-line
					monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
				),
			],
			precondition: null,
			keybindingContext: null,
			contextMenuGroupId: 'navigation',
			contextMenuOrder: 1.5,
			run() {
				editor.trigger('', 'redo');
			},
		});
	};

	const renderImage = (value = '') => {
		if (
			path.includes('.ico') ||
			path.includes('.png') ||
			path.includes('.jpg') ||
			path.includes('.jpeg')
		) {
			if (value || code) {
				const image = new Image();
				image.src = `data:image/png;base64,${value || code}`;
				image.onerror = function () {
					setIsImage(false);
				};
				image.onload = function () {
					setIsImage(true);
				};
			} else {
				setIsImage(false);
			}
		} else {
			setIsImage(false);
		}
	};

	return (
		<SandpackStack customStyle={{ height: `${iframeHeight}px`, margin: 0, minWidth: 150 }}>
			<FileTabs showTabs showLineNumbers showInlineErrors wrapContent={false} closableTabs />
			<div style={{ flex: 1 }}>
				{isImage ? (
					<div
						style={{
							position: 'absolute',
							top: '40%',
							right: '40%',
							display: 'flex',
							flexDirection: 'column',
						}}
					>
						<Button
							type="link"
							onClick={() => {
								setIsImage(false);
							}}
						>
							Open file with editor
						</Button>
						<img
							alt="img-content"
							src={`data:image/png;base64,${code}`}
							style={{
								minWidth: '150px',
							}}
						/>
					</div>
				) : (
					<Editor
						width="100%"
						height="100%"
						language="javascript"
						theme="light"
						key={sandpack.activePath}
						defaultValue={code}
						value={updatedCode}
						onChange={(value) => {
							setUpdatedCode(value);
						}}
						line={highlightLine.line}
						onMount={handleEditorDidMount}
						options={{
							minimap: {
								enabled: false,
							},
							overviewRulerLanes: 0,
							autoClosingBrackets: true,
							scrollBeyondLastLine: false,
							autoIndent: true,
							fontSize: 14,
							inlineSuggest: {
								enabled: true,
							},
							contextmenu: true,
						}}
					/>
				)}
			</div>
		</SandpackStack>
	);
};

MonacoEditor.propTypes = {
	iframeHeight: number.isRequired,
	highlightLine: object,
	path: string.isRequired,
	setOpenCommitModal: func.isRequired,
	setSearchType: func,
};

MonacoEditor.defaultProps = {
	highlightLine: {
		line: 0,
		lines: [],
	},
	setSearchType: () => {},
};

export default MonacoEditor;
