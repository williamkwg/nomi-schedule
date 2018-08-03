import ScheduleLoader from './src/ScheduleLoader';
let app = {
  config: {},
  env: 'dev'
}
import { join } from 'path'
const sLoader = new ScheduleLoader(join(process.cwd(), 'schedule'), app);
