import ScheduleLoader from './src/ScheduleLoader';
let app = {
  config: {},
  env: 'dev'
}
const sLoader = new ScheduleLoader(['test/schedule'], app);

setTimeout(() => {
  sLoader.closeAll();
}, 10000)
