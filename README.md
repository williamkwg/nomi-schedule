# nomi-schedule

the schedule manager of nomi framework.

## Installation

``` bash
$ npm install nomi-schedule --save
```

Node.js >= 8.0.0  required.

## API

- getEnableSchedule
- runSchedule
- close
- closeAll

## Usage

First of all, we add schedule config file to a dir, eg: {app_root}/app/schedule.

``` javascript

module.exports = {
  name: 'loggerSchedule', // default fileName 
  handle:  (app) => { console.log(`logger: ${app.name}`) }, // handle:dirA.childrenDirA.file.method
  callback:  () => { console.log( `logger callback`) }, // only exec once
  disabled: false,
  interval: '2s',
  cron: '',
  immediate: true,
  env: []
}
```

Then, we cound call method to exec schedule.

``` javascript

const ScheduleLoader = require("nomi-schedule");
let app = {
  config: {},
  env: 'dev',
  name: 'nomi'
}
const sLoader = new ScheduleLoader(['app/schedule'], app);

console.log(sLoader.getEnableSchedule());
console.log(sLoader.getAllSchedule());

setTimeout(() => {

  console.log(`----`)
  sLoader.runSchedule('test.schedule.logSchedule');
  console.log(`----`)

  sLoader.close('loggerSchedule');

}, 3000);

setTimeout(() => {
  sLoader.closeAll();
}, 100000);

```

### Scheduling

schedule is an object that contains one required property, type, and optional properties, { name, callback, cron, handle, interval, immediate, disabled, env, ... }.

Cron-style Scheduling
Use cron-parser.

``` bash 
@hourly / @daily / @weekly / @monthly / @yearly is also supported.

*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)

```

#### Example

``` javascript
module.exports = {
  name: 'fetchDataSchedule', // default fileName 
  handle:  'test.bz.Fetch.fetchData', // handle: dirA.childrenDirA.file.method
  callback:  (app) => {console.log(`fetchData callback ${app.name}`)}, // only exec once
  disabled: false,
  cron: '0/5 * * * * ',
  interval: 1000,
  immediate: false,
  env: []
}
```

``` javascript
module.exports = {
  name: '', // default fileName 
  handle:  (app) => {console.log(`logger: ${app.name}`)}, // handle: dirA.childrenDirA.file.method
  callback:  () => {console.log( `logger callback`)}, 
  disabled: false,
  interval: '2s',
  cron: '',
  immediate: true,
  env: []
}
```

