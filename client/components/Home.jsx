import React from 'react';
import SearchBox from './SearchBox.jsx';
import {Link} from 'react-router-dom';
import { Layout, Panel } from 'react-toolbox'

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
            <Layout>
                <Panel>
                    <div style={{ flex:1, padding: '1.8rem'}}>
                        <h1>cookbook</h1>
                        <span>Cooking up <Link to="/list">{this.props.recipes.length} recipes</Link></span>
                        <SearchBox selectRecipe={this.selectRecipe}/>
                    </div>
                </Panel>
            </Layout>
        );
    }
}