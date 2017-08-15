import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';

export default class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchText: '', recipes: []};
        this.handleUpdateInput = this.handleUpdateInput.bind(this);
        this.handleNewRequest = this.handleNewRequest.bind(this);
    }

    handleUpdateInput(searchText) {
        this.setState({
            searchText: searchText
        });
        let self = this;

        fetch("/api/search?query=" + encodeURIComponent(searchText))
            .then(r => r.json())
            .then(r => self.setState({recipes: r.map(re => re.name)}) );
    };

    handleNewRequest() {
        // TODO go to the recipe view
        this.setState({
            searchText: '',
        });

    };

    render() {
        return (
            <div>
                <AutoComplete
                    hintText="Search"
                    searchText={this.state.searchText}
                    onUpdateInput={this.handleUpdateInput}
                    onNewRequest={this.handleNewRequest}
                    dataSourceConfig={{ text: 'text', }}
                    dataSource={this.state.recipes}
                    maxSearchResults={10}
                    filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)}
                    openOnFocus={true}
                />
            </div>
        );
    }
}