import {
    IconHome2,
    IconGauge,
    IconVideoPlus,
    IconMessages,
} from "@tabler/icons";

export default [
    { path: "dashboard", props: { icon: IconGauge, label: "Dashboard" } },
    {
        path: "upload",
        props: { icon: IconVideoPlus, label: "Upload" },
    },
    { path: "home", props: { icon: IconHome2, label: "Home" } },
    { path: "messages", props: { icon: IconMessages, label: "Messages" } },
];
