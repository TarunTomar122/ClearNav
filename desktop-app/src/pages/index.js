import React, { useEffect, useState, useRef } from "react";
import ReactFlow, { useNodesState } from "reactflow";

import "reactflow/dist/style.css";
import "./style.css";

import VscodeIcon from "../assets/vscode.png";
import ChromeIcon from "../assets/chrome.png";
import GroupIcon from "../assets/group.png";

import First from "../assets/1.png";
import Second from "../assets/4.png";
import Third from "../assets/3.png";

import { memo } from "react";

import axios from "axios";

const CustomNode = memo(({ data, isConnectable }) => {
	return (
		<div className="max-w-s">
			<a
				onClick={() => {
					let windowsToOpen = [];

					let titles = data.title.split("+");
					let i = 0;
					titles.forEach((title) => {
						windowsToOpen.push({
							type: data.windowTypes[i],
							title: title,
							pid: data.pid[i],
						});
						i += 1;
					});

					// open the windowwwwww
					axios({
						method: "post",
						url: "http://localhost:3001/api/windows-manager/open",
						data: {
							windows: windowsToOpen,
						},
					});
				}}
				className="transititext-primary text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
				data-te-toggle="tooltip"
				title={data.title}
			>
				{data.type === "vscode" && (
					<img src={VscodeIcon} alt="icon" className="h-8" />
				)}
				{data.type === "chrome" && (
					<img src={ChromeIcon} alt="icon" className="h-8" />
				)}
				{data.type === "group" && (
					<img src={GroupIcon} alt="icon" className="h-8" />
				)}
			</a>
		</div>
	);
});

const nodeTypes = {
	selectorNode: CustomNode,
};

export const IndexPage = () => {
	// this ref stores the current dragged node
	const dragRef = useRef(null);

	// target is the node that the node is dragged over
	const [target, setTarget] = useState(null);

	const [nodes, setNodes, onNodesChange] = useNodesState([]);

	const onNodeDragStart = (evt, node) => {
		dragRef.current = node;
	};

	useEffect(() => {
		axios
			.get("http://localhost:3001/api/windows-manager")
			.then((response) => {
				let apiData = response.data;

				let tempNodes = [];

				var xOffset = 0;
				apiData.forEach((data) => {
					let nodeData = {
						id: data.title,
						position: {
							x: xOffset,
							y: 0,
						},
						data: {
							type: data.type,
							title: data.title,
							windowTypes: [data.type],
							pid: [data.pid],
						},
						style: {
							maxWidth: 38,
							borderWidth: 0.5,
							borderRadius: 5,
							padding: 5,
						},
						type: "selectorNode",
					};
					tempNodes.push(nodeData);
					xOffset += 55;
				});
				setNodes(tempNodes);
			})
			.catch((er) => {
				console.log("here we get some error", er);
			});
	}, []);

	const onNodeDrag = (evt, node) => {
		// calculate the center point of the node from position and dimensions
		const centerX = node.position.x;

		// find a node where the center point is inside
		const targetNode = nodes.find(
			(n) =>
				centerX > n.position.x - 30 &&
				centerX < n.position.x + 30 &&
				n.id !== node.id, // this is needed, otherwise we would always find the dragged node
		);

		setTarget(targetNode);
	};

	const onNodeDragStop = (evt, node) => {
		if (!target) return;

		setNodes((nodes) =>
			nodes.filter((n) => n.id !== target?.id && n.id !== node.id),
		);

		let windowTypes = [];

		node.data.windowTypes.forEach((window) => {
			windowTypes.push(window);
		});

		target.data.windowTypes.forEach((window) => {
			windowTypes.push(window);
		});

		let combinedNode = {
			id: node.id + target.id,
			position: {
				x: node.position.x,
				y: 0,
			},
			data: {
				type: "group",
				title: node.data.title + "+" + target.data.title,
				pid: [...node.data.pid, ...target.data.pid],
				windowTypes,
			},
			style: {
				maxWidth: 30,
				borderWidth: 1,
				padding: 5,
			},
			type: "selectorNode",
		};
		setNodes((prevNodes) => [...prevNodes, combinedNode]);

		setTarget(null);
		dragRef.current = null;
	};

	return (
		<div
			className="flex m-auto flex-row border-2 border-pink-300"
			style={{ height: 100, width: 800 }}
		>
			<ReactFlow
				nodes={nodes}
				onNodesChange={onNodesChange}
				fitView={true}
				nodeTypes={nodeTypes}
				onNodeDragStart={onNodeDragStart}
				onNodeDrag={onNodeDrag}
				onNodeDragStop={onNodeDragStop}
				panOnDrag={false}
				PanOnScrollMode={"horizontal"}
			></ReactFlow>
		</div>
	);
};

