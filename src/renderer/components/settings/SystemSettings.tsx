import { type FC, useContext } from 'react';

import { DeviceDesktopIcon } from '@primer/octicons-react';

import { APPLICATION } from '../../../shared/constants';
import { isLinux, isMacOS } from '../../../shared/platform';
import { AppContext } from '../../context/App';
import { OpenPreference } from '../../types';
import { Constants } from '../../utils/constants';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Legend } from '../primitives/Legend';

export const SystemSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  return (
    <fieldset>
      <Legend icon={DeviceDesktopIcon}>System</Legend>
      <RadioGroup
        name="openLinks"
        label="Open Links:"
        value={settings.openLinks}
        options={[
          { label: 'Foreground', value: OpenPreference.FOREGROUND },
          { label: 'Background', value: OpenPreference.BACKGROUND },
        ]}
        onChange={(evt) => {
          updateSetting('openLinks', evt.target.value as OpenPreference);
        }}
      />
      <Checkbox
        name="keyboardShortcutEnabled"
        label="Enable keyboard shortcut"
        checked={settings.keyboardShortcut}
        onChange={(evt) =>
          updateSetting('keyboardShortcut', evt.target.checked)
        }
        tooltip={
          <div>
            When enabled you can use the hotkeys{' '}
            <span className="text-gitify-caution">
              {Constants.DEFAULT_KEYBOARD_SHORTCUT}
            </span>{' '}
            to show or hide {APPLICATION.NAME}.
          </div>
        }
      />
      {isMacOS() && (
        <Checkbox
          name="showNotificationsCountInTray"
          label="Show notifications count in tray"
          checked={settings.showNotificationsCountInTray}
          onChange={(evt) =>
            updateSetting('showNotificationsCountInTray', evt.target.checked)
          }
        />
      )}
      <Checkbox
        name="showNotifications"
        label="Show system notifications"
        checked={settings.showNotifications}
        onChange={(evt) =>
          updateSetting('showNotifications', evt.target.checked)
        }
      />
      <Checkbox
        name="playSound"
        label="Play sound"
        checked={settings.playSound}
        onChange={(evt) => updateSetting('playSound', evt.target.checked)}
      />
      <Checkbox
        name="useAlternateIdleIcon"
        label="Use alternate idle icon"
        checked={settings.useAlternateIdleIcon}
        onChange={(evt) =>
          updateSetting('useAlternateIdleIcon', evt.target.checked)
        }
        tooltip={
          <div>
            <div className="pb-3">
              Use a white {APPLICATION.NAME} logo (instead of the default black
              logo) when all notifications are read.
            </div>
            <div>
              This is particularly useful for devices which have a dark-themed
              menubar or taskbar.
            </div>
          </div>
        }
      />
      {!isLinux() && (
        <Checkbox
          name="openAtStartUp"
          label="Open at startup"
          checked={settings.openAtStartup}
          onChange={(evt) => updateSetting('openAtStartup', evt.target.checked)}
        />
      )}
    </fieldset>
  );
};
