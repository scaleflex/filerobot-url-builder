import React from 'react';
import PropTypes from 'prop-types';
import { cropOperationGravityOptions } from './constants';

function CropGravity(props) {
  const { value, onChange, t } = props;

  const _onChange = ({ target: { value } }) => {
    if (typeof onChange === 'function') {
      onChange(value);
    }
  }

  return (
    <label>
      {t.builder['GRAVITY']}
      <select
        className='multi-select'
        onChange={_onChange}
        value={value}
      >
        {cropOperationGravityOptions.map(optionName =>
          <option key={optionName}>
            {t.cropOperationGravityOptions[optionName.toUpperCase().replace(/\s/gi, '_')]}
          </option>
        )}
      </select>
    </label>
  );
}

CropGravity.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

export default CropGravity;