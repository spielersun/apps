// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

import React from 'react';

import IdentityIcon from '@polkadot/ui-react/IdentityIcon';

import classes from './util/classes';
import { AddressSummary } from './AddressSummary';
import translate from './translate';

class ListRow extends AddressSummary {
  render () {
    const { className, style, identIconSize } = this.props;
    const { address, isValid } = this.state;
    
    return (
      <div
        className={classes('ui--ListRow', !isValid && 'invalid', className)}
        style={style}
      >
        <div className='ui--ListRow-base'>
          <IdentityIcon
            className='ui--ListRow-icon'
            size={identIconSize}
            value={address}
          />
          <div className='ui--ListRow-details'>
            {this.renderAddress()}
          </div>
        </div>
      </div>
    );
  }
}

export default translate(ListRow);
