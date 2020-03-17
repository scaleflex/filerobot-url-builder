import { getAirstoreContainerFiles as getAirstoreContainerFilesRequest} from '../services/api.service';

export const getParamFromUrlString = (string = '', param = '') => {
  const params = {};

  (string || '')
    .replace(/^\?(.+)?/, '$1')
    .split('&')
    .forEach(item => {
      const [param, value = null] = item.split('=');
      if (param) params[param] = value;
    });

  return (params && params[param]) || null;
};

export const findImages = (files = []) =>
  (files || []).filter(file => ['image/jpeg', 'image/png'].indexOf(file.type) > -1);

export const findFilesWithExtentions = (files = []) =>
  files.filter(file => /\.[a-z]{3,4}$/i.test(file.name));

export const sortByStringsLength = (arrayToSort = [], toUpper = true) =>
  arrayToSort.sort((a, b) => {
    if (a.name.length === b.name.length) { return 0; }

    const condition = toUpper ? a.name.length < b.name.length : a.name.length > b.name.length;

    return condition ? -1 : 1;
  });

/**
 * @param {string} airstoreSubdomain
 * @param {string} airstoreKey
 * @return {Promise<AirstoreFile|null>}
 */
export const getFirstImageFromFilesList = (apiDomain, airstoreKey) =>
  new Promise(resolve => {
    getAirstoreContainerFilesRequest(apiDomain, airstoreKey)
      .then(({ files }) => {
        /** @type {AirstoreFile[]} */
        let images = findImages(files);

        if (images.length) {
          const imagesWithExtantion = findFilesWithExtentions(images);

          if (imagesWithExtantion.length) {
            images = imagesWithExtantion;
          }

          sortByStringsLength(images);
        }

        resolve(images[0] || null);
      })
      .catch(() => resolve(null));
  })