// Copyright 2017-2018 @polkadot/ui-signer authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { ApiProps } from '@polkadot/ui-react-rx/types';
import { I18nProps, BareProps } from '@polkadot/ui-app/types';
import { Fees, QueueTx, QueueTx$MessageSetStatus } from './types';

import BN from 'bn.js';
import React from 'react';
import Button from '@polkadot/ui-app/Button';
import Modal from '@polkadot/ui-app/Modal';
import keyring from '@polkadot/ui-keyring/index';
import withApi from '@polkadot/ui-react-rx/with/api';

import Extrinsic from './Extrinsic';
import Unlock from './Unlock';
import signMessage from './sign';
import submitMessage from './submit';
import translate from './translate';

type BaseProps = BareProps & {
  queue: Array<QueueTx>,
  queueSetStatus: QueueTx$MessageSetStatus
};

type Props = I18nProps & ApiProps & BaseProps;

type UnlockI18n = {
  key: string,
  value: any // I18Next$Translate$Config
};

type State = {
  amount: BN,
  currentItem?: QueueTx,
  from: Uint8Array | null,
  password: string,
  to: Uint8Array | null,
  txfees: Fees,
  unlockError: UnlockI18n | null
};

const ZERO = new BN(0);

class Signer extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    this.state = {
      amount: ZERO,
      from: null,
      password: '',
      to: null,
      txfees: {
        hasAvailable: false,
        txtotal: ZERO
      } as Fees,
      unlockError: null
    };
  }

  static getDerivedStateFromProps ({ queue }: Props, { currentItem, password, unlockError }: State): State {
    const nextItem = queue.find(({ status }) =>
      status === 'queued'
    );
    const isSame =
      !!nextItem &&
      !!currentItem &&
      (
        (!nextItem.publicKey && !currentItem.publicKey) ||
        (
          (nextItem.publicKey && nextItem.publicKey.toString()) === (currentItem.publicKey && currentItem.publicKey.toString())
        )
      );

    return {
      amount: ZERO,
      currentItem: nextItem,
      from: null,
      password: isSame ? password : '',
      to: null,
      txfees: {
        hasAvailable: false,
        txtotal: ZERO
      } as Fees,
      unlockError: isSame ? unlockError : null
    };
  }

  async componentDidUpdate (prevProps: Props, prevState: State) {
    const { currentItem } = this.state;

    if (currentItem && currentItem.status === 'queued' && currentItem.rpc.isSigned !== true) {
      return this.sendItem(currentItem);
    }
  }

  render () {
    const { currentItem } = this.state;

    if (!currentItem || currentItem.rpc.isSigned !== true) {
      return null;
    }

    return (
      <Modal
        className='ui--signer-Signer'
        dimmer='inverted'
        open
      >
        {this.renderContent()}
        {this.renderButtons()}
      </Modal>
    );
  }

  renderButtons () {
    const { t } = this.props;
    const { currentItem: { rpc: { isSigned = false } = {} } = {}, txfees: { hasAvailable } } = this.state;

    return (
      <Modal.Actions>
        <Button.Group>
          <Button
            isNegative
            onClick={this.onCancel}
            tabIndex={3}
            text={t('extrinsic.cancel', {
              defaultValue: 'Cancel'
            })}
          />
          <Button.Or />
          <div>
            <Button
              className='ui--signer-Signer-Submit'
              isDisabled={!hasAvailable}
              isPrimary
              onClick={this.onSend}
              tabIndex={2}
              text={
                isSigned
                  ? t('extrinsic.signedSend', {
                    defaultValue: 'Sign and Submit'
                  })
                  : t('extrinsic.send', {
                    defaultValue: 'Submit'
                  })
              }
            />
          </div>
        </Button.Group>
      </Modal.Actions>
    );
  }

  renderContent () {
    const { amount, currentItem, from, to, txfees } = this.state;

    if (!currentItem) {
      return null;
    }

    return (
      <Extrinsic
        amount={amount}
        from={from}
        onChangeAmount={this.onChangeAmount}
        onChangeFees={this.onChangeFees}
        onChangeFrom={this.onChangeFrom}
        onChangeTo={this.onChangeTo}
        to={to}
        txfees={txfees}
        value={currentItem}
      >
        {this.renderUnlock()}
      </Extrinsic>
    );
  }

  renderUnlock () {
    const { t } = this.props;
    const { currentItem, password, unlockError } = this.state;

    if (!currentItem) {
      return null;
    }

    return (
      <Unlock
        autoFocus
        error={unlockError && t(unlockError.key, unlockError.value)}
        onChange={this.onChangePassword}
        onKeyDown={this.onKeyDown}
        password={password}
        value={currentItem.publicKey}
        tabIndex={1}
      />
    );
  }

  unlockAccount (publicKey: Uint8Array, password?: string): UnlockI18n | null {
    const pair = keyring.getPair(publicKey);

    if (!pair.isLocked()) {
      return null;
    }

    try {
      pair.decodePkcs8(password);
    } catch (error) {
      return {
        key: 'signer.unlock.generic',
        value: {
          defaultValue: error.message
        }
      };
    }

    return null;
  }

  onChangeAmount = (amount: string) => {
    this.setState({ amount: new BN(amount || 0) });
  }

  onChangeFrom = (from: Uint8Array) => {
    this.setState({ from });
  }

  onChangeFees = (txfees: Fees) => {
    this.setState({ txfees });
  }

  onChangePassword = (password: string): void => {
    this.setState({
      password,
      unlockError: null
    });
  }

  onChangeTo = (to: Uint8Array) => {
    this.setState({ to });
  }

  onKeyDown = async (event: React.KeyboardEvent<Element>): Promise<any> => {
    if (event.key === 'Enter') {
      await this.onSend();
    }
  }

  onCancel = (): void => {
    const { queueSetStatus } = this.props;
    const { currentItem } = this.state;

    // This should never be executed
    if (!currentItem) {
      return;
    }

    queueSetStatus(currentItem.id, 'cancelled');
  }

  onSend = async (): Promise<any> => {
    const { currentItem, password } = this.state;

    // This should never be executed
    if (!currentItem) {
      return;
    }

    return this.sendItem(currentItem, password);
  }

  sendItem = async ({ id, nonce, publicKey, rpc, values }: QueueTx, password?: string): Promise<void> => {
    if (rpc.isSigned === true && publicKey) {
      const unlockError = this.unlockAccount(publicKey, password);

      if (unlockError) {
        this.setState({ unlockError });
        return;
      }
    }

    const { api, apiSupport, queueSetStatus } = this.props;

    queueSetStatus(id, 'sending');

    let data = values;

    if (rpc.isSigned === true && publicKey) {
      data = [
        signMessage(
          publicKey, nonce, (data[0] as Uint8Array), apiSupport
        ).data
      ];
    }

    const { error, result, status } = await submitMessage(api, data, rpc);

    queueSetStatus(id, status, result, error);
  }
}

const Component: React.ComponentType<any> = translate(
  withApi(Signer)
);

export {
  Signer
};

export default Component;
