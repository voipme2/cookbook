import React from 'react';
import TextField from 'material-ui/TextField';

class ControlledInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.updateProp(this.props.id, event.target.value)
    }

    render() {
        return (
            <div>
                <TextField id={this.props.id}
                           value={this.props.value}
                           hintText={this.props.hintText}
                           onChange={this.handleChange} />
            </div>
        )
    }
}

export default class EditRecipe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {recipe: {}};
        this.updateProp = this.updateProp.bind(this);
    }

    updateProp(key, value) {
        let recipe = this.state.recipe;
        recipe[key] = value;
        this.setState({ recipe: recipe });
    }

    componentWillMount() {
        let self = this;
        fetch("/api/recipes/" + this.props.match.params.id)
            .then(r => r.json())
            .then(r => self.setState({recipe: r}));
    }

    render() {
        return (
            <div>
                <ControlledInput id="name" value={this.state.recipe.name} hintText="Name" updateProp={this.updateProp} />
                <ControlledInput id="author" value={this.state.recipe.author} hintText="Author" updateProp={this.updateProp} />
                <ControlledInput id="description" value={this.state.recipe.description} hintText="Description" updateProp={this.updateProp} />
                <pre>{JSON.stringify(this.state.recipe, null, 2)}</pre>
            </div>
        )
    }
}