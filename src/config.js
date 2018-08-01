import { join } from 'path';
export const defaultDir = join(process.cwd(), 'schedule');
export const defaultConfig = {
  name: 'defaultSchedule', // default fileName 
  handle: (app) => {}, // handle: dirA.childrenDirA.file.method
  callback: (app) => {},
  corn: '*/24 * * *',
  immediate: false
}

