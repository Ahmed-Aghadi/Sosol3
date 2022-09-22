import React, { useEffect, useReducer, useState } from "react";
import { useRef } from "react";
import {
    Text,
    Group,
    Button,
    createStyles,
    Title,
    TextInput,
    Tooltip,
    Progress,
    Skeleton,
    Container,
    Image,
    Badge,
    Center,
    NumberInput,
    NumberInputHandlers,
    ActionIcon,
    Switch,
    Slider,
    Modal,
    Textarea,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconCloudUpload, IconX, IconDownload, IconCheck } from "@tabler/icons";
import {
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useSignMessage,
} from "wagmi";
import axios from "axios";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { useMoralis } from "react-moralis";
import ReactPlayer from "react-player";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useInterval } from "@mantine/hooks";
import {
    sosolNFTMarketplaceAbi,
    sosolNFTMarketplaceContractAddress,
    sosolVideosAbi,
    sosolVideosContractAddress,
} from "../constants";
import { generateVideoThumbnails } from "@rajesh896/video-thumbnails-generator";
import { Carousel } from "@mantine/carousel";
import { Navigate, useNavigate } from "react-router-dom";

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

function Upload() {
    const {
        Moralis,
        authenticate,
        isAuthenticated,
        isAuthenticating,
        user,
        account,
        logout,
    } = useMoralis();
    const navigate = useNavigate();

    const [modalText, setModalText] = useState("");
    const [isDashboardButtonEnabled, setIsDashboardButtonEnabled] =
        useState(false);
    const [isModalProgressCompleted, setIsModalProgressCompleted] =
        useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isNFTUploadChecked, setIsNFTUploadChecked] = useState(false);
    const [urlForPlayer, setUrlForPlayer] = useState("");
    const handlers1 = useRef();
    const handlers2 = useRef();
    const handlers3 = useRef();
    const [opened, setOpened] = useState(false);
    const scrollToBottomRef = useRef();
    const titleRef = useRef();
    const descriptionRef = useRef();
    const [description, setDescription] = useState("");
    const [finalCid, setFinalCid] = useState("");
    const valid =
        titleRef &&
        titleRef.current &&
        titleRef.current.value.trim().length > 0;
    const { data: signer, isError, isLoading } = useSigner();
    const { classes, theme } = useStyles();
    const [video, setVideo] = useState();
    const [thumbnails, setThumbnails] = useState([]);
    const [hasStartedFetchinThumbnail, setHasStartedFetchinThumbnail] =
        useState(false);
    const [videoUrl, setVideoUrl] = useState();
    const openRef = useRef();
    const [progress, setProgress] = useState(0);
    const [isUpdateDisabled, setIsUpdateDisabled] = useState(false);
    const [thumbnailSelected, setThumbnailSelected] = useState(-1);
    const thumbnailSize = 300;
    const videoPlayerSize = 450;

    const handleMultipleUpdate = async () => {
        console.log("multiple updates");
        showNotification({
            title: "Already uploaded!",
            autoClose: 2000,
            icon: <IconX size={18} />,
            color: "red",
        });
    };

    const handleVideoFileDrop = async (file) => {
        console.log(file);
        setVideo(file);
        setUrlForPlayer(URL.createObjectURL(file[0]));
        login();
        console.log("going");
        setHasStartedFetchinThumbnail(true);
        scrollToBottomRef.current.scrollIntoView({
            behavior: "smooth",
        });
        await generateVideoThumbnails(file[0], 3)
            .then(async (thumbnailArray) => {
                try {
                    console.log(thumbnailArray);
                    setThumbnails([
                        thumbnailArray[0],
                        thumbnailArray[1],
                        thumbnailArray[2],
                    ]);
                    scrollToBottomRef.current.scrollIntoView({
                        behavior: "smooth",
                    });
                } catch (e) {
                    console.log(e);
                }
            })
            .catch((err) => {
                console.error(err);
            });
        scrollToBottomRef.current.scrollIntoView({ behavior: "smooth" });
    };

    const uploadVideo = async () => {
        console.log("uploading");
        if (!valid) {
            setIsUpdateDisabled(false);
            showNotification({
                title: "Empty Title!",
                message: "Title shouldn't be empty.",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }
        if (!video) {
            setIsUpdateDisabled(false);
            showNotification({
                title: "Video not found!",
                message: "Select a video file.",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }
        if (thumbnailSelected == -1) {
            setIsUpdateDisabled(false);
            showNotification({
                title: "No thumbnail found!",
                message: "Select a thumbnail out of 3.",
                autoClose: 2000,
                icon: <IconX size={18} />,
                color: "red",
            });
            console.log("invalid");
            return;
        }

        setIsModalOpen(true);
        setModalText("Uploading To IPFS");

        const videoFile = new Moralis.File("video.mp4", video[0]);

        await videoFile.saveIPFS();

        const videoFileIpfs = videoFile.ipfs();

        const videoFileHash = videoFile.hash();
        // console.log(file.ipfs(), file.hash());
        console.log("video file ipfs: ", videoFileIpfs);
        setVideoUrl(videoFileIpfs);
        const videoCidInArray = videoFileIpfs.split("/");
        const videoCid = videoCidInArray[videoCidInArray.length - 1];

        let thumbnailIndex1 = 0;
        let thumbnailIndex2 = 1;
        if (thumbnailSelected == 0) {
            thumbnailIndex1 = 1;
            thumbnailIndex2 = 2;
        } else if (thumbnailSelected == 1) {
            thumbnailIndex1 = 0;
            thumbnailIndex2 = 2;
        }

        // *****************************************
        const thumbnailFile = new Moralis.File("thumbnail.jpg", {
            base64: thumbnails[thumbnailSelected],
        });
        await thumbnailFile.saveIPFS();

        const thumbnailFileIpfs = thumbnailFile.ipfs();

        const thumbnailFileHash = thumbnailFile.hash();
        // console.log(file.ipfs(), file.hash());
        console.log("thumbnail file ipfs: ", thumbnailFileHash);
        const thumbnailCidInArray = thumbnailFileHash.split("/");
        const thumbnailCid =
            thumbnailCidInArray[thumbnailCidInArray.length - 1];

        // *****************************************
        const thumbnailFile1 = new Moralis.File("thumbnail.jpg", {
            base64: thumbnails[thumbnailIndex1],
        });
        await thumbnailFile1.saveIPFS();

        const thumbnailFileIpfs1 = thumbnailFile1.ipfs();

        const thumbnailFileHash1 = thumbnailFile1.hash();
        // console.log(file.ipfs(), file.hash());
        console.log("thumbnail file ipfs: ", thumbnailFileHash1);
        const thumbnailCidInArray1 = thumbnailFileHash1.split("/");
        const thumbnailCid1 =
            thumbnailCidInArray1[thumbnailCidInArray1.length - 1];

        // *****************************************
        const thumbnailFile2 = new Moralis.File("thumbnail.jpg", {
            base64: thumbnails[thumbnailIndex2],
        });
        await thumbnailFile2.saveIPFS();

        const thumbnailFileIpfs2 = thumbnailFile2.ipfs();

        const thumbnailFileHash2 = thumbnailFile2.hash();
        // console.log(file.ipfs(), file.hash());
        console.log("thumbnail file ipfs: ", thumbnailFileHash2);
        const thumbnailCidInArray2 = thumbnailFileHash2.split("/");
        const thumbnailCid2 =
            thumbnailCidInArray2[thumbnailCidInArray2.length - 1];

        const finalJson = {
            title: titleRef.current.value,
            description: descriptionRef.current.value,
            thumbnailCid: thumbnailCid,
            thumbnailCid1: thumbnailCid1,
            thumbnailCid2: thumbnailCid2,
            videoCid: videoCid,
        };
        console.log(finalJson);
        const finalJsonFile = new Moralis.File("video.json", {
            base64: btoa(JSON.stringify(finalJson)),
        });

        await finalJsonFile.saveIPFS();

        const finalJsonFileIpfs = finalJsonFile.ipfs();

        const finalJsonFileHash = finalJsonFile.hash();
        console.log("final json file ipfs: ", finalJsonFileIpfs);

        const finalJsonCidInArray = finalJsonFileIpfs.split("/");
        const finalJsonCid =
            finalJsonCidInArray[finalJsonCidInArray.length - 1];

        setModalText(
            "Please wait for transaction to process for video contract"
        );

        showNotification({
            color: "teal",
            title: "Uploaded to IPFS",
            message: "Successfully uploaded to IPFS!",
            icon: <IconCheck size={16} />,
            autoClose: 2000,
        });

        // **********************************
        const contractInstance = new ethers.Contract(
            sosolVideosContractAddress,
            sosolVideosAbi,
            signer
        );
        console.log("args for contract upload");
        console.table(titleRef.current.value, thumbnailCid, finalJsonCid);
        const tx = await contractInstance.upload(
            titleRef.current.value,
            thumbnailCid,
            finalJsonCid
        );
        console.log("tx done");

        console.log("tx hash");
        console.log(tx.hash);
        console.log("-----------------------------");

        const response = await tx.wait();
        console.log("DONE!!!!!!!!!!!!!!!!!!");

        console.log("response");
        console.log(response);

        console.log("response hash");
        console.log(response.hash);
        console.log("-----------------------------");

        showNotification({
            color: "teal",
            title: "Transaction completed!",
            message: "Transaction for video contract completed!",
            icon: <IconCheck size={16} />,
            autoClose: 2000,
        });
        setIsModalProgressCompleted(true);
        setIsDashboardButtonEnabled(true);
    };

    const login = async () => {
        if (!isAuthenticated) {
            await authenticate({ signingMessage: "Log in using Moralis" })
                .then(function (user) {
                    console.log("logged in user:", user);
                    console.log(user.get("ethAddress"));
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };

    const logOut = async () => {
        await logout();
        console.log("logged out");
    };
    return (
        <>
            <Tooltip
                label={valid ? "All good!" : "Title shouldn't be epmty"}
                position="bottom-start"
                withArrow
                opened={opened}
                color={valid ? "teal" : undefined}
            >
                <TextInput
                    label="Title"
                    required
                    placeholder="Your title"
                    onFocus={() => setOpened(true)}
                    onBlur={() => setOpened(false)}
                    mt="md"
                    ref={titleRef}
                />
            </Tooltip>
            <Textarea
                label="Description"
                placeholder="Your description"
                mt="md"
                autosize
                minRows={2}
                maxRows={4}
                ref={descriptionRef}
            />

            <div className={classes.wrapper}>
                <Dropzone
                    openRef={openRef}
                    onDrop={(file) => {
                        handleVideoFileDrop(file);
                    }}
                    className={classes.dropzone}
                    radius="md"
                    accept={[MIME_TYPES.mp4]}
                >
                    <div style={{ pointerEvents: "none" }}>
                        <Group position="center">
                            <Dropzone.Accept>
                                <IconDownload
                                    size={50}
                                    color={theme.colors[theme.primaryColor][6]}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    size={50}
                                    color={theme.colors.red[6]}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconCloudUpload
                                    size={50}
                                    color={
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[0]
                                            : theme.black
                                    }
                                    stroke={1.5}
                                />
                            </Dropzone.Idle>
                        </Group>

                        <Text align="center" weight={700} size="lg" mt="xl">
                            <Dropzone.Accept>Drop files here</Dropzone.Accept>
                            <Dropzone.Reject>Video</Dropzone.Reject>
                            <Dropzone.Idle>Upload video</Dropzone.Idle>
                        </Text>
                        <Text align="center" size="sm" mt="xs" color="dimmed">
                            Drag&apos;n&apos;drop video here to upload.
                        </Text>
                    </div>
                </Dropzone>

                <Button
                    className={classes.control}
                    size="md"
                    radius="xl"
                    onClick={() => openRef.current?.()}
                >
                    Select files
                </Button>
            </div>
            {hasStartedFetchinThumbnail && (
                <Container px={0}>
                    {thumbnails.length == 0 ? (
                        <Carousel
                            align="center"
                            slideSize="70%"
                            height={thumbnailSize}
                            slideGap="md"
                            loop
                        >
                            <Carousel.Slide>
                                <Container size={thumbnailSize} px={0}>
                                    <Skeleton
                                        height={thumbnailSize}
                                        radius="xl"
                                    />
                                    <Badge>Thumnail 1</Badge>
                                </Container>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Container size={thumbnailSize} px={0}>
                                    <Skeleton
                                        height={thumbnailSize}
                                        radius="xl"
                                    />
                                    <Badge>Thumnail 2</Badge>
                                </Container>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Container size={thumbnailSize} px={0}>
                                    <Skeleton
                                        height={thumbnailSize}
                                        radius="xl"
                                    />
                                    <Badge>Thumnail 3</Badge>
                                </Container>
                            </Carousel.Slide>
                        </Carousel>
                    ) : (
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
                                <Image
                                    className={classes.card}
                                    src={thumbnails[0]}
                                    onClick={() => {
                                        setThumbnailSelected(0);
                                    }}
                                />
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Image
                                    className={classes.card}
                                    src={thumbnails[1]}
                                    onClick={() => {
                                        setThumbnailSelected(1);
                                    }}
                                />
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Image
                                    className={classes.card}
                                    src={thumbnails[2]}
                                    onClick={() => {
                                        setThumbnailSelected(2);
                                    }}
                                />
                            </Carousel.Slide>
                        </Carousel>
                    )}

                    {thumbnailSelected != -1 ? (
                        <Badge sx={{ margin: 20 }}>
                            Thumnail {thumbnailSelected + 1} selected
                        </Badge>
                    ) : (
                        <Badge sx={{ margin: 20 }}>
                            Select a thumnail out of 3
                        </Badge>
                    )}
                </Container>
            )}

            {video && video[0] && (
                <Center>
                    <video
                        height={videoPlayerSize}
                        src={urlForPlayer}
                        controls={true}
                    ></video>
                </Center>
            )}
            <Button
                ref={scrollToBottomRef}
                variant="gradient"
                gradient={{ from: "orange", to: "red" }}
                className={classes.button}
                onClick={() => {
                    setIsUpdateDisabled(true);
                    uploadVideo();
                }}
            >
                Upload
            </Button>
            <Modal
                withCloseButton={false}
                opened={isModalOpen}
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
                    <Text weight={700}>{modalText}</Text>
                </Center>
                {isModalProgressCompleted ? (
                    <Progress radius="xl" size="xl" value={100} />
                ) : (
                    <Progress
                        radius="xl"
                        size="xl"
                        value={100}
                        striped
                        animate
                    />
                )}
                {isDashboardButtonEnabled && (
                    <Center>
                        <Button
                            mt={24}
                            variant="gradient"
                            gradient={{
                                from: "#ed6ea0",
                                to: "#ec8c69",
                                deg: 35,
                            }}
                            onClick={() => {
                                navigate("/dashboard");
                            }}
                        >
                            Go To Dashboard
                        </Button>
                    </Center>
                )}
            </Modal>
        </>
    );
}

export default Upload;
