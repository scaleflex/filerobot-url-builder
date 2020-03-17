import React, { Component, Fragment } from 'react';
import queryString from 'query-string';
import UrlImageBuilder from '../components/urlCloudimageBuilder/UrlCloudimageBuilder';
import { getParamFromUrlString, getFirstImageFromFilesList } from '../utils/helper.utils';
import ImageUploaderModal from '../components/imageUploader/ImageUploader.modal';
import Loader from '../components/Loader';
import StepWrapper from '../components/sharedComponents/StepWrapper';
import CDNizedUrl from './components/CDNizedUrl';
import URLBuilderInput from './components/URLBuilderInput';
import URLBuilderOutput from './components/URLBuilderOutput';
import { transformPath } from '../components/urlCloudimageBuilder/utils';
import translations from '../assets/translations';


class URLBuilder extends Component {
  constructor(props) {
    super(props);
    const { config } = props;

    //const STORE_PATH_PROP_NAME = 'store_path';
    const originalLink = this.getOriginalLink();
    //const _path = sessionStorage.getItem(STORE_PATH_PROP_NAME);
    //const galleryPath = _path || '/';
    config.language = translations[config.language] ? config.language : 'en';

    this.state = {
      isLoading: true,
      isVisibleUploader: false,
      originalLink,
      isImage: this.checkIfImage(),
      builderProps: {
        link: '',
      },
      urlUploaderProcessIndex: 0,
      //galleryPath,
      t: {
        ...translations[config.language]
      },
    };
  }

  getOriginalLink = () => {
    const { config } = this.props;

    const link = getParamFromUrlString(config.location.search, 'link');
    return link ? decodeURIComponent(link) : null;
  }

  /**
   * Need to support filerobot and custom domains.
   * Links examples:
   *  - filerobot:  https://store.filerobot.com/fuaezvam/boat.jpg
   *  - custom:     https://store.cloudimage.cdnetworks.com/boat.jpg
   *
   * @param {String} originalLink
   * @returns {String} For example: "boat.jpg"
   */
  getOriginalLinkPath = (originalLink) => {
    const { config } = this.props;

    if (!originalLink) { return ''; }
    return transformPath({ link: originalLink, domain: config.projectDomains.cdn, projectDomains: config.projectDomains, token: config.cloudimg_token });
  }

  checkIfImage = () => {
    const { config } = this.props;

    const isImageParam = getParamFromUrlString(config.location.search, 'is_image');
    return isImageParam !== '0';
  }

  componentDidMount() {
    const { config } = this.props;
    const { originalLink, } = this.state;

    if (!originalLink && config.projectDomains.api) {
      this.loadFileFromContainer();
    } else {
      this.setState({ isLoading: false });
    }
  }

  /**@param {[String]} params*/
  removeUrlParams = (...params) => {
    const { config } = this.props;

    const queryObj = queryString.parse(config.location.search);
    for (const param of params) {
      queryObj[param] = undefined;
    }
    const search = queryString.stringify(queryObj);

    const url = window.location.href;
    const urlSplit = url.split("?");
    const stateObj = { Title: "New title", Url: urlSplit[0] + `${search ? `?${search}` : ''}` };
    window.history.pushState(stateObj, stateObj.Title, stateObj.Url);
  }

  componentDidUpdate(prevProps) {
    const { config } = this.props;
    const { originalLink, } = this.state;

    const hasDifferentToken = prevProps.cloudimg_token && cloudimg_token && prevProps.cloudimg_token !== config.cloudimg_token;

    if (hasDifferentToken || (!originalLink && config.projectDomains.api)) {
      this.removeUrlParams('link', 'is_image');
      this.loadFileFromContainer(hasDifferentToken);
    }
  }

  loadFileFromContainer = (refresh = false) => {
    const { config } = this.props;
    const { originalLink, isImage } = this.state;

    if ((!isImage || originalLink) && !refresh) {
      return this.setState({ isLoading: false });
    }

    getFirstImageFromFilesList(config.projectDomains.api, config.airstore_key).then(image => {
      this.setUrl(image);
    });
  };

