import React, {Component} from 'react';

class ListChooser extends Component {
  state = {}
  componentWillMount() {
    // check for login code
  }
  listSharing() {

  }
  newList() {

  }
  render() {
    return <div className="ListChooser">
      List:
      <select defaultValue="default">
        <option value="default">Default List</option>
      </select>
      &nbsp;
      <a onClick={this.listSharing.bind(this)}>Sharing settings for <tt>Default List</tt></a>
      &nbsp;
      <a onClick={this.newList.bind(this)}>Add New List</a>
    </div>
  }
}

export default ListChooser;
