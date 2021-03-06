/* @flow */
// flowlint untyped-import:off
import {
  type BackupRestoreOptions,
  backup,
  restore,
} from '@neo-one/node-data-backup';
import Blockchain from '@neo-one/node-blockchain';
import { type Blockchain as BlockchainType } from '@neo-one/node-core';
import { type Log, finalize, neverComplete } from '@neo-one/utils';
import Node, {
  type NodeEnvironment,
  type NodeOptions,
} from '@neo-one/node-protocol';
import { Observable } from 'rxjs/Observable';
import { type Settings } from '@neo-one/client-core';
import {
  type CreateLogForContext,
  type CreateProfile,
  type RPCServerEnvironment,
  type RPCServerOptions,
  rpcServer$,
} from '@neo-one/node-rpc';

import { defer } from 'rxjs/observable/defer';
import { concatMap, distinct, map, switchMap, take } from 'rxjs/operators';
import { concat } from 'rxjs/observable/concat';
import cron from 'node-cron';
import { timer } from 'rxjs/observable/timer';
import leveldown from 'leveldown';
import levelup from 'levelup';
import levelUpStorage from '@neo-one/node-levelup';
import path from 'path';
import vm from '@neo-one/node-vm';

type BackupEnvironment = {|
  tmpPath?: string,
  readyPath?: string,
|};

type BackupOptions = {|
  restore: boolean,
  backup?: {|
    cronSchedule: string,
  |},
  options: BackupRestoreOptions,
|};

export type Environment = {|
  dataPath: string,
  rpc: RPCServerEnvironment,
  levelDownOptions?: {|
    createIfMissing?: boolean,
    errorIfExists?: boolean,
    compression?: boolean,
    cacheSize?: number,
    writeBufferSize?: number,
    blockSize?: number,
    maxOpenFiles?: number,
    blockRestartInterval?: number,
    maxFileSize?: number,
  |},
  node: NodeEnvironment,
  backup?: BackupEnvironment,
|};

export type Options = {|
  node: NodeOptions,
  rpc: RPCServerOptions,
  backup?: BackupOptions,
|};

export default ({
  log,
  createLogForContext,
  createProfile,
  settings,
  environment,
  options$,
  onCreateBlockchain,
}: {|
  log: Log,
  createLogForContext: CreateLogForContext,
  createProfile: CreateProfile,
  settings: Settings,
  environment: Environment,
  options$: Observable<Options>,
  onCreateBlockchain?: (blockchain: BlockchainType) => Promise<void>,
|}): Observable<*> => {
  const dataPath = path.resolve(environment.dataPath, 'data');

  const backupEnv = environment.backup || {};
  const backupEnvironment = {
    dataPath,
    tmpPath:
      backupEnv.tmpPath == null
        ? path.resolve(environment.dataPath, 'tmp')
        : backupEnv.tmpPath,
    readyPath:
      backupEnv.readyPath == null
        ? path.resolve(environment.dataPath, 'data.ready')
        : backupEnv.readyPath,
  };
  const restore$ = defer(async () => {
    const options = await options$.pipe(take(1)).toPromise();
    if (options.backup != null && options.backup.restore) {
      await restore({
        log,
        environment: backupEnvironment,
        options: options.backup.options,
      });
    }
  });

  const node$ = defer(async () => {
    const storage = levelUpStorage({
      db: levelup(leveldown(dataPath, environment.levelDownOptions)),
      context: { messageMagic: settings.messageMagic },
    });
    const blockchain = await Blockchain.create({
      settings,
      storage,
      vm,
      log,
    });
    if (onCreateBlockchain != null) {
      await onCreateBlockchain(blockchain);
    }

    return { blockchain, storage };
  }).pipe(
    neverComplete(),
    finalize(async result => {
      if (result != null) {
        await result.blockchain.stop();
        await result.storage.close();
      }
    }),
    switchMap(({ blockchain }) => {
      const node = new Node({
        blockchain,
        environment: environment.node,
        options$: options$.pipe(map(options => options.node), distinct()),
      });
      return node.start().pipe(map(() => ({ blockchain, node })));
    }),
    concatMap(({ node, blockchain }) =>
      rpcServer$({
        log,
        createLogForContext,
        createProfile,
        blockchain,
        node,
        environment: environment.rpc,
        options$: options$.pipe(map(options => options.rpc), distinct()),
      }),
    ),
  );

  const start$ = options$.pipe(
    map(options => options.backup),
    distinct(),
    switchMap(backupOptionsIn => {
      const backupOptions = backupOptionsIn;
      if (backupOptions == null || backupOptions.backup == null) {
        return node$;
      }

      const { cronSchedule } = backupOptions.backup;
      return Observable.create(observer => {
        observer.next({ type: 'start' });
        const task = cron.schedule(cronSchedule, () =>
          observer.next({ type: 'backup' }),
        );
        task.start();
        return {
          unsubscribe: () => {
            task.destroy();
          },
        };
      }).pipe(
        switchMap(({ type }) => {
          if (type === 'start') {
            return node$;
          }

          // Give some time to shutdown
          return timer(5000).pipe(
            switchMap(() =>
              defer(async () => {
                await backup({
                  log,
                  environment: backupEnvironment,
                  options: backupOptions.options,
                });
              }),
            ),
            switchMap(() => node$),
          );
        }),
      );
    }),
  );

  return concat(restore$, start$);
};
