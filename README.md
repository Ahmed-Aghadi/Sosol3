## Getting Started

A decentralized social network platform where content creators all around the world can connect together by chatting with each other, upload their videos, create NFTs based on the thumbnails, mint NFTs where they would get randomly any of the NFTs, etc.

XMTP is used to provide chatting features, Chainlink is used to get random NFTs, tableland is used for decentralized sql database, IPFS ( Filecoin ) is used to store files and other data, moralis is used to develop the website and it's functionalities and valist was used to upload the website in IPFS thus making it decentralized.

Deployed website at Vercel: [Sosol3](https://sonate3.vercel.app/)

Deployed website at Valist: [Sosol3](https://bafybeidlegwqvriexcjd77umtroub3lhgepca3eh63foctht5rkuvpfk7a.ipfs.gateway.valist.io/)

To run frontend :

```bash
cd client/

yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To deploy smart contracts to localhost :

```bash
cd smart_contracts/

yarn hardhat deploy --network localhost
```
