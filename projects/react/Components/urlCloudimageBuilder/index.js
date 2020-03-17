import React from 'react';
import { render } from 'react-dom';
import UrlCloudimageBuilder from './UrlCloudimageBuilder';

window.cloudimageUrlBuilder = window.cloudimageUrlBuilder || {};

window.cloudimageUrlBuilder.init = function(props) {
  props = props || {};

  const elem = document.getElementById('cloudimage-url-builder');

  if (elem) render(<UrlCloudimageBuilder gallery={props.gallery}/>, elem);
}
