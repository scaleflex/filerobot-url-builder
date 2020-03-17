import { render, unmountComponentAtNode } from 'react-dom';
import React from 'react';
import UrlBuilder from '../react/urlBuilder';


class CloudimageUrlBuilder {
  constructor(config = {}, methods, show = false) {
    const containerId = config.elementId || 'cloudimage-url-builder';
    let container = document.getElementById(containerId);
    let onComplete = (src) => { console.log(src) };

    if (methods && typeof methods === 'function') { // to support old syntax
      onComplete = methods;
    } else {
      methods = methods || {};
    }

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;

      document.body.appendChild(container);
    }

    const renderApp = Component => render(
      <Component
        show={show}
        config={config}
        onComplete={onComplete}
        onBeforeComplete={methods.onBeforeComplete}
      />, container);

    this.component = renderApp(UrlBuilder);
    this.open = this.component.open;
    this.close = this.component.close;
    this.unmount = () => unmountComponentAtNode(container);
  }
}

window.CloudimageUrlBuilder = CloudimageUrlBuilder;