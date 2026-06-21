import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App, {
  AdminUserApprovalsPage,
  ArticlePage,
  HomePage,
  NotFoundPage,
  SearchPage,
  WritePage
} from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="article/:articleId" element={<ArticlePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="write" element={<WritePage />} />
          <Route path="write/:articleId" element={<WritePage />} />
          <Route path="admin/user-approvals" element={<AdminUserApprovalsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