  setUrl = (file) => {
    if (!file) {
      return this.setState({ isLoading: false });
    }

    this.setState({
      originalLink: file.url.public,
      isVisibleUploader: false,
      isLoading: false,
      urlUploaderProcessIndex: this.state.urlUploaderProcessIndex + 1
    });
  };

  onChangeOriginalImage = (url) => {
    this.setState({ originalLink: url });
  };

  updateResultLink = (builderProps) => {
    this.setState({ builderProps });
  };

  openGallery = () => {
    this.setState({ isVisibleUploader: true });
  };

  render() {
    const { isImage, t } = this.state;
    const titleStep1 = isImage ? t.titles['TITLE_STEP_1'] : t.titles['TITLE_STEP_1_NOT_IMAGE'];

    return (
      this.renderContent(titleStep1)
    );
  }

  isImageTransformed = (originalLink = '', link = '') => {
    if ((!originalLink && !link) || originalLink === link) { return false; }

    const originalLinkQueryParams = queryString.parseUrl(originalLink).query || '';
    const transformedLinkQueryParams = queryString.parseUrl(link).query || '';

    return Object.keys(originalLinkQueryParams).length !== Object.keys(transformedLinkQueryParams).length;
  }

  renderContent(title) {
    const { showAlert, config } = this.props;
    const { isShowInput, isShowOutput, cloudimg_token, projectDomains } = config;
    const { isVisibleUploader, isLoading, isImage, originalLink, builderProps, galleryPath, t } = this.state;

    const originalLinkPath = this.getOriginalLinkPath(originalLink);

    if (!config.cloudimg_token || isLoading) {
      return <Loader lg />;
    }

    if (!isImage) {
      return (
        <Fragment>
          <div className="fixed-container">
            <h3 className="text-center">{title}</h3>
          </div>
          <div className="scrollable-container">
            <CDNizedUrl t={t} url={originalLink} path={originalLinkPath} />
          </div>
        </Fragment>
      );
    }

    return (
      <div
        className="scrollable-container"
        key={this.state.urlUploaderProcessIndex}
        style={{ padding: 5 }}
      >
        {isShowInput &&
        <StepWrapper step="1" title={title}>
          <URLBuilderInput
            t={t}
            link={originalLink}
            openGallery={this.openGallery}
            onChangeOriginalImage={this.onChangeOriginalImage}
          />
        </StepWrapper>}

        <StepWrapper step="2" title={t.titles['TITLE_STEP_2']}>
          {originalLink && config.cloudimg_token &&
          <UrlImageBuilder
            {...{
              t,
              isShowInput,
              cloudimg_token,
              projectDomains,
              updateResultLink: this.updateResultLink,
              path: originalLinkPath
            }}
          />}
        </StepWrapper>

        {builderProps.link && this.isImageTransformed(originalLink, builderProps.link) && isShowOutput &&
        <StepWrapper step="3" title={t.titles['TITLE_STEP_3']}>
          <URLBuilderOutput {...{ t, builderProps, showAlert }} />
        </StepWrapper>}

        {isVisibleUploader &&
        <ImageUploaderModal
          config={{
            modules: ['MY_GALLERY'],
            initialTab: 'MY_GALLERY',
            //uploadParams: { dir: galleryPath },
            filerobotUploadKey: config.airstore_key,
            container: config.airstore_subdomain,
            folderBrowser: true,
            preUploadImageProcess: false,
            myGallery: { upload: false }
          }}
          opened={isVisibleUploader}
          airstore_subdomain={config.airstore_subdomain}
          airstore_key={config.airstore_key}
          onFilesUpload={(files) => { this.setUrl(files[0]); }}
          onClose={() => this.setState({ isVisibleUploader: false })}
        />}

        {isLoading && <Loader lg />}
      </div>
    );
  }
}

export default URLBuilder;