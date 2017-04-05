import React from 'react';
import { Component } from 'react';

import SearchBox from './SearchBox'
import FixedConfiguration from '../FixedConfiguration/FixedConfiguration';

class ContextPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      contextType: '',
      contextId: ''
    }
  }

  onGetContext(context) {
    this.setState({ ...context });
  }

  render() {
    return (
      <div >
        <SearchBox onGetContext={this.onGetContext.bind(this)}/> 
        { 
          this.shouldRender()
            ? <FixedConfiguration contextType={this.state.contextType} contextId={this.state.contextId}/>
            : null
        }
        
      </div>
    );
  }

  shouldRender(){
    return this.state.contextType && this.state.contextId
  }

}
export default ContextPage;