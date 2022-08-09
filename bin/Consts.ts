import os from "os"

const homedir = os.userInfo().homedir

export const SETTINGS_FOLDER = `${homedir}/.myta`;
export const SETTINGS = `${homedir}/.myta/settings.json`;
export const LOCAL_STORAGE = `${homedir}/.myta/localStorage.json`;