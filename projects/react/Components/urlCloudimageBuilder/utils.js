import url from 'url';


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function isHex(hex) {
  return /^[0-9A-F]{6}$/i.test(hex);
}

function JpegQualityFieldProcessor(value, maxValue = 100) {
  const absValue = Math.abs(value);
  return value
    ? (absValue > maxValue ? maxValue : absValue)
    : value;
}

function RoundedCornersFieldProcessor(value, maxValue = 150) {
  const allowedValues = ['max', ''];

  let _value = parseInt(value, 10);
  if (isNaN(_value)) {
    _value = allowedValues.some(v => v.startsWith(value) || v === value) ? value : 0;
  } else {
    if (_value > maxValue) {
      _value = maxValue;
    }
  }

  return value;
}

function transformPath({ link, domain, projectDomains, token }) {
  if (!link || !projectDomains || !Object.keys(projectDomains).length) { return ''; }

  const { pathname } = url.parse(link);
  let _path = pathname || '';
  if (_path[0] === '/') {
    _path = _path.substr(1, _path.length);
  }

  if (projectDomains.cdn.includes(domain)) {
    _path = _path.replace(`${token}/`, '');
  }

  return _path;
}

function transformLink({ link, domain = '', protocol = '', projectDomains, token }) {
  const { search, protocol: _protocol, hostname } = url.parse(link);

  return url.format({
    protocol: protocol || _protocol,
    hostname: domain || hostname,
    pathname: transformPath({
      link,
      domain: domain || hostname,
      projectDomains,
      token
    }),
    search,
  });
}

export {
  guid,
  isHex,
  JpegQualityFieldProcessor,
  RoundedCornersFieldProcessor,
  transformPath,
  transformLink,
};