import { withTweekKeys } from 'react-tweek';

export default withTweekKeys(
  {
    maxSearchResults: '@tweek/editor/search/max_results',
    showInternalKeys: '@tweek/editor/show_internal_keys',
  },
  {
    defaultValues: {},
  },
);
