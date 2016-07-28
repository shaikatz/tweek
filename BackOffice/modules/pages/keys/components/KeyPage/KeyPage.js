import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import KeyRulesEditor from '../KeyRulesEditor/KeyRulesEditor';
import * as actions from '../../ducks/selectedKey';
import style from './KeyPage.css';
import { WithContext as ReactTags } from 'react-tag-input';
import R from 'ramda';

export default connect((state, { params }) => ({ ...state, configKey: params.splat }), { ...actions })(
  class KeyPage extends Component {

    static propTypes = {
      dispatch: React.PropTypes.func,
      configKey: React.PropTypes.string,
      selectedKey: React.PropTypes.object,
    }

    constructor(props) {
      super(props);

      this.tagsSuggestions = ['android', 'ios', 'client', 'backend', 'language', 'resource', 'text', 'layout', 'color', 'carrier', 'boolean'];

      this.state = {
        isDisplayNameInEditMode: false,
      };
    }

    componentDidMount() {
      const { downloadKey, configKey } = this.props;
      if (configKey) {
        downloadKey(configKey);
      }
    }

    componentWillReceiveProps({ configKey }) {
      if (configKey !== this.props.configKey || !this.props.selectedKey) {
        this.props.downloadKey(configKey);
      }
    }

    onDisplayNameChanged(newDisplayName) {
      const newMeta = { ...this.props.selectedKey.meta, displayName: newDisplayName };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    onDescriptionChanged(newDescription) {
      const newMeta = { ...this.props.selectedKey.meta, description: newDescription };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    onTagDeleted(deletedTagIndex) {
      const meta = this.props.selectedKey.meta;
      const newMeta = { ...meta, tags: R.remove(deletedTagIndex, 1, meta.tags) };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    onTagAdded(newTagText) {
      const meta = this.props.selectedKey.meta;
      const newMeta = { ...meta, tags: [...meta.tags, newTagText] };
      this._onSelectedKeyMetaChanged(newMeta);
    }

    get tags() {
      return R.map(_ => ({
        id: _,
        text: _,
      }), this.props.selectedKey.meta.tags);
    }

    _onSelectedKeyMetaChanged(newMeta) {
      this.props.updateKeyMetaDef(newMeta);
    }

    render() {
      const { dispatch, configKey, selectedKey } = this.props;
      return (

        <div className={style['key-viewer-container']}>
          {selectedKey ?

            <div>

              <div className={style['key-header']}>

                <button className={style['save-button']}
                  onClick={() => this.props.saveKey(configKey) }
                  >
                  Save changes
                </button>

                <div>

                  <div>

                    {this.state.isDisplayNameInEditMode ?
                      <input type="text"
                        className={style['display-name-input']}
                        onChange={ (e) => this.onDisplayNameChanged(e.target.value) }
                        value = { selectedKey.meta.displayName }
                        onBlur={() => { this.setState({ isDisplayNameInEditMode: false }); } }
                        />
                      :
                      <div className={style['display-name']}
                        onClick={() => { this.setState({ isDisplayNameInEditMode: true }); } }
                        >
                        {selectedKey.meta.displayName}
                      </div>
                    }

                  </div>

                  <input type="text"
                    className={style['meta-data-input']}
                    onChange={ (e) => this.onDescriptionChanged(e.target.value) }
                    value = { selectedKey.meta.description }
                    placeholder="Description"
                    />

                  <ReactTags tags={ this.tags }
                    handleDelete={ this:: this.onTagDeleted }
                  handleAddition={ this:: this.onTagAdded }
                  suggestions={this.tagsSuggestions }
                  placeholder="New tag"
                  minQueryLength={ 1 }
                  allowDeleteFromEmptyInput={ false }
                  classNames={{
                    tags: style['tags-container'],
                    tagInput: style['tag-input'],
                    tag: style['tag'],
                    remove: style['tag-delete-button'],
                    suggestions: style['tags-suggestion'],
                  } }
                  />


                  <div className={style['full-key-path']}>
                    <label className={style['full-kay-path-title']}>Full path: </label>
                    <label>{configKey}</label>
                  </div>

                </div>

              </div>

              <KeyRulesEditor ruleDef={selectedKey.ruleDef}
                sourceTree={JSON.parse(selectedKey.ruleDef.source) }
                onMutation={x => this.props.updateKeyRuleDef({ source: JSON.stringify(x, null, 4) }) }
                className={style['key-rules-editor']}
                />

            </div>

            :
            <div>
              loading
            </div>
          }

        </div>
      );
    }
  });
