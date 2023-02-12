import Dict = NodeJS.Dict;

const mockApp = {
    getPath: mockGetPath,
    setLoginItemSettings: mockSetLoginItemSettings,
    getAppPath() {
        return '/app/working/path';
    }
};

const mockProcess = {
    env: jest.fn()
};

function mockGetPath(path: string) {
    return 'somtething';
}

function mockSetLoginItemSettings(hash: Dict<any>) {
    return 'blah';
}

export const app = mockApp;
export const process = mockProcess;


const getCurrentWindow = {
    hide: jest.fn()
}

const browserWindow = {
    loadURL: jest.fn(),
    webContents: {
        on: () => {
        },
        session: {
            clearStorageData: jest.fn(),
        },
    },
    on: () => {
    },
    close: jest.fn(),
    hide: jest.fn(),
    destroy: jest.fn(),
};

module.exports = {
    BrowserWindow: () => browserWindow,
    getCurrentWindow: () => getCurrentWindow
}