// Copyright 2017-2018 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the ISC license. See the LICENSE file for details.

// Check if all characters in given string are decimal (without parsing number values)
export default function isNonDecimal (value: string): boolean {
  const chars = '.0123456789';

  // FIXME - refactor into shared function since duplicated of isNonInteger
  if (value.length === 1) {
    return chars.indexOf(value) === -1;
  } else {
    for (let el of value) {
      if (chars.indexOf(el) === -1) {
        return true;
      }
    }
  }
  return false;
}
