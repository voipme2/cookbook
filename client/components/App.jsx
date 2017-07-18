import React from 'react';
import SearchBox from './SearchBox.jsx';

export default class App extends React.Component {
  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>Hello World</h1>
          <SearchBox />
      </div>);
  }
}
