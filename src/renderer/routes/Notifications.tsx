import { type FC, useContext, useMemo } from 'react';

import { AllRead } from '../components/AllRead';
import { Oops } from '../components/Oops';
import { AccountNotifications } from '../components/notifications/AccountNotifications';
import { AppContext } from '../context/App';
import { getAccountUUID } from '../utils/auth/utils';
import { Errors } from '../utils/errors';
import { getNotificationCount } from '../utils/notifications/notifications';

export const NotificationsRoute: FC = () => {
  const { notifications, status, globalError, settings } =
    useContext(AppContext);

  const hasMultipleAccounts = useMemo(
    () => notifications.length > 1,
    [notifications],
  );

  const hasNoAccountErrors = useMemo(
    () => notifications.every((account) => account.error === null),
    [notifications],
  );

  const hasNotifications = useMemo(
    () => getNotificationCount(notifications) > 0,
    [notifications],
  );

  if (status === 'error') {
    return <Oops error={globalError ?? Errors.UNKNOWN} />;
  }

  if (!hasNotifications && hasNoAccountErrors) {
    return <AllRead />;
  }

  return (
    <>
      {notifications.map((accountNotifications) => (
        <AccountNotifications
          key={getAccountUUID(accountNotifications.account)}
          account={accountNotifications.account}
          notifications={accountNotifications.notifications}
          error={accountNotifications.error}
          showAccountHeader={hasMultipleAccounts || settings.showAccountHeader}
        />
      ))}
    </>
  );
};
