import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  color: '#402E80',
});

const Hint = styled.div({
  marginTop: 16,
  fontSize: 13,
  fontWeight: 300,
  color: 'grey',
});

const Loader = ({ withoutContainer, isShown, containerClassName, sm, md, lg, hint }) => {
  const style = {};

  if (lg) {
    style.fontSize = 40;
  } else if (md) {
    style.fontSize = 24;
  }

  const loader = <i className="pe-7s-refresh-2 sfx-spin" style={style}/>;

  if (!isShown) return null;

  if (withoutContainer) return loader;

  return (
    <Container className={containerClassName || ''}>
      {loader}
      {hint && <Hint>{hint}</Hint>}
    </Container>
  );
};

Loader.defaultProps = {
  withoutContainer: false,
  isShown: true,
  containerClassName: "center-loader",
  sm: false,
  lg: false,
  hint: null,
};

Loader.propTypes = {
  withoutContainer: PropTypes.bool,
  isShown: PropTypes.bool,
  containerClassName: PropTypes.string,
  sm: PropTypes.bool,
  md: PropTypes.bool,
  lg: PropTypes.bool,
  hint: PropTypes.any,
};

export default Loader;
