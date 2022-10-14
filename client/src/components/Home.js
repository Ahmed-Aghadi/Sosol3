import React, { useEffect, useState } from "react";
import { connect } from "@tableland/sdk";
import { useContractRead, useSigner } from "wagmi";
import { sosolVideosAbi, sosolVideosContractAddress } from "../constants";
import {
    AspectRatio,
    Box,
    Card,
    Center,
    Container,
    createStyles,
    Grid,
    Image,
    Loader,
    Paper,
    SimpleGrid,
    Text,
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

function Home() {
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

    useEffect(() => {
        if (!isGetItemsStarted && isFetched) {
            getItems();
        }
    }, [isFetched]);

    const cards = items.map((item) => (
        <Grid.Col span={4}>
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
                    <Image
                        src={"https://gateway.moralisipfs.com/ipfs/" + item[3]}
                    />
                </AspectRatio>
                <Text
                    color="dimmed"
                    size="xs"
                    transform="uppercase"
                    weight={700}
                    mt="md"
                >
                    {item[1] &&
                        item[1].substring(0, 8) + "..." + item[1].substring(38)}
                </Text>
                <Text className={classes.title} mt={5}>
                    {item[2]}
                </Text>
            </Box>
        </Grid.Col>
    ));

    const getItems = async () => {
        console.log("use2");
        console.log(sosolVideosTableName);
        setIsGetItemsStarted(true);
        const tableland = await connect({
            network: "testnet",
            chain: "polygon-mumbai",
            signer: signer,
        });
        let result = await tableland.read(
            `SELECT * FROM ${sosolVideosTableName};`
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
                    <Grid justify="space-between" align="center" cols={3}>
                        {cards}
                    </Grid>
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
                    No videos uploaded
                </Text>
            )}
        </>
    );
}

{
    /* <SimpleGrid cols={3}>
                    {items.map((item) => {
                        return (
                            <Box>
                                <Image
                                    key={item[0]}
                                    src={
                                        "https://gateway.moralisipfs.com/ipfs/" +
                                        item[3]
                                    }
                                    controls={true}
                                    onClick={(e) => {
                                        navigate("/video/" + item[4]);
                                    }}
                                />
                                <Text>{item[2]}</Text>
                            </Box>
                        );
                    })}
                </SimpleGrid> */
}

export default Home;
