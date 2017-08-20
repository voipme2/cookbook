import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Home from './Home.jsx';
import ViewRecipe from './ViewRecipe.jsx';
import ListRecipes from "./ListRecipes.jsx";
import EditRecipe from './EditRecipe.jsx';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {recipe: null, recipes: []};
    }

    componentWillMount() {
        let self = this;
        fetch("/api/recipes")
            .then(r => r.json())
            .then(r => self.setState({recipes: r}));
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/" render={(props) => <Home {...props} recipes={this.state.recipes}/>}/>
                    <Route path="/list" render={(props) => <ListRecipes {...props} recipes={this.state.recipes}/>}/>
                    <Route path="/edit/:id" render={(props) => <EditRecipe {...props} /> } />
                    <Route path="/view/:id" render={(props) => <ViewRecipe {...props} /> } />
                </Switch>
            </Router>
        );
    }
}
