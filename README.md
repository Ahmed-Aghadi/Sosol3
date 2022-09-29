## Details

A decentralized social network platform where content creators all around the world can connect together by chatting with each other, upload their videos, create NFTs based on the thumbnails, mint NFTs where they would get randomly any of the NFTs, etc.

XMTP is used to provide chatting features, Chainlink is used to get random number to select a particular NFT randomly considering it's rarity also, tableland is used for decentralized sql database, IPFS ( Filecoin ) is used to store files and other data, moralis is used to develop the website and it's functionalities and valist was used to upload the website in IPFS thus making it decentralized.

| Sponsors Used |
|---------------|
|[Moralis](#moralis)|
|[Filecoin](#filecoin)|
|[XMTP](#xmtp)|
|[Chainlink](#chainlink)|
|[Tableland](#tableland)|
|[Valist](#valist)|
|[Polygon](#polygon)|

## Deployements

Deployed website at Vercel: [Sosol3](https://sosol3.vercel.app/)

Deployed website at Valist: [Sosol3](https://bafybeihgiaqcxwzg6udbfszkpjjhb5gejgihgetfvb22tsftkyjfkon5wm.ipfs.gateway.valist.io/)

## Getting Started

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

## Sponsors Used

### Moralis

Moralis was used to create the website barebone as it provides sign in, save to ipfs, database and a lot more.

[One use case example in the project](https://github.com/Ahmed-Aghadi/Sosol3/blob/main/client/src/index.js#L35)

### Filecoin

Filecoin was used to store content creators's contents that is their videos. And then to fetch it such that globaly everyone can see and appreciate the content in an decentralized way.

[One use case example in the project](https://github.com/Ahmed-Aghadi/Sosol3/blob/main/client/src/components/Upload.js#L277)

### XMTP

XMTP is used for providing chatting features to users where they communicate with each other by adding their address or they can message the content creator.

[One use case example in the project](https://github.com/Ahmed-Aghadi/Sosol3/blob/main/client/src/components/Chat.js#L481)

### Chainlink

Chainlink was used to randomly select an NFTs out of 3 based on their rarities while minting.

[One use case example in the project](https://github.com/Ahmed-Aghadi/Sosol3/blob/main/smart_contracts/contracts/SosolNFTMarketplace.sol#L56)

### Tableland

Tableland was used to store the public data of every users and appropriate URIs of contents to fetch it instantly and give a better user experience.

[One use case example in the project](https://github.com/Ahmed-Aghadi/Sosol3/blob/main/smart_contracts/contracts/SosolNFTTableland.sol)

### Valist

Valist was used to deploy the website in an decentralized platform that makes the platform completely decentralized giving users more trust and freedom. It is used to manage releases and other things for project managment and it's members.

[One use case example in the project](https://bafybeihgiaqcxwzg6udbfszkpjjhb5gejgihgetfvb22tsftkyjfkon5wm.ipfs.gateway.valist.io/)

### Polygon

All the smart contracts are deployed on polygon mumbai testnet.

[One use case example in the project](https://github.com/Ahmed-Aghadi/Sosol3/tree/main/smart_contracts/contracts)

