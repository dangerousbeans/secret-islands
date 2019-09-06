# Secret Islands

![preview](https://raw.githubusercontent.com/dangerousbeans/secret-islands/master/island.png)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdangerousbeans%2Fsecret-islands.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdangerousbeans%2Fsecret-islands?ref=badge_shield)

## Setup
```sh
npm install
```

You need to add your ssb keys to localStorage under 'keys' or it will generate new ones

Inside `main.js` change to match the output from `ssb-server ws.getAddress`

```javascript
Vue.use(ssbclient, { keys: localStorage.keys, remote: "ws://localhost:8989~shs:TXKFQehlyoSn8UJAIVP/k2BjFINC591MlBC2e2d24mA=" })
```

Run the ssb-server configuration or open [Patchwork](https://github.com/ssbc/patchwork) or [Patchbay](https://github.com/ssbc/patchbay)

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

### Deploys to ghpages
```
npm run ghpages
```


## TODO

- [x] render map
- [x] geo post
- [x] geo filter posts
- [x] public onboarding pub
- [ ] warn about using non-local, encourage local sbot or electron version
- [x] clingy pub: follow back connection attempts
- [x] inital follow (follow the clingy pub to get started)
- [x] activity map
- [ ] SSB City place to put existing non-geocoded activity


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdangerousbeans%2Fsecret-islands.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdangerousbeans%2Fsecret-islands?ref=badge_large)