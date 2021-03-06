// Copyright 2017-2018 @polkadot/app-addresses authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { SubjectInfo } from '@polkadot/ui-keyring/observable/types';

import './index.css';

import React from 'react';

import addressObservable from '@polkadot/ui-keyring/observable/addresses';
import Tabs, { TabItem } from '@polkadot/ui-app/Tabs';
import withObservableBase from '@polkadot/ui-react-rx/with/observableBase';

import Creator from './Creator';
import Editor from './Editor';
import Idler from './Idler';
import translate from './translate';
import List from './List';
import Button from '@polkadot/ui-app/Button';

type Props = I18nProps & {
  allAddresses?: SubjectInfo,
  basePath: string
};

type Actions = 'create' | 'edit' | 'idle';

type State = {
  action: Actions,
  hidden: Array<string>,
  items: Array<TabItem>,
  panelAddress: string,
  forgetCurrentAddress: boolean
};

// FIXME React-router would probably be the best route, not home-grown
const Components: { [index: string]: React.ComponentType<any> } = {
  'create': Creator,
  'edit': Editor,
  'idle': Idler
};

class AddressesApp extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    const { allAddresses = {}, t } = props;
    const baseState = Object.keys(allAddresses).length !== 0
      ? AddressesApp.showIdleState()
      : AddressesApp.showCreateState();

    this.state = {
      ...baseState,
      items: [
        {
          name: 'edit',
          text: t('app.edit', { defaultValue: 'Edit address' })
        },
        {
          name: 'create',
          text: t('app.create', { defaultValue: 'Add address' })
        },
        {
          name: 'idle',
          text: t('app.idle', { defaultValue: 'Idle' })
        }
      ],
      panelAddress: '',
      forgetCurrentAddress: false
    };
  }

  static showEditState () {
    return {
      action: 'edit' as Actions,
      hidden: ['create', 'idle']
    };
  }

  //static hideEditState () {
  //  return {
  //    action: 'create' as Actions,
  //    hidden: ['edit']
  //  };
  //}

  static showCreateState () {
    return {
      action: 'create' as Actions,
      hidden: ['edit', 'idle']
    };
  }

  static showIdleState () {
    return {
      action: 'idle' as Actions,
      hidden: ['edit', 'create']
    };
  }

  static getDerivedStateFromProps ({ allAddresses = {} }: Props, { hidden }: State) {
    const hasAddresses = Object.keys(allAddresses).length !== 0;

    if (hidden.length === 0) {
      return hasAddresses
        ? null
        : AddressesApp.showCreateState();
    }

    //return hasAddresses
    //  ? AddressesApp.showEditState()
    //  : null;
  }

  render () {
    const { action, hidden, items, panelAddress, forgetCurrentAddress } = this.state;
    const Component = Components[action];

    return (
      <main className='addresses--App'>
        <header></header>
        <Component onCreateAddress={this.activateEdit} choosenAddress={panelAddress} readyToForget={forgetCurrentAddress} />
        <Button
            onClick={this.openNewAddress}
            isPrimary
            text='New Address'
        />
        <List onChooseEditPanel={this.editAddress} onChooseForgetPanel={this.forgetAddress}/>
      </main>
    );
  }

  private onMenuChange = (action: Actions) => {
    this.setState({ action });
  }

  private activateEdit = (): void => {
    this.setState(
      AddressesApp.showEditState()
    );
  }

  openNewAddress = (): void => {
    this.setState(
      AddressesApp.showCreateState()
    );
  }

  editAddress = (currentAddress:any) => {
    this.setState({panelAddress:currentAddress});
    this.setState({forgetCurrentAddress:false});
    this.setState(
      AddressesApp.showEditState()
    );
  }

  forgetAddress = (deleteAddress:any) => {
    this.setState({panelAddress:deleteAddress});
    this.setState({forgetCurrentAddress:true});

    this.setState(AddressesApp.showEditState());
  }
}

export default withObservableBase(
  addressObservable.subject, { propName: 'allAddresses' }
)(translate(AddressesApp));
