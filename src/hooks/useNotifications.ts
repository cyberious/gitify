import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';

import { AccountNotifications, AuthState, SettingsState } from '../types';
import { apiRequestAuth } from '../utils/api-requests';
import {
  getEnterpriseAccountToken,
  generateGitHubAPIUrl,
} from '../utils/helpers';
import { removeNotification } from '../utils/remove-notification';
import {
  triggerNativeNotifications,
  setTrayIconColor,
} from '../utils/notifications';
import Constants from '../utils/constants';
import { removeNotifications } from '../utils/remove-notifications';

interface NotificationsState {
  notifications: AccountNotifications[];
  fetchNotifications: (
    accounts: AuthState,
    settings: SettingsState
  ) => Promise<void>;
  markNotification: (
    accounts: AuthState,
    id: string,
    hostname: string
  ) => Promise<void>;
  unsubscribeNotification: (
    accounts: AuthState,
    id: string,
    hostname: string
  ) => Promise<void>;
  markRepoNotifications: (
    accounts: AuthState,
    repoSlug: string,
    hostname: string
  ) => Promise<void>;
  isFetching: boolean;
  requestFailed: boolean;
}

export const useNotifications = (): NotificationsState => {
  const [isFetching, setIsFetching] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [notifications, setNotifications] = useState<AccountNotifications[]>(
    []
  );

  const fetchNotifications = useCallback(
    async (accounts: AuthState, settings) => {
      const isGitHubLoggedIn = accounts.token !== null;
      const endpointSuffix = `notifications?participating=${settings.participating}`;

      function getGitHubNotifications(page = 0): AxiosPromise<any> {
        if (!isGitHubLoggedIn) {
          return;
        }
        const url = `https://api.${Constants.DEFAULT_AUTH_OPTIONS.hostname}/${endpointSuffix}&page=${page}`;
        return apiRequestAuth(url, 'GET', accounts.token);
      }

      function getEnterpriseNotifications(): AxiosPromise<any>[] {
        return accounts.enterpriseAccounts.map((account) => {
          const hostname = account.hostname;
          const token = account.token;
          const url = `https://${hostname}/api/v3/${endpointSuffix}`;
          return apiRequestAuth(url, 'GET', token);
        });
      }

      setIsFetching(true);
      setRequestFailed(false);

      function getAllGithubNotifications(): AxiosPromise<any>[] {
        return Array.from(Array(20).keys()).map((page) => {
          return getGitHubNotifications(page);
        });
      }

      const promise = new Promise<void>(async (result, reject) => {
        const entResponses = await axios.all([...getEnterpriseNotifications()]);
        const enterpriseNotifications = entResponses.map((resp) => {
          return {
            hostname: settings.hostname,
            notifications: resp.data,
          };
        });
        const gitResponses = await axios.all([...getAllGithubNotifications()]);
        const githubNotifications = [];
        gitResponses.map((resp) => {
          let respData = [];
          try {
            respData = resp.data;
            githubNotifications.push(...respData);
          } catch (e) {
            console.log(`Unable to get data from Response: ${e}`);
          }
        });

        const data = isGitHubLoggedIn
          ? [
              {
                hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
                notifications: githubNotifications,
              },
              ...enterpriseNotifications,
            ]
          : [...enterpriseNotifications];

        triggerNativeNotifications(
          notifications,
          data,
          settings,
          accounts.user
        );
        setNotifications(data);
        setIsFetching(false);
      });

      return promise;
    },
    [notifications]
  );
  const markNotification = useCallback(
    async (accounts, id, hostname) => {
      setIsFetching(true);

      const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;
      let resp: AxiosResponse;
      try {
        resp = await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}notifications/threads/${id}`,
          'PATCH',
          token,
          {}
        );

        if (resp.status > 299) {
          console.log(
            'Unable to acknowledge Notification: Status: %d; Message: %s',
            resp.statusText,
            resp.data.message
          );
        }

        const updatedNotifications = removeNotification(
          id,
          notifications,
          hostname
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        console.log(
          'Unable to mark notification as read: %s: Error: %s',
          resp,
          err
        );
        setIsFetching(false);
      }
    },
    [notifications]
  );

  const unsubscribeNotification = useCallback(
    async (accounts, id, hostname) => {
      setIsFetching(true);

      const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        await apiRequestAuth(
          `${generateGitHubAPIUrl(
            hostname
          )}notifications/threads/${id}/subscription`,
          'PUT',
          token,
          { ignored: true }
        );
        await markNotification(accounts, id, hostname);
      } catch (err) {
        console.log('Unable to unsubscribe from notification %s', err);
        setIsFetching(false);
      }
    },
    [notifications]
  );

  const markRepoNotifications = useCallback(
    async (accounts, repoSlug, hostname) => {
      setIsFetching(true);

      const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
      const token = isEnterprise
        ? getEnterpriseAccountToken(hostname, accounts.enterpriseAccounts)
        : accounts.token;

      try {
        const resp = await apiRequestAuth(
          `${generateGitHubAPIUrl(hostname)}repos/${repoSlug}/notifications`,
          'PUT',
          token,
          {}
        );

        if (resp.status > 299) {
          console.log(
            'Unable to acknowledge RepoNotification: Status: %d; Message: %s',
            resp.statusText,
            resp.data.message
          );
        }

        const updatedNotifications = removeNotifications(
          repoSlug,
          notifications,
          hostname
        );

        setNotifications(updatedNotifications);
        setTrayIconColor(updatedNotifications);
        setIsFetching(false);
      } catch (err) {
        console.log('Unable to patch request %s', err);
        setIsFetching(false);
      }
    },
    [notifications]
  );

  return {
    isFetching,
    requestFailed,
    notifications,

    fetchNotifications,
    markNotification,
    unsubscribeNotification,
    markRepoNotifications,
  };
};
