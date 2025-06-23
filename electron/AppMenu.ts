import { app, Menu, MenuItemConstructorOptions } from 'electron'

const isMac = process.platform === 'darwin';

const template: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' }
    ...(isMac
        ? [{
            label: app.name,
            submenu: [
                { role: 'about' as const },
                { type: 'separator' as const },
                {
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,',
                    click: (_: any, focusedWindow: any) => {
                        focusedWindow?.webContents.send('menu:open-settings');
                    }
                },
                { type: 'separator' as const },
                { role: 'services' as const },
                { type: 'separator' as const },
                { role: 'hide' as const },
                { role: 'hideOthers' as const },
                { role: 'unhide' as const },
                { type: 'separator' as const },
                { role: 'quit' as const }
            ]
        }]
    : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: isMac
            ? [
                { role: 'close' as const }
            ]
            : [
                {
                    label: 'Settings...',
                    accelerator: 'CmdOrCtrl+,',
                    click: (_: any, focusedWindow: any) => {
                        focusedWindow?.webContents.send('menu:open-settings');
                    }
                },
                { type: 'separator' as const },
                { role: 'quit' as const }
            ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { type: 'separator' as const },
            { role: 'copy' as const },
            ...(isMac
                ? [
                    { role: 'selectAll' as const },
                    { type: 'separator' as const },
                    { label: 'Speech',
                        submenu: [
                            { role: 'startSpeaking' as const },
                            { role: 'stopSpeaking' as const }
                        ]
                    }
                ] : [
                    { type: 'separator' as const },
                    { role: 'selectAll' as const }
                ]),
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'reload' as const },
            { role: 'forceReload' as const },
            { role: 'toggleDevTools' as const },
            { type: 'separator' as const },
            { role: 'resetZoom' as const },
            { role: 'zoomIn' as const },
            { role: 'zoomOut' as const },
            { type: 'separator' as const },
            { role: 'togglefullscreen' as const }
        ]
    },
    // { role: 'windowMenu' }
    {
        label: 'Window',
        submenu: [
            { role: 'minimize' as const },
            { role: 'zoom' as const },
            ...(isMac
                ? [
                    { type: 'separator' as const },
                    { role: 'front' as const },
                    { type: 'separator' as const },
                    { role: 'window' as const }
                ]
                : [
                    { role: 'close' as const }
                ])
            ]
    },
    {
        role: 'help' as const,
        submenu: [
            { role: 'about' as const }
        ]
    }
];

export function createAppMenu() {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}