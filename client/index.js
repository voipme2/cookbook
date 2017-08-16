import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import 'holderjs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';


import 'flexboxgrid';

injectTapEventPlugin();

const CookbookApp = () => (
    <MuiThemeProvider>
        <App />
    </MuiThemeProvider>
);

ReactDOM.render(<CookbookApp />, document.getElementById('root'));
