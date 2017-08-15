import React from 'react';
import SearchBox from './SearchBox.jsx';
import ViewRecipe from './ViewRecipe.jsx';

export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = { recipe: null };
        this.selectRecipe = this.selectRecipe.bind(this);
    }

    selectRecipe({recipe}) {
        this.setState({ recipe: recipe });
    }

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
                    <SearchBox selectRecipe={this.selectRecipe} />
                    {this.state.recipe ? <ViewRecipe recipe={this.state.recipe} /> : '' }
                </div>
                {gutter}
            </div>);
    }
}
