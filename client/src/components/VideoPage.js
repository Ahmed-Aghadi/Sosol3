import { Carousel } from "@mantine/carousel";
import {
    ActionIcon,
    Badge,
    Button,
    Center,
    Container,
    createStyles,
    Grid,
    Group,
    Image,
    Modal,
    NumberInput,
    Progress,
    Skeleton,
    Slider,
    Switch,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { connect } from "@tableland/sdk";
import { IconCheck, IconX } from "@tabler/icons";
import { ethers } from "ethers";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAccount, useContractRead, useSigner } from "wagmi";
import {
    sosolNFTAbi,
    sosolNFTMarketplaceAbi,
    sosolNFTMarketplaceContractAddress,
    sosolVideosAbi,
    sosolVideosContractAddress,
} from "../constants";
import useWindowDimensions from "../hooks/useWindowDimensions";

const useStyles = createStyles((theme) => ({
    wrapper: {
        position: "relative",
        marginBottom: 30,
        marginTop: 30,
    },

    dropzone: {
        borderWidth: 1,
        paddingBottom: 50,
    },

    icon: {
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[3]
                : theme.colors.gray[4],
    },

    control: {
        position: "absolute",
        width: 250,
        left: "calc(50% - 125px)",
        bottom: -20,
    },

    button: {
        marginTop: 20,
        marginBottom: 30,
    },

    progress: {
        position: "absolute",
        bottom: -1,
        right: -1,
        left: -1,
        top: -1,
        height: "auto",
        backgroundColor: "transparent",
        zIndex: 0,
    },

    label: {
        position: "relative",
        zIndex: 1,
    },
    card: {
        transition: "transform 150ms ease, box-shadow 150ms ease",

        "&:hover": {
            transform: "scale(1.01)",
            boxShadow: theme.shadows.md,
            cursor: "pointer",
        },
    },
}));

const nftsValueDefaultState = { nft1: 33, nft2: 34, nft3: 33 };
const nftsValueReducer = (state, action) => {
    if (action.nftNumber == 1) {
        if (action.value + state.nft2 + state.nft3 <= 100) {
            return { nft1: action.value, nft2: state.nft2, nft3: state.nft3 };
        } else {
            return {
                nft1: 100 - state.nft2 - state.nft3,
                nft2: state.nft2,
                nft3: state.nft3,
            };
        }
    } else if (action.nftNumber == 2) {
        if (action.value + state.nft1 + state.nft3 <= 100) {
            return { nft1: state.nft1, nft2: action.value, nft3: state.nft3 };
        } else {
            return {
                nft1: state.nft1,
                nft2: 100 - state.nft1 - state.nft3,
                nft3: state.nft3,
            };
        }
    } else if (action.nftNumber == 3) {
        if (action.value + state.nft2 + state.nft1 <= 100) {
            return { nft1: state.nft1, nft2: state.nft2, nft3: action.value };
        } else {
            return {
                nft1: state.nft1,
                nft2: state.nft2,
                nft3: 100 - state.nft1 - state.nft2,
            };
        }
    }
    return { nft1: 33, nft2: 34, nft3: 33 };
};

