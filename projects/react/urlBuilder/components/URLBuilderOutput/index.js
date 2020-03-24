import React, { Component, Fragment } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { InputGroup } from "../URLBuilderInput/input.styled";
import { Separator } from './index.styled';
import url from "url";


class URLBuilderOutput extends Component {
  state = { copied: false };

  renderSeparator = (separator = '&') => <Separator>{separator}</Separator>

  renderWithSeparators = ({ text = '', separator = '&', addEndingSeparator = false }) => {
    const items = text.split(separator).filter(i => i);
    return (
      items.map((item, index) => <Fragment key={`${item}-${index}`}>
        {item}{index !== items.length - 1 || addEndingSeparator ? this.renderSeparator() : ''}
      </Fragment>)
    )
  }

  showAlert = () => {
    this.setState({ copied: true });

    setTimeout(() => this.setState({ copied: false }), 2000)
  }

  render() {
    const { builderProps, t } = this.props;
    const { copied } = this.state;
    const { activeOperation, size, filters, color, operation, link } = builderProps;
    if (typeof link !== 'string') { throw new Error('link must be string'); }
    const { hostname, protocol, pathname } = url.parse(link);

    return (
      <InputGroup>
        <div className="input-group">
          {activeOperation &&
          <div className="form-control output-field">
            <div>
              <span>{url.format({ protocol, hostname })}</span>
              <span style={{ color: '#697689', fontWeight: 600 }}>{pathname}</span>?
              <span style={{ color: '#ff8a65', fontWeight: 600 }} key="activeOperation">
                  {operation
                    ? this.renderWithSeparators({ text: operation })
                    : ''}
                </span>{(operation && (size || filters) ? this.renderSeparator() : '')}
              <span style={{ color: '#f47373', fontWeight: 600 }} key="size">
                  {size ? this.renderWithSeparators({ text: size }) : ''}
                </span>{(size && filters ? this.renderSeparator() : '')}
              <span style={{ color: '#2ccce4', fontWeight: 600 }} key="filters">
                  {this.renderWithSeparators({ text: filters })}
                </span>{color ? this.renderSeparator() : ''}
              <span style={{ color: '#2ccce4', fontWeight: 600 }} key="bg-color">
                  {color ? this.renderWithSeparators({ text: color }) : ''}
                </span>
            </div>
          </div>}

          <span className="input-group-btn">
            <CopyToClipboard
              text={this.props.builderProps.link}
              onCopy={() => { this.showAlert(true); }}
            >
              <button type="button" className="btn btn-primary">
                {copied ? t.builder['COPIED_TO_CLIPBOARD'] : t.builder['COPY_URL']}
              </button>
            </CopyToClipboard>
          </span>
        </div>
      </InputGroup>
    );
  }
}

export default URLBuilderOutput;