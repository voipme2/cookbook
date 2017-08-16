import React from 'react';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';

export default class ViewRecipe extends React.Component {

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
        let ingredients = "", steps = "";
        if (this.state.recipe.ingredients) {
            ingredients = (<List>
                {this.state.recipe.ingredients.map(ing => (<ListItem primaryText={ing.text}/>))}
            </List>);
        }
        if (this.state.recipe.steps) {
            steps = (<List>
                {this.state.recipe.steps.map(step => (<ListItem primaryText={step.text}/>))}
            </List>);
        }

        return (
            <Card>
                <CardTitle title={this.state.recipe.name}
                           subtitle={this.state.recipe.description}/>
                <CardText>
                    {/*JSON.stringify(this.state.recipe, null, 2) */}
                    <div className="row start-xs">
                        <div className="col-xs-4">
                            <div className="box">
                                {ingredients}
                            </div>
                        </div>
                        <div className="col-xs-8">
                            <div className="box">
                                {steps}
                            </div>
                        </div>
                    </div>
                </CardText>
            </Card>
        );
    }
}