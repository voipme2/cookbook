import React from 'react';
import {Card, CardTitle, CardText} from 'material-ui/Card';

export default class ViewRecipe extends React.Component {

    constructor(props) {
        super(props);
        console.log(this.props.recipe);
        this.state = { recipe: {}};
    }

    componentWillMount() {
        let self = this;
        fetch("/api/recipes/" + this.props.recipe.id)
            .then(r => r.json())
            .then(r => self.setState({ recipe: r }));
    }

    render() {
        return (
            <Card>
                <CardTitle title={this.state.recipe.name}
                            subtitle={this.state.recipe.description}/>
                <CardText>
                    {JSON.stringify(this.state.recipe, null, 2)}
                </CardText>
            </Card>
        );
    }
}