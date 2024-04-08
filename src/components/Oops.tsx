import { type FC, useMemo } from 'react';

import type { GitifyError } from '../types';

interface IProps {
  error: GitifyError;
}

export const Oops: FC<IProps> = ({ error }) => {
  const emoji = useMemo(
    () => error.emojis[Math.floor(Math.random() * error.emojis.length)],
    [],
  );

  return (
    <div className="flex flex-1 flex-col justify-center items-center p-4 bg-white dark:bg-gray-dark text-black dark:text-white">
      <h1 className="text-5xl mb-5">{emoji}</h1>

      <h2 className="font-semibold text-xl mb-2 text-semibold">
        {error.title}
      </h2>
      <div>{error.description}</div>
    </div>
  );
};
