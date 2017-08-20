import React from 'react';
import TextField from 'material-ui/TextField';

class ControlledInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue || ""
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            value: event.target.value
        });
    }

    render() {
        return (
            <div>
                <TextField id={this.props.id}
                           value={this.state.value}
                           onChange={this.handleChange} />
            </div>
        )
    }
}

export default class EditRecipe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {recipe: {}};
    }

    componentWillMount() {
        let self = this;
        fetch("/api/recipes/" + this.props.match.params.id)
            .then(r => r.json())
            .then(r => self.setState({recipe: r}));
    }

    render() {
        return (
            <div><pre>{JSON.stringify(this.state.recipe, null, 2)}</pre></div>
        )
    }
}