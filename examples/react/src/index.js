import React, { useState } from 'react';
import { render } from 'react-dom';
import '../../../projects/react/assets/base.scss';
import UrlBuilder from '../../../projects/react/urlBuilder';

const config = {
  location: {},
  //cloudimg_token: 'demoaws',
  cloudimg_token: 'fusqadtm',
  airstore_subdomain: 'fusqadtm',
  airstore_key: '19692813e7364ef8ad6a6504d50a12ca',
  projectDomains: {
    api: "api.filerobot.com/fusqadtm",
    store: "store.filerobot.com/fusqadtm",
    cdn: "fusqadtm.filerobot.com",
  },
  language: 'en',
  translations: {},
  isShowInput: true,
  isShowOutput: true,
  uploaderModules: ['UPLOAD', 'MY_GALLERY'],
  initialTab: 'UPLOAD'
};

const App = () => {
  const [show, toggle] = useState(false);

  return (
    <div>
      <UrlBuilder
        config={config}
        show={show}
        onClose={() => { toggle(false) }}
        onComplete={(props) => { console.log(props) }}
        onBeforeComplete={(props) => { console.log(props); return false; }}
      />
    </div>
  )
};

render(<App/>, document.getElementById('app'));