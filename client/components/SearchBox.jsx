import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';

export default class SearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {searchText: '', recipes: [], dataSource: []};
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
            .then(r => self.setState({recipes: r, dataSource: r.map(re => re.name)}));
    };

    handleNewRequest(chosen, index) {
        this.setState({
            searchText: ''
        });
        // console.log(this.state.recipes, this.state.recipes[index])
        this.props.router.push('/view/' + this.state.recipes[index].id);
    };

    render() {
        return (
            <div>
                <AutoComplete
                    hintText="Search"
                    searchText={this.state.searchText}
                    onUpdateInput={this.handleUpdateInput}
                    onNewRequest={this.handleNewRequest}
                    dataSourceConfig={{text: 'text',}}
                    dataSource={this.state.dataSource}
                    maxSearchResults={10}
                    filter={(searchText, key) => (key.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)}
                    openOnFocus={true}
                />
            </div>
        );
    }
}