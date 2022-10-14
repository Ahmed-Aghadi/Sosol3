import React, { useEffect, useState } from "react";
import { connect } from "@tableland/sdk";
import { useContractRead, useSigner } from "wagmi";
import { sosolVideosAbi, sosolVideosContractAddress } from "../constants";
import { useMoralisWeb3Api } from "react-moralis";
import {
    AspectRatio,
    Box,
    Card,
    Center,
    Container,
    createStyles,
    Image,
    Loader,
    Paper,
    SimpleGrid,
    Text,
    Title,
} from "@mantine/core";
import VideoPage from "./VideoPage";
import { useLocation, useNavigate } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    card: {
        transition: "transform 150ms ease, box-shadow 150ms ease",

        "&:hover": {
            transform: "scale(1.01)",
            boxShadow: theme.shadows.md,
            cursor: "pointer",
        },
    },

    title: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        fontWeight: 600,
    },
}));

function Dashboard() {
    const { data: signer } = useSigner();
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [isGetItemsStarted, setIsGetItemsStarted] = useState(false);
    const { data: sosolVideosTableName, isFetched } = useContractRead({
        addressOrName: sosolVideosContractAddress,
        contractInterface: sosolVideosAbi,
        functionName: "getTableName",
    });
    const navigate = useNavigate();
    const { classes } = useStyles();
    const Web3Api = useMoralisWeb3Api();

    useEffect(() => {
        if (isFetched && signer) {
            fetchNFTs();
            getItems();
        }
    }, [isFetched, signer]);

    const fetchNFTs = async () => {
        // get polygon NFTs for address
        const options = {
            chain: "mumbai",
            address: await signer.getAddress(),
        };
        const polygonNFTs = await Web3Api.account.getNFTs(options);
        console.log("polygonNFTs", polygonNFTs);
    };

    const cards = items.map((item) => (
        <Box
            key={item[0]}
            p="sm"
            radius="md"
            className={classes.card}
            onClick={() => {
                navigate("/video/" + item[0]);
            }}
        >
            <AspectRatio ratio={1920 / 1080}>
                <Image src={"https://ipfs.moralis.io:2053/ipfs/" + item[3]} />
            </AspectRatio>
            <Text
                color="dimmed"
                size="xs"
                transform="uppercase"
                weight={700}
                mt="md"
            >
                {item[1]}
            </Text>
            <Text className={classes.title} mt={5}>
                {item[2]}
            </Text>
        </Box>
    ));

    const getItems = async () => {
        setItems([]);
        console.log("use2");
        console.log(sosolVideosTableName);
        setIsGetItemsStarted(true);
        const tableland = await connect({
            network: "testnet",
            chain: "polygon-mumbai",
            signer: signer,
        });
        const userAddress = (await signer.getAddress()).toLowerCase();
        console.log("userAddress");
        console.log(userAddress);
        let result = await tableland.read(
            `SELECT * FROM ${sosolVideosTableName} where userAddress='${userAddress}';`
        );
        const { columns, rows } = result;
        console.log(columns);
        console.log(rows);
        setItems(rows);
        setIsLoading(false);
    };
    return (
        <>
            {isLoading ? (
                <Center>
                    <Loader />
                </Center>
            ) : items.length != 0 ? (
                <Container>
                    <Title>Your Videos</Title>
                    <SimpleGrid cols={2}>{cards}</SimpleGrid>
                </Container>
            ) : (
                <Text
                    component="span"
                    align="center"
                    variant="gradient"
                    gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                    size="xl"
                    weight={700}
                    style={{ fontFamily: "Greycliff CF, sans-serif" }}
                >
                    You have not uploaded any video
                </Text>
            )}
        </>
    );
}

export default Dashboard;
