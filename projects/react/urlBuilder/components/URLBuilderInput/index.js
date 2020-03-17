import React, { Component, Fragment } from 'react';
import { InputGroup } from './input.styled';
import PropTypes from 'prop-types';


class URLBuilderInput extends Component {
  state = {
    hasChanged: false,
    link: this.props.link || '',
    originalLink: this.props.link || ''
  };

  onKeyDown = ({ keyCode }) => {
    if (keyCode === 13) {
      this.changeLinkHandler();
    } else if (keyCode === 27) {
      this.closeChangeLinkHandler();
    }
  };

  onChange = ({ target }) => {
    this.setState({ link: target.value }, () => {
      if (!this.state.hasChanged && this.state.link !== this.state.originalLink) {
        this.setState({ hasChanged: true });
      } else if (this.state.link === this.state.originalLink) {
        this.setState({ hasChanged: false });
      }
    });
  };

  changeLinkHandler = () => {
    const { onChangeOriginalImage } = this.props;
    if (typeof onChangeOriginalImage === 'function') {
      onChangeOriginalImage(this.state.link);
    }
    this.setState({ hasChanged: false, originalLink: this.state.link });
  };

  closeChangeLinkHandler = () => {
    this.setState({ hasChanged: false, link: this.state.originalLink });
  };

  render() {
    const { t } = this.props;
    const { hasChanged, link } = this.state;

    return (
      <InputGroup>
        <div className="input-group">
          <input
            className="form-control editable-input"
            style={{ fontSize: 14 }}
            value={link || ''}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
          />
          <span className="input-group-btn">
            {hasChanged && (
              <Fragment>
                <button
                  type="button"
                  className="btn btn-primary"
                  onMouseDown={this.changeLinkHandler}
                >
                  {t.common['OK']}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onMouseDown={this.closeChangeLinkHandler}
                >
                  {t.common['CANCEL']}
                </button>
              </Fragment>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.props.openGallery}
            >
                  {t.common['OPEN_FROM_GALLERY']}
            </button>
          </span>
        </div>
      </InputGroup>
    );
  }
}

URLBuilderInput.propTypes = {
  onChangeOriginalImage: PropTypes.func,
}

export default URLBuilderInput;