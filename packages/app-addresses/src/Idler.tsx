// Copyright 2017-2018 @polkadot/app-addresses authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';

import React from 'react';

import Button from '@polkadot/ui-app/Button';
import Input from '@polkadot/ui-app/Input';
import { InputAddress } from '@polkadot/ui-app/InputAddress';
import keyring from '@polkadot/ui-keyring/index';
import addressDecode from '@polkadot/util-keyring/address/decode';
import addressEncode from '@polkadot/util-keyring/address/encode';

import AddressSummary from '@polkadot/ui-app/AddressSummary';
import translate from './translate';

type Props = I18nProps & {
  onCreateAddress: () => void
};

type State = {
  address: string,
  isAddressValid: boolean,
  isNameValid: boolean,
  isValid: boolean,
  name: string
};

class Idler extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = this.emptyState();
  }

  render () {
    const { address } = this.state;

    return (
      <div></div>
    );
  }

  renderInput () {
    const { t } = this.props;
    const { address, isAddressValid, isNameValid, name } = this.state;

    return;
  }

  emptyState (): State {
    return {
      address: '',
      isAddressValid: false,
      isNameValid: true,
      isValid: false,
      name: 'new address'
    };
  }
}

export default translate(Idler);
