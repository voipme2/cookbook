import React from 'react';
import Input from 'react-toolbox/lib/input';

class EditableIngredient extends React.Component {

}

class IngredientEditor extends React.Component {
    constructor(props) {
        super(props);
    }

    addIngredient() {

    }

    removeIngredient() {

    }
    
    render() {

    }
}


export default class EditRecipe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {recipe: {}};
    }

    handleChange(name, value) {
        let recipe = this.state.recipe;
        recipe[name] = value;
        this.setState({recipe: recipe});
    }

    saveRecipe() {
        // TODO save the recipe
    }

    componentWillMount() {
        let self = this;
        fetch("/api/recipes/" + this.props.match.params.id)
            .then(r => r.json())
            .then(r => self.setState({recipe: r}));
    }

    render() {

        return (
            <div className="col-lg-offset-1 col-lg-10">
                <Input type='text' label='Name' name='name' value={this.state.recipe.name}
                       onChange={this.handleChange.bind(this, 'name')} />
                <Input type='text' label='Description' name='description' value={this.state.recipe.description}
                       onChange={this.handleChange.bind(this, 'description')} />
                <Input type='text' label='Author' name='author' value={this.state.recipe.author}
                       onChange={this.handleChange.bind(this, 'author')} />
                <Input type='text' label='Prep time' name='prepTime' value={this.state.recipe.prepTime}
                       onChange={this.handleChange.bind(this, 'prepTime')} />
                <Input type='text' label='Inactive time' name='inactiveTime' value={this.state.recipe.inactiveTime}
                       onChange={this.handleChange.bind(this, 'inactiveTime')} />
                <Input type='text' label='Cook time' name='cookTime' value={this.state.recipe.cookTime}
                       onChange={this.handleChange.bind(this, 'cookTime')} />
                <IngredientEditor ingredients={this.state.recipe.ingredients}
                                  onAddIngredient={this.handleIngredientsChange.bind(this)} />
                <StepEditor steps={this.state.recipe.steps}
                            onChangeSteps={this.handleStepChange.bind(this)} />
                <pre>{JSON.stringify(this.state.recipe, null, 2)}</pre>
            </div>
        )
    }
}