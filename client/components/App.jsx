import React from 'react';
import SearchBox from './SearchBox.jsx';

export default class App extends React.Component {
    render() {
        let style = {
            textAlign: "center",
            display: "flex"
        };
        let gutter = (<div style={{flex: 1}} />)
        return (
            <div style={style}>
                {gutter}
                <div style={{flex: 1}}>
                    <h1><img src="holder.js/30x30"/> cookbook</h1>
                    <SearchBox/>
                </div>
                {gutter}
            </div>);
    }
}
