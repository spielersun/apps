// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

export default function isNotDigit (event: any): boolean {
  return event.keyCode < 48 || event.keyCode > 57;
}