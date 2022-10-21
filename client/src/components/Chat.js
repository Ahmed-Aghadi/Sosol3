import { Client, ContentTypeId } from "@xmtp/xmtp-js";
import { useEffect, useRef, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import {
    ActionIcon,
    Badge,
    Center,
    Code,
    Container,
    Grid,
    Group,
    Input,
    Navbar,
    Paper,
    ScrollArea,
    Skeleton,
    Stack,
    Text,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import { TextInput, createStyles } from "@mantine/core";
import {
    IconAlertCircle,
    IconBrandTwitter,
    IconBulb,
    IconCheckbox,
    IconPlus,
    IconSearch,
    IconSelector,
    IconSend,
    IconUser,
} from "@tabler/icons";
import { ethers } from "ethers";

const useStyles = createStyles((theme, { floating }) => ({
    root: {
        position: "relative",
    },

    label: {
        position: "absolute",
        zIndex: 2,
        top: 7,
        left: theme.spacing.sm,
        pointerEvents: "none",
        color: floating
            ? theme.colorScheme === "dark"
                ? theme.white
                : theme.black
            : theme.colorScheme === "dark"
            ? theme.colors.dark[3]
            : theme.colors.gray[5],
        transition:
            "transform 150ms ease, color 150ms ease, font-size 150ms ease",
        transform: floating
            ? `translate(-${theme.spacing.sm}px, -28px)`
            : "none",
        fontSize: floating ? theme.fontSizes.xs : theme.fontSizes.sm,
        fontWeight: floating ? 500 : 400,
    },

    required: {
        transition: "opacity 150ms ease",
        opacity: floating ? 1 : 0,
    },

    input: {
        "&::placeholder": {
            transition: "color 150ms ease",
            color: !floating ? "transparent" : undefined,
        },
    },
    navbar: {
        paddingTop: 0,
        marginLeft: "80px",
    },

    section: {
        marginLeft: -theme.spacing.md,
        marginRight: -theme.spacing.md,
        marginBottom: theme.spacing.md,

        "&:not(:last-of-type)": {
            borderBottom: `1px solid ${
                theme.colorScheme === "dark"
                    ? theme.colors.dark[4]
                    : theme.colors.gray[3]
            }`,
        },
    },

    searchCode: {
        fontWeight: 700,
        fontSize: 10,
        backgroundColor:
            theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : theme.colors.gray[0],
        border: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[7]
                : theme.colors.gray[2]
        }`,
    },

    mainLinks: {
        paddingLeft: theme.spacing.md - theme.spacing.xs,
        paddingRight: theme.spacing.md - theme.spacing.xs,
        paddingBottom: theme.spacing.md,
    },

    mainLink: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        fontSize: theme.fontSizes.xs,
        padding: `8px ${theme.spacing.xs}px`,
        borderRadius: theme.radius.xl,
        fontWeight: 500,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
    },

    mainLinkInner: {
        display: "flex",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },

    mainLinkIcon: {
        marginRight: theme.spacing.sm,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[2]
                : theme.colors.gray[6],
    },

    mainLinkBadge: {
        padding: 0,
        width: 20,
        height: 20,
        pointerEvents: "none",
    },

    collections: {
        paddingLeft: theme.spacing.md - 6,
        paddingRight: theme.spacing.md - 6,
        paddingBottom: theme.spacing.md,
    },

    collectionsHeader: {
        paddingLeft: theme.spacing.md + 2,
        paddingRight: theme.spacing.md,
        marginBottom: 5,
    },

    collectionLink: {
        display: "block",
        padding: `8px ${theme.spacing.xs}px`,
        textDecoration: "none",
        borderRadius: theme.radius.sm,
        fontSize: theme.fontSizes.xs,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
        lineHeight: 1,
        fontWeight: 500,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
            color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
    },
}));

const links = [
    { icon: IconBulb, label: "Activity", notifications: 3 },
    { icon: IconCheckbox, label: "Tasks", notifications: 4 },
    { icon: IconUser, label: "Contacts" },
];

const collections = [
    { emoji: "👍", label: "Sales" },
    { emoji: "🚚", label: "Deliveries" },
    { emoji: "💸", label: "Discounts" },
    { emoji: "💰", label: "Profits" },
    { emoji: "✨", label: "Reports" },
    { emoji: "🛒", label: "Orders" },
    { emoji: "📅", label: "Events" },
    { emoji: "🙈", label: "Debts" },
    { emoji: "💁‍♀️", label: "Customers" },
];
export default function Chat() {
    const [focused, setFocused] = useState(false);
    const [value, setValue] = useState("");
    const { classes } = useStyles({
        floating: value.trim().length !== 0 || focused,
    });
    const [chats, setChats] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [xmtp, setXmtp] = useState();
    const {
        data: signer,
        isError,
        isLoading,
        isFetched,
        isRefetching,
        isSuccess,
    } = useSigner();
    const { address } = useAccount();
    const [userAddress, setUserAddress] = useState("");
    const [isMessageLoading, setIsMessageLoading] = useState(true);
    const [isConversationsLoading, setIsConversationsLoading] = useState(true);
    const [isConversationSelected, setIsConversationSelected] = useState(false);
    const bottomScrollRef = useRef();
    const messageInputRef = useRef();
    const [userSigner, setUserSigner] = useState();

    const [isAddressInputEnabled, setIsAddressInputEnabled] = useState(false);
    const [addressInputOpened, setAddressInputOpened] = useState(false);
    const [addressInputValue, setAddressInputValue] = useState("");
    const isAddressInputValid = ethers.utils.isAddress(addressInputValue);
    const [conversationStream, setConversationStream] = useState();

    const addressInput = (
        <Tooltip
            label={isAddressInputValid ? "All good!" : "Invalid wallet address"}
            position="bottom-start"
            withArrow
            opened={addressInputOpened}
            color={isAddressInputValid ? "teal" : undefined}
        >
            <TextInput
                style={{ marginLeft: "80px" }}
                label="Enter wallet address to start chatting."
                required
                placeholder="0x0000000000000000000000000000000000000000"
                onFocus={() => setAddressInputOpened(true)}
                onBlur={() => setAddressInputOpened(false)}
                mt="md"
                value={addressInputValue}
                onChange={(event) =>
                    setAddressInputValue(event.currentTarget.value.trim())
                }
                onKeyDown={(e) => {
                    handleUserAddressKeyDown(e);
                }}
            />
        </Tooltip>
    );

    const messageSkeletons = Array(10).fill(
        <>
            <Skeleton
                style={{ marginLeft: "80px" }}
                height={25}
                width="40%"
                radius="xl"
                mt={15}
            />
            <Skeleton
                style={{ marginLeft: "auto", marginRight: 0 }}
                height={25}
                width="40%"
                radius="xl"
                mt={15}
            />
        </>
    );

    const conversationSkeletons = Array(10).fill(
        <Skeleton height={25} radius="xl" mt={15} />
    );

    const chatsRendered = isAddressInputEnabled
        ? addressInput
        : isConversationSelected && (
              <>
                  <ScrollArea
                      style={{ width: "100%", height: "95%" }}
                      type="never"
                  >
                      {isMessageLoading ? (
                          messageSkeletons
                      ) : (
                          <Stack
                              sx={(theme) => ({
                                  backgroundColor:
                                      theme.colorScheme === "dark"
                                          ? theme.colors.dark[8]
                                          : theme.colors.gray[0],
                                  height: 300,
                              })}
                          >
                              {chats.map((chat) => {
                                  return (
                                      chat &&
                                      chat.contentType.typeId != "fallback" &&
                                      (chat.senderAddress != address ? (
                                          <Text
                                              key={chat.id}
                                              style={{
                                                  textAlign: "left",
                                                  marginLeft: "80px",
                                              }}
                                          >
                                              {chat.content}
                                          </Text>
                                      ) : (
                                          <Text
                                              key={chat.id}
                                              style={{
                                                  textAlign: "right",
                                                  marginLeft: "80px",
                                              }}
                                          >
                                              {chat.content}
                                          </Text>
                                      ))
                                  );
                              })}
                              <div ref={bottomScrollRef} />
                          </Stack>
                      )}
                  </ScrollArea>
                  <Input
                      ref={messageInputRef}
                      placeholder="Enter message"
                      onKeyDown={(e) => {
                          handleMessageKeyDown(e);
                      }}
                      style={{ marginLeft: "80px" }}
                      rightSection={
                          <div>
                              <IconSend
                                  size={18}
                                  style={{ display: "block", opacity: 0.5 }}
                              />
                          </div>
                      }
                  />
              </>
          );
    const conversationsRendered = (
        <>
            <ScrollArea style={{ height: "80vh" }}>
                {isConversationsLoading
                    ? conversationSkeletons
                    : conversations.map(
                          (conversation) =>
                              conversation &&
                              conversation.peerAddress && (
                                  <Paper
                                      mt={15}
                                      size={15}
                                      shadow="xl"
                                      radius="xl"
                                  >
                                      <UnstyledButton
                                          onClick={() => {
                                              createConversation(
                                                  conversation.peerAddress
                                              );
                                          }}
                                          key={conversation.peerAddress}
                                          className={classes.mainLink}
                                      >
                                          <div
                                              className={classes.mainLinkInner}
                                          >
                                              <span
                                                  style={{ fontSize: "medium" }}
                                              >
                                                  {conversation.peerAddress.substring(
                                                      0,
                                                      8
                                                  ) +
                                                      "..." +
                                                      conversation.peerAddress.substring(
                                                          34
                                                      )}
                                              </span>
                                          </div>
                                      </UnstyledButton>
                                  </Paper>
                              )
                      )}
            </ScrollArea>
            <Badge size="lg" radius="xl" color="teal">
                powered by XMTP
            </Badge>
        </>
    );

    const handleUserAddressKeyDown = async (e) => {
        if (e.key === "Enter" && isAddressInputValid) {
            console.log(addressInputValue);
            createConversation(addressInputValue);
            console.log(e);
        }
    };

    const handleMessageKeyDown = async (e) => {
        if (e.key === "Enter") {
            sendMessage(e.target.value);
            console.log(e);
            messageInputRef.current.value = "";
        }
    };

    useEffect(() => {
        // console.table(xmtp, signer, userSigner);
        console.log(signer);
        if (userSigner && userSigner._address !== signer._address) {
            console.log("a");
            setup(true);
            return;
        }
        if (!xmtp && signer) {
            if (userSigner && userSigner._address === signer._address) {
                return;
            }
            console.log("b");
            console.log(signer._address);
            console.log(userSigner);
            setUserSigner(signer);
            setup(false);
            return;
        }
    }, [signer]);

    const listenForMessage = async (conversationWithUser) => {
        conversationStream && conversationStream.return();
        // Listen for new messages in the conversation
        const stream = await conversationWithUser.streamMessages();
        setConversationStream(stream);
        for await (const message of stream) {
            setChats((chats) => [...chats, message]);
            setTimeout(() => {
                bottomScrollRef.current.scrollIntoView({ behavior: "smooth" });
            }, 350);
        }
    };

    const listenForConversations = async (xmtpPassed) => {
        let client = xmtpPassed;
        if (!client) {
            if (!xmtp) {
                client = await Client.create(signer);
                setXmtp(client);
            } else {
                client = xmtp;
            }
        }
        // conversationsStream && conversationsStream.return();
        const stream = await client.conversations.stream();
        // setConversationsStream(stream);
        for await (const newConversation of stream) {
            console.log(
                `New conversation started with ${newConversation.peerAddress}`
            );
            console.log(newConversation);
            setConversations((oldConversations) => {
                for (let i = 0; i < oldConversations.length; i++) {
                    if (
                        oldConversations[i].peerAddress ===
                        newConversation.peerAddress
                    ) {
                        return oldConversations;
                    }
                }
                return (
                    !oldConversations.includes(newConversation) && [
                        newConversation,
                        ...oldConversations,
                    ]
                );
            });
        }
    };

    const clickHandle = async () => {
        createConversation("0x9e03C44b5A09db89bf152F8C5500dF3360c1C5bF");
    };

    const setup = async (reinitializeXmtp = false) => {
        console.log("setup");
        let client;
        if (!xmtp || reinitializeXmtp) {
            client = await Client.create(signer);
            setXmtp(client);
        } else {
            client = xmtp;
        }
        await createConversations(client);
    };
    const createConversations = async (xmtpPassed) => {
        setIsConversationsLoading(true);
        let client = xmtpPassed;
        if (!client) {
            if (!xmtp) {
                client = await Client.create(signer);
                setXmtp(client);
            } else {
                client = xmtp;
            }
        }
        const convList = await client.conversations.list();
        console.log(convList);
        setConversations(convList);
        setIsConversationsLoading(false);
        listenForConversations(client);
    };

    const createConversation = async (addressOfUser2, xmtpPassed) => {
        setIsAddressInputEnabled(false);
        setIsConversationSelected(true);
        console.log("creating conversation");
        if (userAddress == addressOfUser2) {
            setTimeout(() => {
                bottomScrollRef &&
                    bottomScrollRef.current &&
                    bottomScrollRef.current.scrollIntoView({
                        behavior: "smooth",
                    });
            }, 750);
            return;
        }

        bottomScrollRef &&
            bottomScrollRef.current &&
            bottomScrollRef.current.scrollIntoView({ behavior: "smooth" });

        setUserAddress(addressOfUser2);
        setIsMessageLoading(true);
        setChats([]);
        let client = xmtpPassed;
        console.log(xmtpPassed);
        if (!client) {
            console.log("undefined xmtpPassed");
            if (!xmtp) {
                console.log("undefined xmtp state");
                client = await Client.create(signer);
                setXmtp(client);
            } else {
                client = xmtp;
            }
        }
        const conversationWithUser = await client.conversations.newConversation(
            addressOfUser2
        );
        console.log("conversationWithUser", conversationWithUser);
        const messages = await conversationWithUser.messages();
        console.log(messages); // id and content and senderAddress and contentType.typeId == "text"
        setChats(messages);
        setIsMessageLoading(false);
        setTimeout(() => {
            bottomScrollRef &&
                bottomScrollRef.current &&
                bottomScrollRef.current.scrollIntoView({ behavior: "smooth" });
        }, 750);
        listenForMessage(conversationWithUser);
    };

    const renderChats = async (conversationWithUser) => {
        const messages = await conversationWithUser.messages();
        console.log(messages);
        setChats(messages);
    };

    const sendMessage = async (msg, addressOfUser2) => {
        if (!addressOfUser2) {
            addressOfUser2 = userAddress;
        }
        // Start a conversation with addressOfUser2
        const conversation = await xmtp.conversations.newConversation(
            addressOfUser2
        );
        conversation.send(msg);
    };

    return (
        <>
            <Navbar width={{ sm: 300 }} p="md" className={classes.navbar}>
                <Navbar.Section className={classes.section}>
                    <Group
                        className={classes.collectionsHeader}
                        position="apart"
                    >
                        <Text size="xs" weight={500} color="dimmed">
                            Conversations
                        </Text>
                        <Tooltip
                            label="Create conversation"
                            withArrow
                            position="right"
                        >
                            <ActionIcon
                                variant="default"
                                size={18}
                                onClick={() => {
                                    setIsAddressInputEnabled(true);
                                }}
                            >
                                <IconPlus size={12} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Navbar.Section>

                <Navbar.Section className={classes.section}>
                    <div className={classes.mainLinks}>
                        {conversationsRendered}
                    </div>
                </Navbar.Section>
            </Navbar>
            {chatsRendered}
        </>
    );
}
