import React from 'react';
import SearchBox from './SearchBox.jsx';
import {Link} from 'react-router-dom';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.selectRecipe = this.selectRecipe.bind(this);
    }

    selectRecipe({ id }) {
        this.props.history.push("/view/" + id);
    }

    render() {
        return (
            <div className="row">
                <div className="center-xs col-xs-8 col-xs-offset-2">
                    <div className="box">
                        <h1>cookbook</h1>
                        <span>Cooking up <Link to="/list">{this.props.recipes.length} recipes</Link></span>
                        <SearchBox selectRecipe={this.selectRecipe}/>
                    </div>
                </div>
            </div>
        );
    }
}