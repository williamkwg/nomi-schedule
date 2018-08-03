import ScheduleLoader from './src/ScheduleLoader';
let app = {
  config: {},
  env: 'dev',
  name: 'nomi'
}
const sLoader = new ScheduleLoader(['test/schedule'], app);

setTimeout(() => {
  sLoader.closeAll();
}, 100000)
