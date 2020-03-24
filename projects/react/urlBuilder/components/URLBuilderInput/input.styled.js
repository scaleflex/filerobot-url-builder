import styled from 'styled-components';


export const SelectFileWrapper = styled('div')`
  .input-group {
    position: relative;
    display: table;
    border-collapse: separate;
    
    .form-control {
      display: table-cell;
      position: relative;
      z-index: 2;
      float: left;
      width: 100%;
      margin-bottom: 0;
      height: 39px;
    }
    
    .output-field {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      overflow-x: scroll;
      padding: 10px 12px 8px 12px;
    }
  }
  
  .input-group .form-control:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  
  .input-group-btn {
    display: table-cell;
    position: relative;
    font-size: 0;
    white-space: nowrap;
    width: 1%;
    vertical-align: middle;
    border-collapse: separate;
    
    button {
      height: 39px;
      position: relative;
      z-index: 2;
      margin-left: -1px;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      overflow: hidden;
      line-height: 22px;
      
      :not(:last-child) {
        margin-right: 4px;
        border-radius: 4px;
      }
    }
  }
`;

export const InputGroup = styled(SelectFileWrapper)`
  input,
  .output-field {
    cursor: default !important;
    background: rgb(248, 248, 248) !important;
  }
  
  .editable-input {
    background-color: #fff !important;
  }
`;