# Secret Islands

![preview](https://raw.githubusercontent.com/dangerousbeans/secret-islands/master/island.png)

## Setup
```sh
npm install
```


You need to add your ssb keys to localStorage under 'keys' or it will generate new ones

Inside `main.js` change to match the output from `ssb-server ws.getAddress`

```javascript
Vue.use(ssbclient, { keys: localStorage.keys, remote: "ws://localhost:9000~shs:TXKFQehlyoSn8UJAIVP/k2BjFINC591MlBC2e2d24mA=" })
```

Run the ssb-server configuration (or similar)

```sh
node ssb-server.js
```

### run for development with hot reload
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
