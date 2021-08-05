### TEA Browser Wallet
Based on VUE and Polkadot JS

## Running the Wallet
You have 3 options for running the TEA browser wallet:

1. **Remote.** You can access the browser wallet using a remote host. We will eventually be remotely hosting the client wallet at [wallet.teaproject.org](https://wallet.teaproject.org). It is currently accessible at either http://198.199.82.222/ or http://68.183.182.174/ 

2. **IPFS.**  The **IPFS CID** for the TEA browser wallet is: 

`QmZfSY3Ft74WdRMohmU9a5PatYp556RSevp1rGUeuLbjDc`

Any IPFS gateway can load the CID to launch our wallet. You can try it at
[https://gateway.ipfs.io/ipfs/QmZfSY3Ft74WdRMohmU9a5PatYp556RSevp1rGUeuLbjDc](https://gateway.ipfs.io/ipfs/QmZfSY3Ft74WdRMohmU9a5PatYp556RSevp1rGUeuLbjDc)

or at the following [US gateway link](http://64.227.49.206:8080/ipfs/QmZfSY3Ft74WdRMohmU9a5PatYp556RSevp1rGUeuLbjDc).

Keep in mind that IPFS will be very slow until there's enough nodes hosting the TEA browser wallet.

3. **Local.** The TEA Project is decentralized, allowing you to run the browser wallet locally on your machine without the aid of any central servers. 

- To get started, you should first have Node.js installed on your computer. The [official repo](https://nodejs.org/en/download/) should be sufficient for most users, though [Windows](https://github.com/coreybutler/nvm-windows) and [Mac](https://formulae.brew.sh/formula/node) users might wish to install using a package manager. Just make sure that the Node version is greater than 14.

- Visit https://github.com/tearust/tea-browser-wallet/ and download the repo:

![](https://raw.githubusercontent.com/tearust/tea-docs/main/res/Try_the_demo/Try_the_demo-Tea-Browser-Wallet-download.png)

Unpack the zip archive.

- Start the browser wallet. From your command line terminal, run the following two commands when in the downloaded **tea-browser-wallet-master** folder :

`npm i`

`npm start`

![](https://raw.githubusercontent.com/tearust/tea-docs/main/res/Try_the_demo/Try_the_demo-node_start.png)

- You should now to be able to access the browser wallet using localhost with the given port in your web browser:

![](https://raw.githubusercontent.com/tearust/tea-docs/main/res/Try_the_demo/Try_the_demo-wallet-localhost.png)

You can use either [localhost:3000](http://localhost:3000) or [127.0.0.1:3000](http://127.0.0.1:3000)
