import React, { useEffect, useRef } from "react";
import "./BlocklyComponent.css";

import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import * as locale from "blockly/msg/en";
import "blockly/blocks";

Blockly.setLocale(locale);

function BlocklyComponent(props) {
    const blocklyDiv = useRef();
    const toolbox = useRef();
    const primaryWorkspace = useRef();

    const generateCode = () => {
        if (primaryWorkspace.current) {
            const code = javascriptGenerator.workspaceToCode(primaryWorkspace.current);
            console.log(code);
        }
    };

    useEffect(() => {
        if (!primaryWorkspace.current) {
            const { initialXml, children, ...rest } = props;

            primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
                toolbox: toolbox.current,
                ...rest,
            });

            if (initialXml) {
                Blockly.Xml.domToWorkspace(
                    Blockly.utils.xml.textToDom(initialXml),
                    primaryWorkspace.current
                );
            }

            const handleResize = () => {
                Blockly.svgResize(primaryWorkspace.current);
            };

            window.addEventListener('resize', handleResize);

            // 初期表示のためのタイムアウトを設定してリサイズ
            setTimeout(() => {
                Blockly.svgResize(primaryWorkspace.current);
            }, 0);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [props]);

    return (
        <div style={{ height: "100%", width: "100%", position: "absolute" }}>
            <button onClick={generateCode}>Convert</button>
            <div ref={blocklyDiv} id="blocklyDiv" />
            <div style={{ display: "none" }} ref={toolbox}>
                {props.children}
            </div>
        </div>
    );
}

export default BlocklyComponent;
