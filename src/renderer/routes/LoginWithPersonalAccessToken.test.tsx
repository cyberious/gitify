import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import {
  LoginWithPersonalAccessTokenRoute,
  validate,
} from './LoginWithPersonalAccessToken';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('renderer/routes/LoginWithPersonalAccessToken.tsx', () => {
  const mockLoginWithPersonalAccessToken = jest.fn();
  const openExternalLinkMock = jest
    .spyOn(comms, 'openExternalLink')
    .mockImplementation();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const tree = render(
      <MemoryRouter>
        <LoginWithPersonalAccessTokenRoute />
      </MemoryRouter>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('let us go back', () => {
    render(
      <MemoryRouter>
        <LoginWithPersonalAccessTokenRoute />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('header-nav-back'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should validate the form values', () => {
    const emptyValues = {
      hostname: null,
      token: null,
    };

    let values = {
      ...emptyValues,
    };
    expect(validate(values).hostname).toBe('Required');
    expect(validate(values).token).toBe('Required');

    values = {
      ...emptyValues,
      hostname: 'hello',
      token: '!@£INVALID-.1',
    };
    expect(validate(values).hostname).toBe('Invalid hostname.');
    expect(validate(values).token).toBe('Invalid token.');
  });

  describe("'Generate a PAT' button", () => {
    it('should be disabled if no hostname configured', async () => {
      render(
        <AppContext.Provider
          value={{
            loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
          }}
        >
          <MemoryRouter>
            <LoginWithPersonalAccessTokenRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.change(screen.getByLabelText('Hostname'), {
        target: { value: '' },
      });

      fireEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(0);
    });

    it('should open in browser if hostname configured', async () => {
      render(
        <AppContext.Provider
          value={{
            loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
          }}
        >
          <MemoryRouter>
            <LoginWithPersonalAccessTokenRoute />
          </MemoryRouter>
        </AppContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('login-create-token'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should login using a token - success', async () => {
    mockLoginWithPersonalAccessToken.mockResolvedValueOnce(null);

    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <MemoryRouter>
          <LoginWithPersonalAccessTokenRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1),
    );

    expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
  });

  it('should login using a token - failure', async () => {
    mockLoginWithPersonalAccessToken.mockRejectedValueOnce(null);

    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <MemoryRouter>
          <LoginWithPersonalAccessTokenRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '1234567890123456789012345678901234567890' },
    });

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'github.com' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() =>
      expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1),
    );

    expect(mockLoginWithPersonalAccessToken).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  it('should render the form with errors', () => {
    render(
      <MemoryRouter>
        <LoginWithPersonalAccessTokenRoute />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Hostname'), {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByTestId('login-submit'));

    expect(screen.getByText('Invalid hostname.')).toBeDefined();
    expect(screen.getByText('Invalid token.')).toBeDefined();
  });

  it('should open help docs in the browser', async () => {
    render(
      <AppContext.Provider
        value={{
          loginWithPersonalAccessToken: mockLoginWithPersonalAccessToken,
        }}
      >
        <MemoryRouter>
          <LoginWithPersonalAccessTokenRoute />
        </MemoryRouter>
      </AppContext.Provider>,
    );

    fireEvent.click(screen.getByTestId('login-docs'));

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
  });
});
