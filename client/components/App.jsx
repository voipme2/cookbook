import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import SearchBox from './SearchBox.jsx';
import ViewRecipe from './ViewRecipe.jsx';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {recipe: null};
        this.selectRecipe = this.selectRecipe.bind(this);
    }

    selectRecipe({recipe}) {
        this.setState({recipe: recipe});
    }

    render() {
        return (
            <Router>
                <div className="row">
                    <div className="center-xs col-xs-8 col-xs-offset-2">
                        <div className="box">
                            <h1><img src="holder.js/30x30"/> cookbook</h1>
                            <SearchBox selectRecipe={this.selectRecipe}/>
                        </div>
                        <Route path="/view/:id" component={ViewRecipe}/>
                    </div>
                </div>
            </Router>);
    }
}
