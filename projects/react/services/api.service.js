import axios from './client';

let _beforeRequestHandler = null;

const REACT_APP_API_VERSION = 'v3';
const methods = ['get', 'delete', 'head', 'post', 'put', 'patch'];
export const _send = {};
methods.forEach(method =>
  (_send[method] = (...attrs) => {
    if (typeof _beforeRequestHandler === 'function') {
      _beforeRequestHandler({ method, attrs });
    }

    return axios()[method](...attrs)
      .then(response => response.data)
      .catch(error => {
        const response = error.response;

        if (response && response.status === 400 && response.data) {
          const message = response.data.msg || response.data.hint;

          if (message) {
            error.message = message;
          }
        }

        return Promise.reject(error);
      })
  }
  )
);

export const getAirstoreContainerFiles = (apiDomain, secretKey, dir = '/', limit = 50) =>
  _send.get(
    `https://${apiDomain}/${REACT_APP_API_VERSION}/list?dir=${dir}&limit=${limit}`,
    { headers: { 'X-Filerobot-Key': secretKey } }
  );
