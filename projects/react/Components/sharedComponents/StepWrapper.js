import React from 'react';
import styled from 'styled-components';


export default ({ step = '1', title = '', children, isContentHTML = false, className = '' }) => (
  <Wrapper className={className}>
    {/*<Step>{step}</Step>*/}

    {isContentHTML ?
      <Title dangerouslySetInnerHTML={{ __html: title }}/>
    :
      <Title>{title}</Title>}


    {children}
  </Wrapper>
);

const Wrapper = styled.div`
  position: relative;
  display: block;
  background-color: #F7F7FF;
  position: relative;
  //box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  //border-radius: 6px;
  padding: 40px;
  
  &:not(:last-of-type) {
    margin: 0 0 40px 0;
  }
`;

const Step = styled.span`
  position: absolute;
  top: -5px;
  left: -5px;
  background: #402E80;
  border-radius: 50%;
  color: #fff;
  width: 40px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 22px;
`;

const Title = styled.p.attrs(() => ({
  className: 'step-title'
}))`
  font-size: 18px;
`;