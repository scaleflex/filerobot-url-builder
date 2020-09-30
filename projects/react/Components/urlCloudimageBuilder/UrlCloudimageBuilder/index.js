import React, { Component, Fragment } from 'react';
import { debounce } from 'throttle-debounce';
import queryString from 'query-string';
import Spinner from './components/Spinner';
import {
  guid,
  JpegQualityFieldProcessor,
  RoundedCornersFieldProcessor,
  transformLink,
  isHex
} from '../utils';
import './index.css';
import CropGravity from './components/SubOperations/CropGravity';
import { CENTER } from './components/SubOperations/CropGravity/constants';
import {
  operations, filters, CONTRAST, BRIGHTNESS,
  GREYSCALE, PIXELATE, BLUR, SHARPEN, ROUNDED_CORNERS,
  TRIM, OPTIPRESS_MODE, ROTATE, JPEG_QUALITY, FORCE_PNG,
  FORCE_WEBP, WIDTH, HEIGHT, CROP, COVER, FIT, BOUND,
  CROP_PX, CDN, BACKGROUND_COLOR
} from './constants';
import url from "url";


const defaultGallery = [
  'https://cdn.scaleflex.it/colors.jpg',
  'https://cdn.scaleflex.it/scenery.jpg'
];

class UrlCloudimageBuilder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      token: 'demo',
      link: '',
      activeOperation: WIDTH,
      secondaryOperations: [],
      [WIDTH]: '1000',
      [HEIGHT]: '',
      cropGravityValue: CENTER,
      fitFitBackgroundImageValue: '',
      fitBackgroundBlurValue: '',
      fitBackgroundOpacityValue: '',
      [BACKGROUND_COLOR]: '402E80',
      fitBackgroundColouriseValue: '',
      X1Value: '',
      Y1Value: '',
      X2Value: '',
      Y2Value: '',
      currentFilters: [{ name: '', value: '' }],
      imageSize: null,
      isWidthNotValid: false,
      isHeightNotValid: false,
      isColorNotValid: false,
      isLinkEditing: false,
      activeImage: props.path,
      gallery: [],
    };
  }

  componentDidMount() {
    this.initGallery();
    this.updateToken();
    this.updateGallery();
  }

  initGallery = () => {
    const externalGallery = this.props.demoImages || defaultGallery;
    this.setState({ gallery: externalGallery });
  };

  updateToken = () => {
    const { cloudimg_token } = this.props;

    if (cloudimg_token && this.state.token !== cloudimg_token) {
      this.setState({ token: cloudimg_token }, () => this.updateLink());
    }
  };

  updateGallery = () => {
    const initialWidthValue = parseInt(this._imageWrapper.clientWidth * 0.8, 10);

    this.setState({
      [WIDTH]: initialWidthValue,
      isLoading: true
    }, () => {
      this.updateLink();
      this.updateHeightOfImageWrapper();
    });
  };

  updateHeightOfImageWrapper = () => {
    const oldControlsWrapperHeight = this._controlsWrapper.offsetHeight;
    this._controlsWrapper.style.height = 'auto';
    const newControlsWrapperHeight = this._controlsWrapper.offsetHeight;

    const imageWrapperWidth = parseInt(this._imageWrapper.clientWidth, 10);
    const controlsHeight = this._controlsWrapper.offsetHeight;

    if (oldControlsWrapperHeight >= newControlsWrapperHeight)
      this._imageWrapper.style.height = newControlsWrapperHeight + 'px';

    if (window.innerWidth > 991) {
      if (controlsHeight >= this._imageWrapper.offsetHeight)
        this._imageWrapper.style.height = controlsHeight + 'px';
      else {
        this._controlsWrapper.style.height = this._imageWrapper.offsetHeight + 'px';
      }
    } else {
      this._imageWrapper.style.height = imageWrapperWidth * (9 / 16) + 'px';
    }
  };

  setValue = (name, target, type) => {
    const value = type === 'checkbox' ? +target.checked : target.value;
    const { isWidthNotValid, isHeightNotValid, isColorNotValid } = this.state;
    this.setState({ isLoading: true, [name]: value });

    if (/width/gmi.test(name) && !(parseInt(value) > 0)) {
      this.setState({ isWidthNotValid: true, isLoading: false });
      return;
    } else if (/height/gmi.test(name) && !(parseInt(value) > 0)) {
      this.setState({ isHeightNotValid: true, isLoading: false });
      return;
    } else if (/background_color/gmi.test(name) && !isHex(value)) {
      this.setState({ isColorNotValid: true, isLoading: false });
      return;
    } else {
      if (isWidthNotValid || isHeightNotValid || isColorNotValid)
        this.setState({ isWidthNotValid: false, isHeightNotValid: false, isColorNotValid: false });
    }

    this.updateLinkWithDebounce();
  };

  updateLinkWithDebounce = debounce(350, () => { this.updateLink(); });

  onAddFilter = (event) => {
    event.preventDefault();
    const { currentFilters } = this.state;

    currentFilters.push({ name: '', value: '' });
    this.setState({ currentFilters }, () => {
      this.updateHeightOfImageWrapper();
    });
  };

  onRemoveFilter = (index) => {
    const { currentFilters } = this.state;

    currentFilters.splice(index, 1);
    this.setState({ currentFilters, isLoading: true }, () => {
      this.updateLinkWithDebounce();
      this.updateHeightOfImageWrapper();
    });
  };

  areParamsValid = (...params) => params.length > 0 && params.some(p => !p && p !== 0) === false;

  get size() {
    const {
      activeOperation, secondaryOperations,
      trimCutValue, rotateAngleValue,
      [WIDTH]: widthValue, [HEIGHT]: heightValue,
    } = this.state;
    const queryObj = {};

    if (activeOperation === CROP || activeOperation === COVER || activeOperation === FIT || activeOperation === BOUND) {
      const { cropGravityValue } = this.state;
      if (this.areParamsValid(widthValue, heightValue)) {
        queryObj.w = widthValue;
        queryObj.h = heightValue;
        queryObj.gravity = cropGravityValue !== CENTER && activeOperation === CROP ? cropGravityValue : undefined;
      }
    }
    if (activeOperation === ROTATE || secondaryOperations.includes(ROTATE)) {
      queryObj.r = rotateAngleValue;
    }
    if (activeOperation === TRIM || secondaryOperations.includes(TRIM)) {
      queryObj.trim = trimCutValue;
    }
    // if (activeOperation === CROP_PX) {
    //   value = this.getCropPxLink(activeOperation);
    // }
    if (activeOperation === HEIGHT && this.areParamsValid(heightValue)) {
      queryObj.h = heightValue;
    }
    if (activeOperation !== CDN && activeOperation !== HEIGHT) {
      if (this.areParamsValid(widthValue)) {
        queryObj.w = widthValue;
      }
    }

    return queryString.stringify(queryObj);
  }

  updateLink = () => {
    const {
      activeOperation, currentFilters,
      isHeightNotValid, isWidthNotValid
    } = this.state;
    if (isHeightNotValid || isWidthNotValid) return;

    const link = this.getLink(this.size);
    //const color = `c${fitBackgroundColorValue}`;
    //const filters = fitBackgroundColorValue ? color : currentFilters.length ? this.getFiltersValue() : 'n';

    new Promise((resolve, reject) => {
      this.setSizeOfImage(link);
      resolve();
    })
      .then(() => {
        this.setState({ link, isLoading: false }, () => {
          this.props.updateResultLink({
            link,
            size: this.size,
            filters: this.filters,
            operation: this.operation,
            color: this.bgProps,
            activeOperation,
            currentFilters,
          });
        });
      })
  };

  setSizeOfImage = (url) => {
    const self = this;
    let blob = null;
    const xhr = new XMLHttpRequest();

    this.setState({ imageSize: null });

    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      blob = xhr.response;
      if (self.state.link === url) {
        this.setState({ imageSize: blob.size });
      }
    };
    xhr.send();
  };

  get bgProps() {
    const { fitBackgroundOpacityValue, activeOperation, currentFilters,
      fitBackgroundBlurValue, fitBackgroundColouriseValue, fitFitBackgroundImageValue,
      [BACKGROUND_COLOR]: bg_color, secondaryOperations
    } = this.state;
    const isRoundedCornersFilter = currentFilters.some(filter => filter.name === 'rounded corners');
    const queryObj = {};

    if (activeOperation === FIT) {
      if (bg_color) { queryObj.bg_colour = bg_color; }
      if (fitBackgroundOpacityValue) { queryObj.bg_opacity = fitBackgroundOpacityValue; }
      if (fitBackgroundBlurValue) { queryObj.bg_blur = fitBackgroundBlurValue; }
      if (fitBackgroundColouriseValue) { queryObj.bg_colourise = fitBackgroundColouriseValue; }
      if (fitFitBackgroundImageValue) { queryObj.bg_img_fit = fitFitBackgroundImageValue; }
    }
    else if (activeOperation === ROTATE || secondaryOperations.includes(ROTATE) || isRoundedCornersFilter) {
      if (bg_color) { queryObj.bg_colour = bg_color; }
    }

    return queryString.stringify(queryObj);;
  }

  getLink = (size) => {
    const { projectDomains, cloudimg_token } = this.props;
    const { activeImage } = this.state;

    const search = [
      this.operation ? this.operation : '',
      `&${size}`,
      this.filters ? `&${this.filters}` : '',
      this.bgProps ? `&${this.bgProps}` : '',
      //`&v=${guid()}`
    ].join('');

    const link = url.format({
      protocol: 'https',
      hostname: projectDomains.cdn,
      pathname: activeImage,
      search
    });

    return transformLink({
      link,
      projectDomains,
      token: cloudimg_token,
    });
  };

  get filters() {
    const { currentFilters } = this.state;

    return currentFilters.map(({ name, value }) => this.getFilterValue(name, value)).join('&');
  }

  get operation() {
    const { activeOperation, cropGravityValue } = this.state;
    const queryObj = {};

    switch (activeOperation) {
      case COVER:
      case BOUND:
      case FIT:
        queryObj.func = activeOperation;
        break;
      case CROP:
        if (cropGravityValue !== CENTER) {
          queryObj.func = CROP;
        }
        break;
      default:
        return '';
    }

    return queryString.stringify(queryObj);
  }

  getFilterValue = (name, value) => {
    switch (name) {
      case CONTRAST:
        return `contrast=${value}`;
      case BRIGHTNESS:
        return `bright=${value}`;
      case GREYSCALE:
        return `grey=1`;
      case PIXELATE:
        return `pixelate=${value}`;
      case BLUR:
        return `blur=${value}`;
      case SHARPEN:
        return `sharp=${value}`;
      case ROUNDED_CORNERS:
        return `radius=${value}`;
      case JPEG_QUALITY:
        return `force_format=jpeg&q=${value}`;
      case OPTIPRESS_MODE:
        return `force_format=jpeg&optipress=${value}`;
      case FORCE_PNG:
        return `force_format=png`;
      case FORCE_WEBP:
        return `force_format=webp`;
      default:
        return '';
    }
  };

  getCropPxLink = (op) => {
    return [
      `${this.state[op + 'X1Value']},`,
      `${this.state[op + 'Y1Value']},`,
      `${this.state[op + 'X2Value']},`,
      `${this.state[op + 'Y2Value']}-`,
      `${this.state[op + 'WidthValue']}x`,
      `${this.state[op + 'HeightValue']}`
    ].join('');
  };

  resetParams = () => {
    this.setState({
      currentFilters: [{ name: '', value: '' }],
      activeOperation: WIDTH,
      secondaryOperations: [],
    }, () => {
      this.updateLink();
      this.updateHeightOfImageWrapper();
      this.setState({ isLoading: false })
    });
  };

  onImageLoad = (image) => {
    this.setState({
      isLoading: false,
      naturalHeight: image.naturalHeight,
      naturalWidth: image.naturalWidth
    });
  };

  bytesToSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  onChangeOperation = ({ target }) => {
    const stateObj = { activeOperation: target.value };
    let callback;

    if (target.value === WIDTH) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.8);
    }
    else if (target.value === HEIGHT) {
      stateObj[HEIGHT] = parseInt(this._imageWrapper.clientWidth * 0.7 * (9 / 16));
    }
    else if (target.value === CROP) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.8);
      stateObj[HEIGHT] = parseInt(this._imageWrapper.clientWidth * 0.8 * (9 / 16));
    }
    else if (target.value === COVER) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.7);
      stateObj[HEIGHT] = parseInt(this._imageWrapper.clientWidth * 0.7 * (9 / 16));
    }
    else if (target.value === FIT) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.9);
      stateObj[HEIGHT] = parseInt(this._imageWrapper.clientWidth * 0.7 * (9 / 16));
    }
    else if (target.value === BOUND) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.6);
      stateObj[HEIGHT] = parseInt(this._imageWrapper.clientWidth * 0.9);
    }
    else if (target.value === TRIM) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.9);
      stateObj.trimCutValue = this.getOperationDefaultValue(target.value);
      callback = () => {
        this.addSecondaryOperation(target.value);
      }
    }
    else if (target.value === ROTATE) {
      stateObj[WIDTH] = parseInt(this._imageWrapper.clientWidth * 0.6);
      stateObj.rotateAngleValue = 15;
      callback = () => {
        this.addSecondaryOperation(target.value);
      }
    }

    stateObj.isWidthNotValid = false;
    stateObj.isHeightNotValid = false;

    this.setState(stateObj, () => {
      if (typeof callback === 'function') {
        callback();
      }

      this.updateLink();
      this.updateHeightOfImageWrapper();
    })
  };

  onChangeFilterType = (index, name) => {
    const { currentFilters } = this.state;

    currentFilters[index].name = name;
    currentFilters[index].value = this.getFilterDefaultValue(name);

    this.setState({ currentFilters, isLoading: true });
    this.updateLinkWithDebounce();
  };

  onChangeFilterValue = (index, value) => {
    const { currentFilters } = this.state;

    currentFilters[index].value = value;

    this.setState({ currentFilters, isLoading: true });
    this.updateLinkWithDebounce();
  };

  onChangeActiveImage = (url) => {
    this.setState({ activeImage: url });
    setTimeout(() => { this.updateLink(); });
  };

  render() {
    const { t } = this.props;
    const { isLoading, imageSize, naturalWidth, naturalHeight, link, activeImage } = this.state;
    this.primaryOperationProps = {};
    this.secondaryOperationsProps = {};

    return (
      <div className="j-section-demo row">

        <div className="ci-demo-controls-wrapper">
          <div className="col-lg-4 col-md-12 controls">
            <h4><span>{t.builder['CHANGE_PARAMS_HERE']}:</span></h4>
            {this.renderControls()}
          </div>
          <div className="col-lg-8 col-md-12 result">
            <h4>
              <div style={{ display: 'inline-block', width: 'calc(100% - 200px)' }}>
                <span>{t.builder['RESIZED_IMAGE']}:</span>
              </div>
              <div style={{ display: 'inline-block', width: 200, textAlign: 'right', fontSize: 16 }}>
                {imageSize && <span>{this.bytesToSize(imageSize)}</span>}
                {imageSize && naturalHeight && <span> | </span>}
                {naturalHeight && <span>{naturalWidth} x {naturalHeight}</span>}
              </div>
            </h4>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              ref={node => this._imageWrapper = node}
            >
              {activeImage && link &&
              <img
                src={link}
                style={isLoading ? { opacity: 0.4 } : { opacity: 1 }}
                onLoad={(event) => { this.onImageLoad(event.target); }}
                onError={() => { this.setState({ isLoading: false }); }}
                alt="sample"
              />}

              <Spinner show={isLoading} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderControls = () => {
    const { t, isShowInput } = this.props;
    const { gallery, activeImage } = this.state;

    return (
      <form
        className='controls-wrapper'
        ref={node => this._controlsWrapper = node}
        onSubmit={() => { }}
      >
        {this.renderOperationsSection()}

        <div className='filter'>
          {this.renderUserSelectedFilters()}
          <button
            type="button"
            className='filter-button'
            onClick={(event) => this.onAddFilter(event)}
          >+ {t.builder['ADD_FILTER']}
          </button>
        </div>

        {!isShowInput &&
        <div className='url' style={{ color: '#697689', textAlign: 'left' }}>
          <span>{t.builder['ORIGINAL_IMG_URL']}</span>
          <div style={{ color: '#333', paddingTop: 5 }}>
            {gallery.map(url => (
              <label key={url} className="j-original-image-label" htmlFor={url} style={{ cursor: 'pointer' }}>
                <input
                  id={url}
                  name={url}
                  type="radio"
                  checked={url === activeImage}
                  value={url}
                  onChange={() => { this.onChangeActiveImage(url) }}
                />
                <span
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 'calc(100% - 25px)'
                  }}>{url}</span>
              </label>
            ))}
            <input
              style={{ width: '100%', padding: '0 10px', marginTop: 10 }}
              type="text"
              value={activeImage}
              onChange={({ target }) => { this.onChangeActiveImage(target.value) }}
              placeholder={t.builder['PAST_YOUR_OWN_IMG_URL']}
            />
          </div>
        </div>}

        <button type="button" className="j-section-demo-reset-btn" onClick={this.resetParams}>
          {t.builder['RESET_ALL']}
        </button>
        <a
          href="https://docs.cloudimage.io/go/cloudimage-documentation-v7/en/introduction"
          className="j-section-demo-documentation-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.builder['CLICK_HERE_TO_SEE_THE_DOC']}
        </a>
      </form>
    );
  };

  renderOperationsSection = () => {
    const { t } = this.props;
    const { activeOperation } = this.state;

    return (
      <div>
        <div className='operation'>
          <span className='title' style={{ color: '#ff8a65' }}>
            {t.builder['OPERATION']}
          </span>
          <div className='multi-select-wrap'>
            <select
              className='multi-select'
              onChange={this.onChangeOperation}
              value={activeOperation}
            >
              <option key="select-operation" value="" disabled>
                - {t.builder['SELECT_OPERATION']} -
              </option>
              {operations.map((operation, index) => (
                <option key={`option-${index}`} value={operation}>
                  {t.operations[operation.toUpperCase().replace(/\s/gi, '_')]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='size'>
          <span className='title' style={{ color: '#f47373', marginBottom: 10 }}><Translate i18nKey="URL_BUILDER.SIZE_PX" defaultValue="size (px)" /></span>
          <div className='operation-params'>
            {this.renderActiveOperation(activeOperation)}
            {this.renderSecondaryOperations()}
          </div>
        </div>
      </div>
    );
  };

  addCropOperationContent = () => {
    const { t } = this.props;
    const { cropGravityValue } = this.state;

    const onCropGravityChange = (value) => {
      this.setState({ cropGravityValue: value }, () => {
        this.updateLink();
      });
    }

    this.primaryOperationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: CROP, stateKey: WIDTH });
    this.primaryOperationProps[HEIGHT] = this.renderOperation({ label: HEIGHT, operation: CROP, stateKey: HEIGHT });
    this.primaryOperationProps['CROP_GRAVITY'] = (
      <CropGravity
        t={t}
        value={cropGravityValue}
        onChange={onCropGravityChange}
      />
    );
  }

  renderActiveOperation = (activeOperation) => {
    switch (activeOperation) {
      case WIDTH:
        this.primaryOperationProps[WIDTH] = this.renderOperation({ label: WIDTH, stateKey: WIDTH });
        break;
      case HEIGHT:
        this.primaryOperationProps[HEIGHT] = this.renderOperation({ label: HEIGHT, stateKey: HEIGHT });
        break;
      case CROP:
        this.addCropOperationContent();
        break;
      case COVER:
        this.primaryOperationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: COVER, stateKey: WIDTH });
        this.primaryOperationProps[HEIGHT] = this.renderOperation({ label: HEIGHT, operation: COVER, stateKey: HEIGHT });
        break;
      case FIT:
        this.primaryOperationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: FIT, stateKey: WIDTH });
        this.primaryOperationProps[HEIGHT] = this.renderOperation({ label: HEIGHT, operation: FIT, stateKey: HEIGHT });

        if (!this.primaryOperationProps[BACKGROUND_COLOR]) {
          this.primaryOperationProps[BACKGROUND_COLOR] = this.renderOperation({
            label: 'Background Color',
            operation: FIT,
            type: 'text',
            placeholder: 'Hex code(e.g. FF5733) or name (red)',
            stateKey: BACKGROUND_COLOR
          });
        }

        this.primaryOperationProps['Background Opacity'] = this.renderOperation({
          label: 'Background Opacity',
          operation: FIT, type: 'number',
          placeholder: 'Between 0 and 1'
        });

        this.primaryOperationProps['Background Blur'] = this.renderOperation({
          label: 'Background Blur',
          operation: FIT,
          type: 'number',
          placeholder: 'Set the radius of the Gaussian blur'
        });

        this.primaryOperationProps['Background Colourise'] = this.renderOperation({
          label: 'Background Colourise',
          operation: FIT,
          type: 'text',
          placeholder: 'Color to tint the background'
        });

        this.primaryOperationProps['Fit Background Image'] = this.renderOperation({
          label: 'Fit Background Image',
          operation: FIT,
          type: 'checkbox'
        });
        break;
      case BOUND:
        this.primaryOperationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: BOUND, stateKey: WIDTH });
        this.primaryOperationProps[HEIGHT] = this.renderOperation({ label: HEIGHT, operation: BOUND, stateKey: HEIGHT });
        break;
      case CROP_PX:
        this.primaryOperationProps['x1'] = this.renderOperation({ label: 'x1', operation: CROP_PX });
        this.primaryOperationProps['y1'] = this.renderOperation({ label: 'y1', operation: CROP_PX });
        this.primaryOperationProps['x2'] = this.renderOperation({ label: 'x2', operation: CROP_PX });
        this.primaryOperationProps['y1'] = this.renderOperation({ label: 'y1', operation: CROP_PX });
        this.primaryOperationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: CROP_PX, stateKey: WIDTH });
        this.primaryOperationProps[HEIGHT] = this.renderOperation({ label: HEIGHT, operation: CROP_PX, stateKey: HEIGHT });
        break;
      default:
    }

    return this.renderOperationProps(this.primaryOperationProps, 'primary');
  };

  addSecondaryOperation = (operationName) => {
    const { secondaryOperations } = this.state;
    if (secondaryOperations.includes(operationName)) { return; }
    this.setState({ secondaryOperations: [...secondaryOperations, operationName] });
  }

  removeSecondaryOperation = (operationName) => {
    this.setState(
      { secondaryOperations: this.state.secondaryOperations.filter(opName => opName !== operationName) },
      () => {
        this.updateLink();
        this.updateHeightOfImageWrapper();
      });
  }

  renderCloseSecondaryOperationButton = (operationName) => (
    <div className="j-section-demo-filter-cross" onClick={() => { this.removeSecondaryOperation(operationName) }}>⨉</div>
  )

  renderSecondaryOperations = () => {
    const { t } = this.props;
    const { secondaryOperations, activeOperation } = this.state;

    const _getSecondaryOperationProps = (operationName) => {
      const operationProps = {};
      switch (operationName) {
        case ROTATE:
          if (!this.primaryOperationProps[WIDTH] && !this.secondaryOperationsProps[WIDTH]) {
            operationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: ROTATE, stateKey: WIDTH });
          }
          operationProps['Angle'] = this.renderOperation({ label: 'Angle', operation: ROTATE });
          operationProps[BACKGROUND_COLOR] = this.renderOperation({ label: 'Background Color', operation: ROTATE, type: 'text', stateKey: BACKGROUND_COLOR });
          break;
        case TRIM:
          if (!this.primaryOperationProps[WIDTH] && !this.secondaryOperationsProps[WIDTH]) {
            operationProps[WIDTH] = this.renderOperation({ label: WIDTH, operation: TRIM, stateKey: WIDTH });
          }
          operationProps['Cut'] = this.renderOperation({ label: 'Cut', operation: TRIM });
          break;
        default:
          operationProps[operationName] = this.renderOperation({ label: operationName, operation: oResized imageperationName });
          break;
      }

      return operationProps;
    }

    return secondaryOperations.map(operationName => {
        const secondaryOperationProps = _getSecondaryOperationProps(operationName)
        this.secondaryOperationsProps = { ...this.secondaryOperationsProps, ...secondaryOperationProps };

      return (
        <div className="secondary-operation" key={`sec-${operationName}`}>
          <div className="operation-header">
            <span className='title' style={{ color: '#f47373' }}>
              <Translate i18nKey={`URL_BUILDER.OPERATION.${operationName}`} defaultValue={operationName} />
            </span>
            {activeOperation !== operationName && this.renderCloseSecondaryOperationButton(operationName)}
          </div>

          {this.renderOperationProps(secondaryOperationProps, 'secondary')}
        </div >
      )
      }
    )
  }

  /**
   * @param {Object} operationProps
   * @param {String} identifier
   */
  renderOperationProps = (operationProps, identifier) => {
    return (
      <div className="active-operation">
        {Object.keys(operationProps).map(key => <Fragment key={`${identifier}-${key}`}>{operationProps[key]}</Fragment>)}
      </div>
    )
  }

  /**
   * @param {Object} params
   * @param {String} params.name
   * @param {String} params.operation
   * @param {String} params.type
   * @param {String} params.placeholder
   * @param {String} params.stateKey
   */
  renderOperation = ({ label = '', operation = '', type = 'number', placeholder = '', stateKey = '' }) => {
    const preparedName = stateKey || `${operation}${label.split(' ').join('')}Value`;
    const isWidthOperation = /width/gmi.test(preparedName);
    const isHeightOperation = /height/gmi.test(preparedName);
    const isColorOperation = /color/gmi.test(preparedName);
    const { isWidthNotValid, isHeightNotValid, isColorNotValid } = this.state;
    const isNotValid =
      (isWidthOperation && isWidthNotValid) ||
      (isHeightOperation && isHeightNotValid) ||
      (isColorNotValid && isColorOperation);

    return (
      <label>
        {label.toLowerCase()}
        <input
          style={isNotValid ? { outline: '1px solid #e81414' } : {}}
          type={type}
          value={this.state[preparedName]}
          checked={this.state[preparedName]}
          onChange={({ target }) => this.setValue(preparedName, target, type)}
          placeholder={placeholder || ''}
          className={type === 'text' ? 'bg-property' : ''}
        />
        {isNotValid && <div style={{ color: '#e81414' }}>not valid value</div>}
      </label>
    );
  };

  getFilterDefaultValue = (name) => {
    switch (name) {
      case CONTRAST:
        return 50;
      case BRIGHTNESS:
        return 50;
      case GREYSCALE:
        return true;
      case PIXELATE:
        return 5;
      case BLUR:
        return 5;
      case SHARPEN:
        return 4;
      case ROUNDED_CORNERS:
        return 35;
      case JPEG_QUALITY:
        return 75;
      case ROTATE:
        return 90;
      case OPTIPRESS_MODE:
        return 2;
      case FORCE_PNG:
        return true;
      case FORCE_WEBP:
        return true;
      default:
        return 50;
    }
  };

  getOperationDefaultValue = (name) => {
    switch (name) {
      case TRIM:
        return 15;
      default:
        return 50;
    }
  };

  renderActiveFilter = (index, filter) => {
    switch (filter.name) {
      case CONTRAST:
        return this.renderFilter({ index, filter, maxValue: 100 });
      case BRIGHTNESS:
        return this.renderFilter({ index, filter, maxValue: 255 });
      case GREYSCALE:
        return this.renderFilter({ index, filter, maxValue: '', minValue: '', type: 'checkBox' });
      case PIXELATE:
        return this.renderFilter({ index, filter, maxValue: 100 });
      case BLUR:
        return this.renderFilter({ index, filter, maxValue: 100 });
      case SHARPEN:
        return this.renderFilter({ index, filter, maxValue: 4 });
      case ROUNDED_CORNERS:
        return this.renderFilter({ index, filter, type: 'text', transformValue: RoundedCornersFieldProcessor });
      case TRIM:
        return this.renderFilter({ index, filter, maxValue: 100 });
      case OPTIPRESS_MODE:
        return this.renderFilter({ index, filter, maxValue: 3 });
      case ROTATE:
        return this.renderFilter({ index, filter, maxValue: null });
      case JPEG_QUALITY:
        return this.renderFilter({ index, filter, maxValue: 100, transformValue: JpegQualityFieldProcessor });
      case FORCE_PNG:
        return this.renderFilter({ index, filter, maxValue: '', minValue: '', type: 'checkBox' });
      case FORCE_WEBP:
        return this.renderFilter({ index, filter, maxValue: '', minValue: '', type: 'checkBox' });
      default:
        return this.renderFilter({ index });
    }
  };

  /**
   * @param {Object} params
   * @param {Number} params.index
   * @param {Number} params.maxValue
   * @param {Number} params.minValue
   * @param {String} params.type
   * @param {Function} params.transformValue
   */
  renderFilter = ({ index, filter = {}, maxValue = 255, minValue = 0, type = 'number', transformValue }) => {
    const { value = '' } = filter;

    const _onChange = ({ target: { checked, value } }) => {
      const _value = typeof transformValue === 'function' ? transformValue(value) : value;
      this.onChangeFilterValue(index, type === 'checkBox' ? checked : _value);
    }

    return (
      <input
        type={type}
        value={value}
        checked={value}
        style={type === 'checkBox' ? { visibility: 'hidden' } : {}}
        onChange={_onChange}
        placeholder={type === 'checkBox' ? '' : `${minValue}...${maxValue}`}
        min={type === 'checkBox' ? '' : minValue}
        max={type === 'checkBox' ? '' : maxValue}
      />
    );
  };

  renderUserSelectedFilters = () => {
    const { t } = this.props;
    const { currentFilters } = this.state;
    const availableFilters = filters
      .filter((item) => !currentFilters.find((currentFilter) => currentFilter.name === item));

    return currentFilters.map((filter, index) => {
      const { name = '' } = filter;
      return (
        <label key={`current-filter-${index}`} style={{ width: '100%' }}>
          <span className='title' style={{ color: '#2ccce4' }}>
            {index === 0 && <Translate i18nKey="FILTERS" defaultValue="filters" />}
          </span>

          <div className='multi-select-wrap' style={{ marginBottom: 5 }}>
            <select
              className='multi-select'
              value={name}
              onChange={({ target }) => { this.onChangeFilterType(index, target.value); }}
            >
              <option key="select-filter" value="" disabled>- {t.builder['SELECT_FILTER']} -</option>

              {filter && filter.name &&
              <option key={`filter-selected`} value={filter.name}>{filter.name}</option>}

              {availableFilters
                .map((filter, index) =>
                  <option key={`filter-${index}`} value={filter}>
                    {t.filters[filter.toUpperCase().replace(/\s/gi, '_')]}
                  </option>)}
            </select>

            <div className='active-filter'>
              {this.renderActiveFilter(index, filter)}
            </div>

            <div className="j-section-demo-filter-cross" onClick={() => { this.onRemoveFilter(index); }}>⨉</div>
          </div>

          {
            filter.name === 'rounded corners'
            &&
            !this.primaryOperationProps[BACKGROUND_COLOR] && !this.secondaryOperationsProps[BACKGROUND_COLOR]
            &&
            <div>
              <label key={`padding-color`} style={{ width: '100%' }}>
                <span className='title' style={{ color: '#f47373' }}>
                  {t.builder['BACKGROUND_COLOR']}
                </span>

                <input
                  type='text'
                  value={this.state[BACKGROUND_COLOR]}
                  onChange={({ target }) => this.setValue(BACKGROUND_COLOR, target)}
                  placeholder={'Hex code (FF5733) or name (red)'}
                  className="multi-select-wrap"
                />
              </label>
            </div>}
        </label>
      );
    });
  };
}

export default UrlCloudimageBuilder;