function VideoPage() {
    const { data: signer } = useSigner();
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const { classes, theme } = useStyles();
    // console.log(params);
    const [item, setItem] = useState();
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [ownerAddress, setOwnerAddress] = useState();
    const [thumbnail, setThumbnail] = useState();
    const [thumbnail1, setThumbnail1] = useState();
    const [thumbnail2, setThumbnail2] = useState();
    const [thumbnailCid, setThumbnailCid] = useState();
    const [thumbnailCid1, setThumbnailCid1] = useState();
    const [thumbnailCid2, setThumbnailCid2] = useState();
    const [mintFee, setMintFee] = useState();
    const [totalNFT, setTotalNFT] = useState();
    const [videoUrl, setVideoUrl] = useState();
    const navigate = useNavigate();
    const [nftAddress, setNftAddress] = useState();
    const handleNftCheckButton = async () => {
        setIsModal0Open(true);
    };
    const handleCreateNftButton = async () => {
        setIsModal2Open(true);
    };
    const handleNFTCreation = async () => {
        setIsModal3Open(true);
    };

    const {
        data: sosolVideosTableName,
        isFetched: isSosolVideosTableNameFetched,
    } = useContractRead({
        addressOrName: sosolVideosContractAddress,
        contractInterface: sosolVideosAbi,
        functionName: "getTableName",
    });

    const {
        data: sosolNFTMarketplaceTableName,
        isFetched: isSosolNFTMarketplaceTableNameFetched,
    } = useContractRead({
        addressOrName: sosolNFTMarketplaceContractAddress,
        contractInterface: sosolNFTMarketplaceAbi,
        functionName: "getTableName",
    });
    const [account, setAccount] = useState();
    const [nftButtonValue, setNftButtonValue] = useState(0);
    // const videoRef = useRef();
    const { width: videoWidth, height: videoHeight } = useWindowDimensions();
    let style;
    if (videoHeight >= videoWidth - 250) {
        style = { height: "40vw" };
    } else {
        style = { height: "70vh" };
    }

    const [isModal0Open, setIsModal0Open] = useState(false); // nft check
    // ***********************************
    const [isModal1Open, setIsModal1Open] = useState(false); // nft mint transaction

    const [isModal1ProgressCompleted, setIsModal1ProgressCompleted] =
        useState(false);
    const [modal1Text, setModal1Text] = useState();

    // ***********************************

    const [isModal2Open, setIsModal2Open] = useState(false); // create nft
    const [totalNftInput, setTotalNftInput] = useState(3);
    const totalNftInputRef = useRef();
    const [nftsValue, dispatchNftsValue] = useReducer(
        nftsValueReducer,
        nftsValueDefaultState
    );
    const isNftRarityValid =
        nftsValue.nft1 + nftsValue.nft2 + nftsValue.nft3 == 100;

    const [nftName, setNftName] = useState();
    const [nftSymbol, setNftSymbol] = useState();
    const [mintFeeInput, setMintFeeInput] = useState();

    // ***********************************

    const [isModal3Open, setIsModal3Open] = useState(false); // creating nft transaction loading
    const [modal3Text, setModal3Text] = useState("");
    const [isModal3ButtonEnabled, setIsModal3ButtonEnabled] = useState(false);
    const [isModal3ProgressCompleted, setIsModal3ProgressCompleted] =
        useState(false);

    // ***************************************************************************
    // modal 0

    const thumbnailSize = 300;
    const thumnailCarousel = (
        <Container px={0}>
            <Carousel
                align="center"
                slideSize="70%"
                height={thumbnailSize}
                slideGap="md"
                controlsOffset="xl"
                controlSize={32}
                loop
                withIndicators
                draggable={false}
            >
                <Carousel.Slide>
                    <Image className={classes.card} src={thumbnail} />
                </Carousel.Slide>
                <Carousel.Slide>
                    <Image className={classes.card} src={thumbnail1} />
                </Carousel.Slide>
                <Carousel.Slide>
                    <Image className={classes.card} src={thumbnail2} />
                </Carousel.Slide>
            </Carousel>
        </Container>
    );

    const modal0 = (
        <Modal
            opened={isModal0Open}
            fullScreen
            centered
            size="70%"
            onClose={() => setIsModal0Open(false)}
            overlayColor={
                theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[2]
            }
            overlayOpacity={0.55}
            overlayBlur={3}
            transition="fade"
            transitionDuration={600}
            transitionTimingFunction="ease"
        >
            {thumnailCarousel}
            <Center>
                <Button
                    variant="gradient"
                    gradient={{ from: "orange", to: "red" }}
                    className={classes.button}
                    disabled={!mintFee}
                    onClick={() => {
                        // setIsUpdateDisabled(true);
                        mintNft();
                    }}
                    // disabled={isUpdateDisabled}
                >
                    {mintFee
                        ? "Mint Thumbnail NFT for " +
                          ethers.utils.formatEther(mintFee).toString() +
                          " MATICS"
                        : "Calulating mint fee"}
                </Button>
            </Center>
            <Center>
                {totalNFT ? (
                    totalNFT == 0 ? (
                        <Badge
                            variant="gradient"
                            gradient={{ from: "orange", to: "red" }}
                        >
                            {"Total NFTs Left: " + totalNFT}
                        </Badge>
                    ) : (
                        <Badge
                            variant="gradient"
                            gradient={{ from: "teal", to: "lime", deg: 105 }}
                        >
                            {"Total NFTs Left: " + totalNFT}
                        </Badge>
                    )
                ) : (
                    <Badge variant="outline">
                        Calulating total NFTs left...
                    </Badge>
                )}
            </Center>
        </Modal>
    );

    const mintNft = async () => {
        setIsModal1Open(true);
        setModal1Text("Minting...");
        const contractInstance1 = new ethers.Contract(
            sosolNFTMarketplaceContractAddress,
            sosolNFTMarketplaceAbi,
            signer
        );
        console.log("mint fee", mintFee);
        const tx1 = await contractInstance1.requestNft(nftAddress, {
            value: mintFee,
            gasLimit: 20000000,
        });

        console.log("tx1 done");

        console.log("tx1 hash");
        console.log(tx1.hash);
        console.log("-----------------------------");

        const response1 = await tx1.wait();
        console.log("DONE!!!!!!!!!!!!!!!!!!");

        console.log("response1");
        console.log(response1);

        console.log("response1 hash");
        console.log(response1.hash);
        console.log("-----------------------------");

        showNotification({
            color: "teal",
            title: "Minted!",
            message: "You had successfully minted the NFT!",
            icon: <IconCheck size={16} />,
            autoClose: 2000,
        });
        navigate(0);
    };

    const modal1 = (
        <Modal
            withCloseButton={false}
            opened={isModal1Open}
            centered
            size="70%"
            onClose={() => {}}
            overlayColor={
                theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[2]
            }
            overlayOpacity={0.55}
            overlayBlur={3}
            transition="fade"
            transitionDuration={600}
            transitionTimingFunction="ease"
            closeOnEscape={false}
            closeOnClickOutside={false}
        >
            <Center mb={24}>
                <Text weight={700}>{modal1Text}</Text>
            </Center>
            {isModal1ProgressCompleted ? (
                <Progress radius="xl" size="xl" value={100} />
            ) : (
                <Progress radius="xl" size="xl" value={100} striped animate />
            )}
        </Modal>
    );

    // ***************************************************************************
    // modal 2

    const nftSelectors = (
        <>
            <Center sx={{ margin: 15 }}>
                <Container>
                    <Badge
                        variant="gradient"
                        gradient={{ from: "orange", to: "red" }}
                    >
                        {"Rarity of thumnail 1 NFT: " + nftsValue.nft1}
                    </Badge>
                    <Slider
                        sx={{ marginTop: 10 }}
                        defaultValue={33}
                        value={nftsValue.nft1}
                        onChange={(val) =>
                            dispatchNftsValue({ nftNumber: 1, value: val })
                        }
                        marks={[
                            { value: 10 },
                            { value: 20 },
                            { value: 30 },
                            { value: 40 },
                            { value: 50 },
                            { value: 60 },
                            { value: 70 },
                            { value: 80 },
                            { value: 90 },
                            { value: 100 },
                        ]}
                    />
                </Container>
            </Center>

            <Center sx={{ margin: 15 }}>
                <Container>
                    <Badge
                        variant="gradient"
                        gradient={{ from: "orange", to: "red" }}
                    >
                        {"Rarity of thumnail 2 NFT: " + nftsValue.nft2}
                    </Badge>

                    <Slider
                        sx={{ marginTop: 10 }}
                        defaultValue={34}
                        value={nftsValue.nft2}
                        onChange={(val) =>
                            dispatchNftsValue({ nftNumber: 2, value: val })
                        }
                        marks={[
                            { value: 10 },
                            { value: 20 },
                            { value: 30 },
                            { value: 40 },
                            { value: 50 },
                            { value: 60 },
                            { value: 70 },
                            { value: 80 },
                            { value: 90 },
                            { value: 100 },
                        ]}
                    />
                </Container>
            </Center>

            <Center sx={{ margin: 15 }}>
                <Container>
                    <Badge
                        variant="gradient"
                        gradient={{ from: "orange", to: "red" }}
                    >
                        {"Rarity of thumnail 3 NFT: " + nftsValue.nft3}
                    </Badge>

                    <Slider
                        sx={{ marginTop: 10 }}
                        defaultValue={33}
                        value={nftsValue.nft3}
                        onChange={(val) =>
                            dispatchNftsValue({ nftNumber: 3, value: val })
                        }
                        marks={[
                            { value: 10 },
                            { value: 20 },
                            { value: 30 },
                            { value: 40 },
                            { value: 50 },
                            { value: 60 },
                            { value: 70 },
                            { value: 80 },
                            { value: 90 },
                            { value: 100 },
                        ]}
                    />
                </Container>
            </Center>

            <Center sx={{ margin: 15 }}>
                <Container>
                    <Group position="center">
                        <Switch
                            checked={isNftRarityValid}
                            color="teal"
                            size="md"
                            label={
                                isNftRarityValid
                                    ? "Sum of rarity of all thumbnails is 100%"
                                    : "Sum of rarity of all thumbnails SHOULD BE 100%"
                            }
                            thumbIcon={
                                isNftRarityValid ? (
                                    <IconCheck
                                        size={12}
                                        color={
                                            theme.colors.teal[
                                                theme.fn.primaryShade()
                                            ]
                                        }
                                        stroke={3}
                                    />
                                ) : (
                                    <IconX
                                        size={12}
                                        color={
                                            theme.colors.red[
                                                theme.fn.primaryShade()
                                            ]
                                        }
                                        stroke={3}
                                    />
                                )
                            }
                        />
                    </Group>
                </Container>
            </Center>

            <Center sx={{ margin: 15 }}>
                <Container>
                    <Text
                        component="span"
                        align="center"
                        variant="gradient"
                        gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                        size="xl"
                        weight={700}
                        style={{ fontFamily: "Greycliff CF, sans-serif" }}
                    >
                        Total NFTs
                    </Text>
                    <Group spacing={5}>
                        <ActionIcon
                            size={42}
                            variant="default"
                            onClick={() =>
                                totalNftInput > 1 &&
                                totalNftInputRef.current.decrement()
                            }
                        >
                            –
                        </ActionIcon>

                        <NumberInput
                            hideControls
                            value={totalNftInput}
                            onChange={(val) => setTotalNftInput(val)}
                            handlersRef={totalNftInputRef}
                            // max={10}
                            min={1}
                            step={1}
                            styles={{
                                input: { width: 54, textAlign: "center" },
                            }}
                        />

                        <ActionIcon
                            size={42}
                            variant="default"
                            onClick={() => totalNftInputRef.current.increment()}
                        >
                            +
                        </ActionIcon>
                    </Group>
                </Container>
            </Center>
            <Center>
                <TextInput
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    placeholder="SOSOL NFT"
                    label="Enter name of the NFT"
                    withAsterisk
                />
            </Center>
            <Center>
                <TextInput
                    value={nftSymbol}
                    onChange={(e) => setNftSymbol(e.currentTarget.value)}
                    placeholder="SoSoL"
                    label="Enter symbol of the NFT"
                    withAsterisk
                />
            </Center>
            <Center>
                <TextInput
                    value={mintFeeInput}
                    onChange={(e) => setMintFeeInput(e.currentTarget.value)}
                    placeholder="0.1"
                    label="Enter mint fee of the NFT (we will do the conversion)"
                    withAsterisk
                />
            </Center>
        </>
    );

    const modal2SubmitButton = (
        <Center>
            <Button
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
                className={classes.button}
                onClick={() => {
                    // setIsUpdateDisabled(true);
                    createNFT();
                }}
                // disabled={isUpdateDisabled}
            >
                Upload
            </Button>
        </Center>
    );

    function isValidMintFee(value) {
        if (
            !value ||
            value == "" ||
            !isNumeric(value) ||
            isNaN(value) ||
            parseFloat(value) <= 0
            // amount.toString().indexOf(".") == -1
        ) {
            return false;
        }
        return true;
    }

    function isNumeric(num) {
        let value1 = num.toString();
        let value2 = parseFloat(num).toString();
        return value1 === value2;
    }

    const createNFT = async () => {
        console.log("uploading");

        if (!isNftRarityValid) {
            // setIsUpdateDisabled(false);
            showNotification({
                title: "Sum of rarity of all thumbnails should be 100%!",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }

        if (
            !totalNftInput ||
            totalNftInput <= 0 ||
            !Number.isInteger(totalNftInput)
        ) {
            // setIsUpdateDisabled(false);
            showNotification({
                title: "Enter total number of NFTs!",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }
        if (!isValidMintFee(mintFeeInput)) {
            // setIsUpdateDisabled(false);
            showNotification({
                title: "Enter valid mint fee for the NFT!",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }

        if (!nftName || nftName.trim().length < 0) {
            showNotification({
                title: "Enter name of the NFT!",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("nftName", nftName);
            console.log("invalid");
            return;
        }
        if (!nftSymbol || nftSymbol.trim().length < 0) {
            showNotification({
                title: "Enter symbol of the NFT!",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }
        // setIsModal2Open(false);
        setIsModal3Open(true);

        setModal3Text(
            "Please wait for transaction to process for NFT contract"
        );
        const contractInstance1 = new ethers.Contract(
            sosolNFTMarketplaceContractAddress,
            sosolNFTMarketplaceAbi,
            signer
        );

        const parsedMintFee = ethers.utils.parseUnits(mintFeeInput, "ether");
        console.table(
            parseInt(params.id),
            nftName,
            nftSymbol,
            parsedMintFee,
            [nftsValue.nft1, nftsValue.nft2, nftsValue.nft3],
            [thumbnailCid, thumbnailCid1, thumbnailCid2],
            totalNftInput
        );
        const tx1 = await contractInstance1.createNFT(
            parseInt(params.id),
            nftName,
            nftSymbol,
            parsedMintFee,
            [nftsValue.nft1, nftsValue.nft2, nftsValue.nft3],
            [thumbnailCid, thumbnailCid1, thumbnailCid2],
            totalNftInput
        );

        console.log("tx1 done");

        console.log("tx1 hash");
        console.log(tx1.hash);
        console.log("-----------------------------");

        const response1 = await tx1.wait();
        console.log("DONE!!!!!!!!!!!!!!!!!!");

        console.log("response1");
        console.log(response1);

        console.log("response1 hash");
        console.log(response1.hash);
        console.log("-----------------------------");

        showNotification({
            color: "teal",
            title: "Transaction completed!",
            message: "Transaction for NFT contract completed!",
            icon: <IconCheck size={16} />,
            autoClose: 2000,
        });
        navigate(0);
    };

    const modal2 = (
        <Modal
            opened={isModal2Open}
            fullScreen
            centered
            size="70%"
            onClose={() => setIsModal2Open(false)}
            overlayColor={
                theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[2]
            }
            overlayOpacity={0.55}
            overlayBlur={3}
            transition="fade"
            transitionDuration={600}
            transitionTimingFunction="ease"
        >
            {thumnailCarousel}
            {nftSelectors}
            {modal2SubmitButton}
        </Modal>
    );

    // ***************************************************************************
    // modal3

    const modal3 = (
        <Modal
            withCloseButton={false}
            opened={isModal3Open}
            centered
            size="70%"
            onClose={() => {}}
            overlayColor={
                theme.colorScheme === "dark"
                    ? theme.colors.dark[9]
                    : theme.colors.gray[2]
            }
            overlayOpacity={0.55}
            overlayBlur={3}
            transition="fade"
            transitionDuration={600}
            transitionTimingFunction="ease"
            closeOnEscape={false}
            closeOnClickOutside={false}
        >
            <Center mb={24}>
                <Text weight={700}>{modal3Text}</Text>
            </Center>
            {isModal3ProgressCompleted ? (
                <Progress radius="xl" size="xl" value={100} />
            ) : (
                <Progress radius="xl" size="xl" value={100} striped animate />
            )}
            {isModal3ButtonEnabled && (
                <Center>
                    <Button
                        mt={24}
                        variant="gradient"
                        gradient={{
                            from: "#ed6ea0",
                            to: "#ec8c69",
                            deg: 35,
                        }}
                    >
                        NFT Created
                    </Button>
                </Center>
            )}
        </Modal>
    );

    const handleAccountAddress = async () => {
        const address = await signer.getAddress();
        setAccount(address.toUpperCase());
    };

    useEffect(() => {
        console.log("signer", signer);
        if (signer) {
            handleAccountAddress();
        }
    }, [signer]);

    useEffect(() => {
        console.log(style);
        console.log("videoHeight", videoHeight);
        console.log("videoWidth", videoWidth);
    }, [videoHeight, videoWidth]);

    useEffect(() => {
        console.log("sosolVideosTableName", sosolVideosTableName);
        if (isSosolVideosTableNameFetched) {
            initializeVideo();
        }
    }, [isSosolVideosTableNameFetched]);

    const initializeVideo = async () => {
        console.log("initializing");
        const tableland = await connect({
            network: "testnet",
            chain: "polygon-mumbai",
            signer: signer,
        });
        console.log(params.id);
        console.log(
            `SELECT * FROM ${sosolVideosTableName} where id='${params.id}';`
        );
        let result = await tableland.read(
            `SELECT * FROM ${sosolVideosTableName} where id='${params.id}';`
        );
        console.log("geting cols and rows");
        const { columns, rows } = result;
        console.log(columns);
        console.log(rows);
        let url = "https://ipfs.moralis.io:2053/ipfs/" + rows[0][4];
        setOwnerAddress(rows[0][1].toUpperCase());
        let response = await fetch(url);
        let data = await response.json();
        console.log("data", data);
        setTitle(data["title"]);
        setDescription(data["description"]);
        setVideoUrl("https://ipfs.moralis.io:2053/ipfs/" + data["videoCid"]);
        setThumbnail(
            "https://ipfs.moralis.io:2053/ipfs/" + data["thumbnailCid"]
        );
        setThumbnail1(
            "https://ipfs.moralis.io:2053/ipfs/" + data["thumbnailCid1"]
        );
        setThumbnail2(
            "https://ipfs.moralis.io:2053/ipfs/" + data["thumbnailCid2"]
        );

        setThumbnailCid(data["thumbnailCid"]);
        setThumbnailCid1(data["thumbnailCid1"]);
        setThumbnailCid2(data["thumbnailCid2"]);
        setIsLoading(false);
    };

    useEffect(() => {
        console.log(
            "sosolNFTMarketplaceTableName",
            sosolNFTMarketplaceTableName
        );
        if (isSosolNFTMarketplaceTableNameFetched) {
            initializeNFT();
        }
    }, [isSosolNFTMarketplaceTableNameFetched]);

    const initializeNFT = async () => {
        console.log("initializing");
        const tableland = await connect({
            network: "testnet",
            chain: "polygon-mumbai",
            signer: signer,
        });
        console.log(params.id);
        console.log(
            `SELECT * FROM ${sosolNFTMarketplaceTableName} where videoID='${params.id}';`
        );
        let result = await tableland.read(
            `SELECT * FROM ${sosolNFTMarketplaceTableName} where videoID='${params.id}';`
        );
        console.log("geting cols and rows");
        const { columns, rows } = result;
        console.log(columns);
        console.log(rows);
        if (rows.length == 0) {
            setNftButtonValue(1);
            return;
        }
        setNftAddress(rows[0][2]);
        setNftButtonValue(2);
    };

    useEffect(() => {
        if (signer && nftAddress) {
            initializeMintingFee();
        }
    }, [nftAddress, signer]);

    const initializeMintingFee = async (nftAddressPassed) => {
        console.log("reading mint fees");
        const contractInstance1 = new ethers.Contract(
            nftAddress,
            sosolNFTAbi,
            signer
        );
        const tx = await contractInstance1.getMintFee();
        console.log("tx done");
        console.log("tx", tx);
        setMintFee(tx);
    };

    const initializeTotalNFT = async () => {
        console.log("reading total NFTs left");
        const contractInstance1 = new ethers.Contract(
            sosolNFTMarketplaceContractAddress,
            sosolNFTMarketplaceAbi,
            signer
        );
        const tx = await contractInstance1.getNftTotalToken(nftAddress);
        console.log("tx done");
        console.log("tx", tx);

        setTotalNFT(ethers.utils.formatUnits(tx, 0).toString());
    };

    useEffect(() => {
        if (nftAddress && signer) {
            initializeTotalNFT();
        }
    }, [nftAddress, signer]);
    return (
        <>
            {isLoading ? (
                <Container>
                    <Skeleton style={style} height={8} radius="xl" />
                    <Skeleton height={8} mt={25} radius="xl" />
                    <Skeleton height={8} mt={25} radius="xl" />
                    <Skeleton height={8} mt={25} radius="xl" />
                </Container>
            ) : (
                <Container>
                    <Center sx={{ marginBottom: 20 }}>
                        <video
                            style={style}
                            src={videoUrl}
                            controls={true}
                        ></video>
                    </Center>
                    <Title order={1} sx={{ marginBottom: 20 }}>
                        {title}
                    </Title>
                    <Text mb={25}>Owner: {ownerAddress}</Text>

                    {nftButtonValue == 2 && (
                        <Button
                            onClick={(e) => handleNftCheckButton(e)}
                            variant="gradient"
                            gradient={{
                                from: "teal",
                                to: "lime",
                                deg: 105,
                            }}
                        >
                            Check NFTs
                        </Button>
                    )}

                    {nftButtonValue == 1 && account != ownerAddress && (
                        <Badge
                            variant="gradient"
                            size="24"
                            gradient={{ from: "indigo", to: "cyan" }}
                        >
                            No NFT found
                        </Badge>
                    )}

                    {account == ownerAddress && nftButtonValue == 1 && (
                        <Grid justify="space-between">
                            <Grid.Col span={3}>
                                <Badge
                                    variant="gradient"
                                    size="24"
                                    gradient={{ from: "indigo", to: "cyan" }}
                                >
                                    No NFT found
                                </Badge>
                            </Grid.Col>
                            <Grid.Col span={3}>
                                {nftButtonValue == 1 && (
                                    <Button
                                        onClick={(e) =>
                                            handleCreateNftButton(e)
                                        }
                                        variant="gradient"
                                        gradient={{ from: "orange", to: "red" }}
                                    >
                                        Create NFTs
                                    </Button>
                                )}
                            </Grid.Col>
                        </Grid>
                    )}

                    <Text mt={25}>
                        {description &&
                            description.split("\n").map(function (item, idx) {
                                return (
                                    <span key={idx}>
                                        {item}
                                        <br />
                                    </span>
                                );
                            })}
                    </Text>
                </Container>
            )}
            {modal0}
            {modal2}
            {modal3}
        </>
    );
}

export default VideoPage;
