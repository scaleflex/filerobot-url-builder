import React, { Component } from 'react';
import FilerobotUploader from 'filerobot-uploader';


class ImageUploaderModal extends Component {
  onFilesUpload = (files = []) => {
    if (this.props.showLoader) this.props.showLoader();
    if (!files || !files.length) return;

    // save files
    if (this.props.onFilesUpload) this.props.onFilesUpload(files);

    this.close();
  };

  close = (...attrs) => {
    this.props.onClose && this.props.onClose(...attrs);
  };

  render() {
    const {
      initialTab = 'UPLOAD', config = {}, options = {}, opened, file = null,
      airstore_key, airstore_subdomain
    } = this.props;

    if (!airstore_key || !airstore_subdomain) {
      return null;
    }

    return (
      <FilerobotUploader
        opened={opened}
        file={file}
        options={options}
        config={{ ...config }}
        initialTab={initialTab}
        onClose={this.close}
        onUpload={this.onFilesUpload}
      />
    );
  }
}

export default ImageUploaderModal;