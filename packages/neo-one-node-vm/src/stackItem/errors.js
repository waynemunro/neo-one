/* @flow */
import { CustomError } from '@neo-one/utils';

export class InvalidValueArrayError extends CustomError {
  code = 'INVALID_VALUE_ARRAY';

  constructor() {
    super('Invalid Value. Expected Array');
  }
}

export class InvalidValueBufferError extends CustomError {
  code = 'INVALID_VALUE_BUFFER';

  constructor() {
    super('Invalid Value. Expected Buffer');
  }
}

export class InvalidValueHeaderError extends CustomError {
  code = 'INVALID_VALUE_HEADER';

  constructor() {
    super('Invalid Value. Expected Header');
  }
}

export class InvalidValueBlockError extends CustomError {
  code = 'INVALID_VALUE_BLOCK';

  constructor() {
    super('Invalid Value. Expected Block');
  }
}

export class InvalidValueBlockBaseError extends CustomError {
  code = 'INVALID_VALUE_BLOCK_BASE';

  constructor() {
    super('Invalid Value. Expected BlockBase');
  }
}

export class InvalidValueTransactionError extends CustomError {
  code = 'INVALID_VALUE_TRANSACTION';

  constructor() {
    super('Invalid Value. Expected Transaction');
  }
}

export class InvalidValueAttributeError extends CustomError {
  code = 'INVALID_VALUE_ATTRIBUTE';

  constructor() {
    super('Invalid Value. Expected Attribute');
  }
}

export class InvalidValueAttributeStackItemError extends CustomError {
  code = 'INVALID_VALUE_ATTRIBUTE_STACK_ITEM';

  constructor() {
    super('Invalid Value. Expected AttributeStackItem');
  }
}

export class InvalidValueInputError extends CustomError {
  code = 'INVALID_VALUE_INPUT';

  constructor() {
    super('Invalid Value. Expected Input');
  }
}

export class InvalidValueOutputError extends CustomError {
  code = 'INVALID_VALUE_OUTPUT';

  constructor() {
    super('Invalid Value. Expected Output');
  }
}

export class InvalidValueAccountError extends CustomError {
  code = 'INVALID_VALUE_ACCOUNT';

  constructor() {
    super('Invalid Value. Expected Account');
  }
}

export class InvalidValueAssetError extends CustomError {
  code = 'INVALID_VALUE_ASSET';

  constructor() {
    super('Invalid Value. Expected Asset');
  }
}

export class InvalidValueContractError extends CustomError {
  code = 'INVALID_VALUE_CONTRACT';

  constructor() {
    super('Invalid Value. Expected Contract');
  }
}

export class InvalidValueValidatorError extends CustomError {
  code = 'INVALID_VALUE_VALIDATOR';

  constructor() {
    super('Invalid Value. Expected Validator');
  }
}

export class InvalidValueStorageContextStackItemError extends CustomError {
  code = 'INVALID_VALUE_STORAGE_CONTEXT_STACK_ITEM';

  constructor() {
    super('Invalid Value. Expected StorageContextStackItem');
  }
}
