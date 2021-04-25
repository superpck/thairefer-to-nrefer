# Thai Refer API for nRefer


```
npm i typescript -g
npm i ts-node -g
```

```
git clone https://github.com/superpck/thairefer-to-nrefer
cd thairefer-to-nrefer
npm i
```

## Running

```
cp config.txt config
edit config
npm start
```

test from browser http://localhost:3009

## PM2

```
compile with command 'tst'
pm2 start app/index.js -i 2 --name "send2nrefer"
```
