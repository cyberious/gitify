import { createStore, applyMiddleware } from 'redux';
import { Map } from 'immutable';
import thunkMiddleware from 'redux-thunk';

import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';

import { checkHasStarred, fetchNotifications, UPDATE_SETTING, LOGIN, LOGOUT } from '../actions';
import { restoreSettings } from '../utils/comms';
import constants from '../utils/constants';
import notifications from '../middleware/notifications';
import settings from '../middleware/settings';
import rootReducer from '../reducers';

const isDev = process.mainModule.filename.indexOf('app.asar') === -1;

export default function configureStore(initialState) {
  const engine = filter(
    createEngine(constants.STORAGE_KEY),
    ['settings', ['auth', 'token'], ['auth', 'enterpriseAccounts']],
    [['settings', 'hasStarred'], ['settings', 'showSettingsModal']]
  );

  const storageMiddleware = storage.createMiddleware(engine, [], [UPDATE_SETTING, LOGIN.SUCCESS, LOGOUT]);

  const middlewares = [
    thunkMiddleware,
    notifications,
    settings,
    storageMiddleware
  ];

  if (isDev) {
    const { createLogger } = require('redux-logger');
    const logger = createLogger({collapsed: true});
    middlewares.push(logger);
  }

  let store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares)
  );

  // Load settings from localStorage
  const load = storage.createLoader(engine);
  load(store)
    .then(function (newState) {
      // Check if the user is logged in
      const isLoggedIn = newState.auth.token !== null;
      const userSettings = Map(newState.settings);

      if (isLoggedIn) {
        restoreSettings(userSettings);
        store.dispatch(checkHasStarred());
        store.dispatch(fetchNotifications());
      }
    });

  return store;
};
