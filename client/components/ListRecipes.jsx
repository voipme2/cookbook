import React from 'react';
import {Link} from 'react-router-dom';
import {List, ListItem} from 'material-ui/List';

export default class ListRecipes extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        let items = this.props.recipes.map((r,i) => {
            return (
                <ListItem key={i} primaryText={r.name}
                          containerElement={<Link to={{pathname: "/view/" + r.id}}/>}/>);
        });

        return (
            <List>
                {items}
            </List>
        );
    }
}