import React from 'react';

// Import Blockly
import BlocklyComponent, { Block, Value, Field, Shadow } from './Blockly';
import './Blockly/blocks/customblocks';
import './Blockly/generator/generator';

import basePage from "./basePage.js";

import "./css/styles.css";

class ProgramPage extends basePage {
  constructor(props, useSocketIO = true) {
    super(props, useSocketIO);
    this.state = {
      telemetryStatus: this.props.telemetryStatus,
      loading: true,
      error: null,
      infoMessage: null,
      show: false,
    };

    // Socket.io client for reading in analog update values
    this.socket.on(
      "FCStatus",
      function (msg) {
        this.setState({ FCStatus: msg });
      }.bind(this)
    );
    this.socket.on(
      "reconnect",
      function () {
        //refresh state
        this.componentDidMount();
      }.bind(this)
    );
  }

  componentDidMount() {
    this.loadDone();
  }

  renderTitle() {
    return "プログラム";
  }

  renderContent() {
    return (
      <div style={{height: "85%", width: "85%", position: "absolute"}}>
      <BlocklyComponent
        readOnly={false}
        trashcan={true}
        media={'media/'}
        move={{
          scrollbars: true,
          drag: true,
          wheel: true,
        }}
        initialXml={`
<xml xmlns="http://www.w3.org/1999/xhtml">
<block type="controls_ifelse" x="0" y="0"></block>
</xml>
      `}>
        <Block type="test_react_field" />
        <Block type="test_react_date_field" />
        <Block type="controls_ifelse" />
        <Block type="logic_compare" />
        <Block type="logic_operation" />
        <Block type="controls_repeat_ext">
          <Value name="TIMES">
            <Shadow type="math_number">
              <Field name="NUM">10</Field>
            </Shadow>
          </Value>
        </Block>
        <Block type="logic_operation" />
        <Block type="logic_negate" />
        <Block type="logic_boolean" />
        <Block type="logic_null" disabled="true" />
        <Block type="logic_ternary" />
        <Block type="text_charAt">
          <Value name="VALUE">
            <Block type="variables_get">
              <Field name="VAR">text</Field>
            </Block>
          </Value>
        </Block>
      </BlocklyComponent>
      </div>
    );
  }
}

export default ProgramPage;
