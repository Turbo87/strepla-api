
strepla-api
==============================================================================

[scoring*StrePla] "API" wrapper

[scoring*StrePla]: http://strepla.de/scs/

Installation
------------------------------------------------------------------------------

```
yarn add strepla-api
```


Usage
------------------------------------------------------------------------------

```js
const { overview, scoreDay } = require('strepla-api');

(async function() {
  let cID = 388;
  let o = await overview(cID);
  // -> http://strepla.de/scs/Public/overview.aspx?cId=388 in JSON form

  let idDay = 5701;
  let d = await scoreDay(cID, idDay);
  // -> http://strepla.de/scs/Public/scoreDay.aspx?cId=388&idDay=5701 in JSON form
})();
```


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
