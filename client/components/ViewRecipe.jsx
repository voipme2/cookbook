import React from 'react';
import {Card, CardText, CardTitle} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import ContentRemoveCircle from 'material-ui/svg-icons/content/remove-circle';

export default class ViewRecipe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {recipe: {}};
        this.onEditClick = this.onEditClick.bind(this);
    }

    componentWillMount() {
        let self = this;
        fetch("/api/recipes/" + this.props.match.params.id)
            .then(r => r.json())
            .then(r => self.setState({recipe: r}));
    }

    onEditClick() {
        this.props.history.push("/edit/" + this.props.match.params.id);
    }

    onDeleteClick() {

    }

    render() {
        let ingredients = "", steps = "";
        if (this.state.recipe.ingredients) {
            ingredients = (<List>
                {this.state.recipe.ingredients.map((ing, i) => (<ListItem key={i} primaryText={ing.text}/>))}
            </List>);
        }
        if (this.state.recipe.steps) {
            steps = (<List>
                {this.state.recipe.steps.map((step, i) => (<ListItem key={i} primaryText={step.text}/>))}
            </List>);
        }
        let menuStyle = {
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 0,
            margin: 0
        };

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
                <div style={menuStyle}>
                    <FloatingActionButton secondary={true} mini={true}>
                        <ContentRemoveCircle/>
                    </FloatingActionButton>
                    <FloatingActionButton onClick={this.onEditClick}>
                        <ModeEdit/>
                    </FloatingActionButton>
                </div>
            </Card>
        );
    }
}