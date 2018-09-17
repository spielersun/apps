// Copyright 2017-2018 @polkadot/ui-signer authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { RxFees } from '@polkadot/ui-react-rx/ApiObservable/types';
import { Fees, QueueTx } from './types';

import BN from 'bn.js';
import React from 'react';
import { Trans } from 'react-i18next';
import extrinsics from '@polkadot/extrinsics';
import AddressMini from '@polkadot/ui-app/AddressMini';
// FIXME - duplicate of app-transfer Fees.tsx. Move Fees to common place
import FeeDisplay from '@polkadot/app-transfer/Fees';
import AddressSummary from '@polkadot/ui-app/AddressSummary';
import InputAddress from '@polkadot/ui-app/InputAddress';
import Input from '@polkadot/ui-app/Input';
import Modal from '@polkadot/ui-app/Modal';
import u8aToHex from '@polkadot/util/u8a/toHex';
import addressEncode from '@polkadot/util-keyring/address/encode';
import withMulti from '@polkadot/ui-react-rx/with/multi';
import withObservable from '@polkadot/ui-react-rx/with/observable';

import translate from './translate';

type Props = I18nProps & {
  children?: React.ReactNode,
  fees: RxFees,
  value: QueueTx
};

// duplicate of Transfer.tsx
type State = {
  amount: BN,
  from: Uint8Array | null,
  to: Uint8Array | null,
  txfees: Fees
};

const ZERO = new BN(0);

function findExtrinsic (sectionId: number, methodId: number): { method: string | undefined, section: string | undefined } {
  const section = Object.values(extrinsics).find(({ index }) =>
    index[0] === sectionId
  );
  const methods = section
    ? section.public
    : {};
  const method = Object.keys(methods).find((method) =>
    methods[method].index[1] === methodId
  );

  return {
    method,
    section: section
      ? section.name
      : undefined
  };
}

class Extrinsic extends React.PureComponent<Props, State> {
  state: State;

  constructor (props: Props) {
    super(props);

    // duplicate of Transfer.tsx
    this.state = {
      amount: ZERO,
      from: null,
      to: null,
      txfees: {
        hasAvailable: false,
        txtotal: ZERO
      } as Fees
    };
  }

  render () {
    const { children, fees, t, value: { nonce = new BN(0), publicKey, values: [_value] } } = this.props;
    // TODO - `from` from State is omitted since already have publicKey to obtain address from,
    // so do we need `from` stored in state at all?
    const { amount, to, txfees: { hasAvailable } } = this.state;

    const unknown = t('decoded.unknown', {
      defaultValue: 'unknown'
    });
    const defaultExtrinsic = {
      method: unknown,
      section: unknown
    };
    const value = _value as Uint8Array;
    const { method, section } = value
      ? findExtrinsic(value[0], value[1])
      : defaultExtrinsic;
    const fromAddress = publicKey && addressEncode(publicKey as Uint8Array);
    const toAddress = to && addressEncode(to as Uint8Array);

    console.log('Extrinsic.tsx - fees: ', fees);

    return [
      <Modal.Header key='header'>
        {t('extrinsic.header', {
          defaultValue: 'Submit Transaction'
        })}
      </Modal.Header>,
      <Modal.Content className='ui--signer-Signer-Content-wrapper' key='content'>
        <div className='ui--signer-Signer-Content'>
          <div className='ui--row'>
            <div className='medium'>
              <InputAddress
                label={t('from', {
                  defaultValue: 'transfer from my account'
                })}
                onChange={this.onChangeFrom}
                type='account'
              />
            </div>
            <div className='medium'>
              <InputAddress
                label={t('to', {
                  defaultValue: 'to the recipient address'
                })}
                onChange={this.onChangeTo}
                type='all'
              />
            </div>
          </div>
          <div className='.ui--signer-Signer-Content-info'>
            {fromAddress ? this.renderAddress(fromAddress) : null}
            <div className='.ui--signer-Signer-Content-data'>
              <Input
                defaultValue='0'
                isError={!hasAvailable}
                label={t('amount', {
                  defaultValue: 'send a value of'
                })}
                min={0}
                onChange={this.onChangeAmount}
                type='number'
              />
              <FeeDisplay
                className='medium'
                amount={amount}
                fees={fees}
                from={fromAddress}
                to={to}
                onChange={this.onChangeFees}
              />
              {/* <QueueConsumer>
                {({ queueExtrinsic }: QueueProps) => (
                  <Submit
                    isDisabled={!hasAvailable}
                    amount={amount}
                    from={fromAddress}
                    to={toAddress}
                    queueExtrinsic={queueExtrinsic}
                  />
                )}
              </QueueConsumer> */}
            </div>
            {toAddress ? this.renderAddress(toAddress) : null}
          </div>
          <div className='ui--signer-Signer-Decoded'>
            <div className='expanded'>
              <p>
                <Trans i18nKey='decoded.short'>
                  You are about to sign a message from <span className='code'>{fromAddress}</span> calling <span className='code'>{section}.{method}</span> with an index of <span className='code'>{nonce.toString()}</span>
                </Trans>
              </p>
              <p>
                {t('decoded.data', {
                  defaultValue: 'The encoded parameters contains the data'
                })}
              </p>
              <p className='code'>
                {u8aToHex(value, 512)}
              </p>
            </div>
          </div>
          {children}
        </div>
      </Modal.Content>
    ];
  }

  private renderAddress (address: string | null) {
    if (!address) {
      return null;
    }

    return (
      <div className='ui--signer-Signer-Content-address'>
        <AddressMini
          isShort
          value={address}
        />
        <AddressSummary
          withBalance={true}
          withCopy={false}
          withNonce={false}
          value={address}
        />
      </div>
    );
  }

  private onChangeAmount = (amount: string) => {
    this.setState({ amount: new BN(amount || 0) });
  }

  private onChangeFrom = (from: Uint8Array) => {
    this.setState({ from });
  }

  private onChangeTo = (to: Uint8Array) => {
    this.setState({ to });
  }

  private onChangeFees = (txfees: Fees) => {
    this.setState({ txfees });
  }
}

export default withMulti(
  translate(Extrinsic),
  withObservable('fees', { propName: 'fees' })
);
