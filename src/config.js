import { join } from 'path';
export const defaultDir = join(process.cwd(), 'schedule');
export const defaultConfig = {
  handle: (app) => {}, // handle: dirA.childrenDirA.file.method
  callback: (app) => {},
  disabled: false,
  immediate: false
}

