import React from 'react';

class CDNizedUrl extends React.Component {
  constructor(props) {
    super(props);

    this.cdnPrefix = 'https://scaleflex.ultrafast.io/';
    this.state = {link: `${this.cdnPrefix}${props.url || ''}`};
  }

  copyToClipBoard = () => {
    const el = document.getElementById('copy-url-textarea');
    const tooltip = document.getElementById("copy-url-tooltip");

    if (this.state.link.indexOf('?') > -1)
      el.value = this.state.link.slice(0, this.state.link.indexOf('?'));
    else
      el.value = this.state.link;

    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      var editable = el.contentEditable;
      var readOnly = el.readOnly;
      el.contentEditable = true;
      el.readOnly = true;
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      el.setSelectionRange(0, 999999);
      el.contentEditable = editable;
      el.readOnly = readOnly;
    } else {
      el.select();
    }

    document.execCommand('copy');
    el.value = '';
    tooltip.innerHTML = "Copied: " + this.state.link;
    tooltip.style.visibility = 'visible';
  };

  render() {
    const { url, t } = this.props;

    return (
      <div className="j-section-demo">
        <div className="link-value-wrapper">
          <div className="link-value">
            <div className="link-value-inner">
              <div style={{fontWeight: 500}}>
                <span>{this.cdnPrefix}</span>
                <span style={{color: 'rgb(105, 118, 137)', fontWeight: 600}}>{url}</span>
              </div>
            </div>

            <div className="j-section-demo-btn-container">
              <button
                type="button"
                className="j-section-demo-copy-url-btn"
                onClick={this.copyToClipBoard}
              >
                <div className="j-tooltip">
                  <span className="tooltiptext" id="copy-url-tooltip">
                    {t.builder['COPY_TO_CLIPBOARD']}
                  </span>
                </div>

                {t.builder['COPY_URL']}

              </button>
            </div>
            <textarea
              name="copy-url-textarea"
              id="copy-url-textarea"
              cols="30"
              rows="10"
              style={{position: 'absolute', left: -9999}}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CDNizedUrl;