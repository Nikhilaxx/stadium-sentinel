// src/MainRouter.tsx
import { Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import UserApp from "./User/UserApp";
import PoliceApp from "./Police/PoliceApp";

export default function MainRouter() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/user/*" element={<UserApp />} />
      <Route path="/police/*" element={<PoliceApp />} />
    </Routes>
  );
}
