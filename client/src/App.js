import logo from "./logo.svg";
import "./App.css";

import {
    AppShell,
    Header,
    MantineProvider,
    ColorSchemeProvider,
    Grid,
    Text,
} from "@mantine/core";
import { NavbarMinimal } from "./components/NavbarMinimal";
import { useLocalStorage } from "@mantine/hooks";

import { ConnectButton, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { useAccount } from "wagmi";
import Main from "./components/Main";
import { Navigate, Route, Routes } from "react-router-dom";
import { IconCircleDotted } from "@tabler/icons";
import { Container } from "postcss";

const { chains, provider } = configureChains(
    [chain.polygonMumbai],
    [publicProvider()]
);

function App() {
    const [colorScheme, setColorScheme] = useLocalStorage({
        key: "mantine-color-scheme",
        defaultValue: "light",
    });

    const toggleColorScheme = (value) => {
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
    };

    const { isConnected } = useAccount();

    return (
        <div className="App">
            <RainbowKitProvider
                chains={chains}
                theme={colorScheme === "dark" ? darkTheme() : lightTheme()}
            >
                <ColorSchemeProvider
                    colorScheme={colorScheme}
                    toggleColorScheme={toggleColorScheme}
                >
                    <MantineProvider
                        theme={{ colorScheme }}
                        withGlobalStyles
                        withNormalizeCSS
                    >
                        <AppShell
                            padding="md"
                            navbar={<NavbarMinimal />}
                            header={
                                <Header height={60} p="xs">
                                    <Grid
                                        justify="space-between"
                                        columns={2}
                                        align="center"
                                        pl={35}
                                        pr={35}
                                        mt={2}
                                    >
                                        <Grid columns={2}>
                                            <Text size={25} weight={700}>
                                                Sosol3
                                            </Text>
                                            <IconCircleDotted size={35} />
                                        </Grid>
                                        <ConnectButton />
                                    </Grid>
                                    {/* Header content */}
                                </Header>
                            }
                            styles={(theme) => ({
                                main: {
                                    backgroundColor:
                                        theme.colorScheme === "dark"
                                            ? theme.colors.dark[8]
                                            : theme.colors.gray[0],
                                },
                            })}
                        >
                            {isConnected ? (
                                <Main />
                            ) : (
                                <Routes>
                                    <Route
                                        path="/"
                                        element={<div>Connect Wallet</div>}
                                    />
                                    <Route
                                        path="/*"
                                        element={<Navigate replace to="/" />}
                                    />
                                </Routes>
                            )}
                            {/* Your application here */}
                        </AppShell>
                    </MantineProvider>
                </ColorSchemeProvider>
            </RainbowKitProvider>
        </div>
    );
}

export default App;
