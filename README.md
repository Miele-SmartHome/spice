# SPINE IoT Communication Emulator (EEBUS)

### Installation

Clone this repository and change directory into it.

```
git clone https://github.com/Miele-SmartHome/spice.git
cd spice
```

Install the dependencies

```
npm install
```

Configure your OAuth2 Data at the bottom of `js/base.js`. 

```
...
window.eesim.data.client_secret = ""; // OAuth2 Client Secret (Optional)
...
window.eesim.data.apiurl = ""; // SPINE API URL (MANDATORY, no trailing slash)
```
Note: You can skip the values marked with `(Optional)`. These values can be supplied in the app itself.

Serve the folder via an HTTP server, preferably via `localhost:80`. (You can change this in `package.json` file)

```
npm start
```

Note: You might need administrator/root permissions. 

## License

Copyright (c) 2025 Miele & Cie. KG, MIT

Copyright (c) 2018 ApexCharts, MIT (apexhelper-charts.js, supplied in this repo)

This software is released under the MIT License. 