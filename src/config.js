import { join } from 'path';
export const defaultDir = join(process.cwd(), 'schedule');
export const defaultConfig = {
  name: 'defaultSchedule', // default fileName 
  handle: (app) => {}, // handle: dirA.childrenDirA.file.method
  callback: (app) => {},
  disabled: false,
  corn: '*/24 * * *',
  immediate: false
}

