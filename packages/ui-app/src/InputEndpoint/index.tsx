// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { BareProps } from '../types';

import './InputEndpoint.css';

import React from 'react';
import createOptionHeader from '@polkadot/ui-keyring/options/header';
import keyring from '@polkadot/ui-keyring/index';

import Dropdown from '../Dropdown';
import classes from '../util/classes';

type EndpointOption$Type = 'endpoint' | 'all' | 'recent' | 'testing';

type EndpointOption = {
  className?: string,
  disabled?: boolean,
  content?: any | string, // node?
  key: string | null,
  name: string,
  text: any | string, // node?
  value: string | null
};

type EndpointOptions = Array<EndpointOption>;

type Props = BareProps & {
  defaultValues?: Array<string> | null,
  hideEndpoint?: boolean;
  isDisabled?: boolean,
  isError?: boolean,
  isInput?: boolean,
  label?: string,
  onChange: (value: string) => void,
  placeholder?: string,
  value?: string,
  withLabel?: boolean
};

type State = {
  defaultValues: Array<string> | undefined,
  value?: string
};

const RECENT_KEY = 'header-recent-endpoint';

const transform = (value: string): string => {
  try {
    return value;
  } catch (error) {
    return '';
  }
};

// NOTE: We are not extending Component here since the options may change in the keyring (which needs a re-render), however the input props will be the same (so, no PureComponent with shallow compare here)
export default class InputEndpoint extends React.Component<Props, State> {
  getDefaultValues = (): EndpointOptions => {
    const { defaultValues } = this.props;
    const _defaultValues = defaultValues || []
    var res: EndpointOptions = []
    _defaultValues.map((name, index) => {
      res.push({
        name,
        key: index.toString(),
        text: name,
        value: name
      })
    })
    return res
  }

  render () {
    const {
      className,
      hideEndpoint = false,
      isDisabled = false,
      isError,
      label,
      onChange,
      style,
      withLabel
    } = this.props;
    const { defaultValues = [], value } = this.props;

    return (
      <Dropdown
        className={classes('ui--InputEndpoint', hideEndpoint ? 'flag--hideEndpoint' : '', className)}
        options={this.getDefaultValues()}
        isDisabled={isDisabled}
        isError={isError}
        label={label}
        onChange={onChange}
        onSearch={this.onSearch}
        style={style}
        transform={transform}
        value={value}
        withLabel={withLabel}
      />
    );
  }

  isValidEndpoint(s) {
    return true
  }

  onSearch = (filteredOptions: EndpointOptions, query: string): EndpointOptions => {
    const { isInput = true } = this.props;
    const { defaultValues } = this.state || { defaultValues: [] };
    const queryLower = query.toLowerCase();

    // check if the input is one of the options
    const matches = filteredOptions.filter((item) => {
      if (item.value === null) {
        return true;
      }

      const { name, value } = item;
      const hasMatch =
        name.toLowerCase().indexOf(queryLower) !== -1 ||
        value.toLowerCase().indexOf(queryLower) !== -1;

      return hasMatch;
    });

    const valueMatches = matches.filter((s) => s !== null);

    if (isInput && valueMatches.length === 0) {
      const isValidEp = this.isValidEndpoint(query);

      if (isValidEp) {
        if (!matches.find((item) => item.key === RECENT_KEY)) {
          matches.push(
            createOptionHeader('Recent')
          );
        }

        matches.push(
          // keyring.saveRecentEndpoint(query)
          query
        );
      }
    }

    return matches.filter((item, index) => {
      const isLast = index === matches.length - 1;
      const nextItem = matches[index + 1];
      const hasNext = nextItem && nextItem;

      if (item !== null || (!isLast && hasNext)) {
        return true;
      }

      return true;
    });
  }
}
