import React, { Component, Fragment } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
import { InputGroup } from "../URLBuilderInput/input.styled";
import { Separator } from './index.styled';
import url from "url";


class URLBuilderOutput extends Component {

  renderSeparator = (separator = '&') => <Separator>{separator}</Separator>

  renderWithSeparators = ({ text = '', separator = '&', addEndingSeparator = false }) => {
    const items = text.split(separator).filter(i => i);
    return (
      items.map((item, index) => <Fragment key={`${item}-${index}`}>
        {item}{index !== items.length - 1 || addEndingSeparator ? this.renderSeparator() : ''}
      </Fragment>)
    )
  }

  render() {
    const { builderProps, showAlert, t } = this.props;
    const { activeOperation, size, filters, color, operation, link } = builderProps;
    if (typeof link !== 'string') { throw new Error('link must be string'); }
    const { hostname, protocol, pathname } = url.parse(link);

    return (
      <InputGroup>
        <div className="input-group" style={{ display: 'block' }}>
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

          <span className="input-group-btn" style={{ display: 'block' }}>
            <CopyToClipboard
              text={this.props.builderProps.link}
              onCopy={() => {
                //showAlert(null, t.builder['COPIED_TO_CLIPBOARD']);
              }}
            >
              <button type="button" className="btn btn-primary">
                {t.builder['COPY_URL']}
              </button>
            </CopyToClipboard>
          </span>
        </div>
      </InputGroup>
    );
  }
}

//URLBuilderOutput.propTypes = {
//  showAlert: PropTypes.func.isRequired,
//}

export default URLBuilderOutput;