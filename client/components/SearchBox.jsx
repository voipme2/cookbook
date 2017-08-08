import React from 'react';

class SearchItems extends React.Component {
    render() {
        const recipes = this.props.recipes.map(r => {
            return <li key={r.id}>{r.name}</li>;
        });

        return (
            <ul className="search-list">
                {recipes}
            </ul>
        );
    }
}

export default class SearchBox extends React.Component {

    constructor(props) {
        super(props);
        this.state = {search: '', recipes: this.props.recipes};
        this.onSearch = this.onSearch.bind(this);
    }

    onSearch(event) {
        let query = event.target.value;
        this.setState({search: query});
        let self = this;

        fetch("/api/search?query=" + encodeURIComponent(query))
            .then(r => r.json())
            .then(r => self.setState({recipes: r}) );
    }

    render() {
        return (
            <div className="searchbox">
                <input type="text" value={this.state.search}
                       onChange={this.onSearch} placeholder="Search"/>
                {this.state.search.length > 0 &&
                <SearchItems recipes={this.state.recipes}/>
                }
            </div>
        );
    }
}