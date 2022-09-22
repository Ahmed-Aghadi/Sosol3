import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Home from "./Home";
import Upload from "./Upload";
import VideoPage from "./VideoPage";
import Chat from "./Chat";

function Main() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate replace to="/home" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/video/:id" element={<VideoPage />} />
                <Route path="/messages" element={<Chat />} />
            </Routes>
        </>
    );
}

export default Main;
