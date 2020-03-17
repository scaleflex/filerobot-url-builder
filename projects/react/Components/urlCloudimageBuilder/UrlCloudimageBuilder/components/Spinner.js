import React from 'react';


const Spinner = (props) => {
  if (!props.show) return null;

  return (
    <div>
      <div className="j-section-demo-spinner-overlay"/>
      <div className="j-section-demo-spinner"/>
    </div>
  )
};

export default Spinner;