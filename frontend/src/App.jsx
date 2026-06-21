import React from "react";
import {
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import {
  approveRegisterApplication,
  createArticle,
  deleteArticle,
  getAdminDashboard,
  getArticleComments,
  getArticleDetail,
  getArticles,
  getCategories,
  getCurrentUserProfile,
  getMyArticles,
  getRegisterApplications,
  getStoredSession,
  getTags,
  loginUser,
  logoutUser,
  registerUser,
  rejectRegisterApplication,
  searchArticles,
  setStoredSession,
  submitComment,
  updateArticle
} from "./api";

const navPages = [
  { path: "/", label: "首页", end: true },
  { path: "/search", label: "文章", end: true }
];

const SessionContext = React.createContext(null);

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function formatDate(value) {
  if (!value) {
    return "暂无日期";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date).replace(/\//g, "-");
}

function estimateReadTime(text = "") {
  const plainText = text.replace(/<[^>]+>/g, " ").trim();
  const minutes = Math.max(1, Math.ceil(plainText.length / 320));
  return minutes + " 分钟阅读";
}

function formatViewCount(value) {
  if (typeof value !== "number") {
    return "暂无浏览量";
  }

  return value + " 次浏览";
}

function buildTagList(tags = []) {
  return tags.map((tag) => "#" + tag.name);
}

function getArticleStatusLabel(status) {
  return status === 1 ? "草稿" : "已发布";
}

function getDisplayName(user) {
  return user?.nickname || user?.username || "匿名用户";
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseInlineMarkdown(text = "") {
  let html = escapeHtml(text);
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  return html;
}

function markdownToHtml(markdown = "") {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const codeMatch = line.match(/^```([\w-]+)?\s*$/);
    if (codeMatch) {
      const language = codeMatch[1] || "";
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().match(/^```$/)) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      const languageClass = language ? ` class="language-${escapeHtml(language)}"` : "";
      blocks.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${parseInlineMarkdown(headingMatch[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote><p>${quoteLines.map((item) => parseInlineMarkdown(item)).join("<br />")}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${parseInlineMarkdown(lines[index].trim().replace(/^[-*]\s+/, ""))}</li>`);
        index += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(`<li>${parseInlineMarkdown(lines[index].trim().replace(/^\d+\.\s+/, ""))}</li>`);
        index += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const nextLine = lines[index].trimEnd();
      if (
        !nextLine.trim() ||
        nextLine.match(/^```/) ||
        nextLine.match(/^(#{1,3})\s+/) ||
        nextLine.trim().startsWith(">") ||
        /^[-*]\s+/.test(nextLine.trim()) ||
        /^\d+\.\s+/.test(nextLine.trim())
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      index += 1;
    }
    blocks.push(`<p>${paragraphLines.map((item) => parseInlineMarkdown(item.trim())).join("<br />")}</p>`);
  }

  return blocks.join("\n");
}

function htmlToEditorMarkdown(html = "") {
  if (!html) {
    return "";
  }

  let text = html.replace(/\r\n/g, "\n");

  text = text.replace(/<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/gi, (_, language = "", code = "") => {
    const decoded = code
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return `\n\`\`\`${language}\n${decoded}\n\`\`\`\n`;
  });
  text = text.replace(/<h1>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  text = text.replace(/<h2>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  text = text.replace(/<h3>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  text = text.replace(/<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (_, content = "") => {
    return `\n${content.split(/<br\s*\/?>/i).map((line) => `> ${line.replace(/<[^>]+>/g, "").trim()}`).join("\n")}\n`;
  });
  text = text.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, content = "") => {
    const items = Array.from(content.matchAll(/<li>([\s\S]*?)<\/li>/gi)).map((match) => `- ${match[1].replace(/<[^>]+>/g, "").trim()}`);
    return `\n${items.join("\n")}\n`;
  });
  text = text.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, content = "") => {
    const items = Array.from(content.matchAll(/<li>([\s\S]*?)<\/li>/gi)).map((match, itemIndex) => `${itemIndex + 1}. ${match[1].replace(/<[^>]+>/g, "").trim()}`);
    return `\n${items.join("\n")}\n`;
  });
  text = text.replace(/<p>([\s\S]*?)<\/p>/gi, "\n$1\n");
  text = text.replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*");
  text = text.replace(/<code>([\s\S]*?)<\/code>/gi, "`$1`");
  text = text.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  text = text.replace(/<[^>]+>/g, "");

  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function useSession() {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("SessionContext 未初始化");
  }
  return context;
}

function useAsyncResource(loader, initialValue) {
  const [data, setData] = React.useState(initialValue);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const result = await loader();
        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "加载失败，请稍后重试");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [loader]);

  return { data, loading, error, setData, setError };
}

function AppLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [session, setSession] = React.useState(() => getStoredSession());
  const [sessionReady, setSessionReady] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!session?.token) {
        setSessionReady(true);
        return;
      }

      try {
        const profile = await getCurrentUserProfile();
        if (!active) {
          return;
        }

        const nextSession = {
          ...session,
          username: profile.username,
          nickname: profile.nickname || profile.username,
          role: profile.role
        };
        setStoredSession(nextSession);
        setSession(nextSession);
      } catch {
        if (active) {
          logoutUser();
          setSession(null);
        }
      } finally {
        if (active) {
          setSessionReady(true);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const sessionValue = React.useMemo(
    () => ({
      session,
      sessionReady,
      openAuthDialog: () => setAuthDialogOpen(true),
      handleLoggedIn(nextSession) {
        setSession(nextSession);
        setAuthDialogOpen(false);
      },
      handleLogout() {
        logoutUser();
        setSession(null);
        setMobileMenuOpen(false);
        navigate("/");
      }
    }),
    [navigate, session, sessionReady]
  );

  return (
    <SessionContext.Provider value={sessionValue}>
      <div className="app-shell">
        <Header
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />
        <main className="page-frame">
          <Outlet />
        </main>
        <Footer />
        {authDialogOpen && <AuthDialog onClose={() => setAuthDialogOpen(false)} />}
      </div>
    </SessionContext.Provider>
  );
}

function Header({ mobileMenuOpen, onToggleMobileMenu, onCloseMobileMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, openAuthDialog, handleLogout } = useSession();
  const [keyword, setKeyword] = React.useState("");
  const isFrontPage = location.pathname === "/";

  function handleSearchSubmit(event) {
    event.preventDefault();
    const nextKeyword = keyword.trim();
    navigate(nextKeyword ? "/search?keyword=" + encodeURIComponent(nextKeyword) : "/search");
    onCloseMobileMenu();
  }

  if (isFrontPage && !session) {
    return (
      <>
        <header className="topbar topbar-minimal">
          <div className="topbar-inner topbar-inner-minimal">
            <div className="topbar-actions minimal-actions">
              <button className="minimal-login" onClick={openAuthDialog} type="button">登录</button>
              <button className="minimal-register" onClick={openAuthDialog} type="button">注册</button>
            </div>
          </div>
        </header>
        <div className={"mobile-drawer-backdrop " + (mobileMenuOpen ? "open" : "")} onClick={onToggleMobileMenu} />
      </>
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand-group">
            <button className="icon-button mobile-only" onClick={onToggleMobileMenu} aria-label="打开菜单">=</button>
            <NavLink className="brand" to={session ? "/search" : "/"}>DevBlog</NavLink>
            <nav className="desktop-nav">
              {navPages
                .filter((page) => !(session && page.path === "/"))
                .map((page) => (
                  <NavLink
                    key={page.path}
                    className={({ isActive }) => "nav-link " + (isActive ? "active" : "")}
                    to={page.path}
                    end={page.end}
                  >
                    {page.label}
                  </NavLink>
                ))}
              {session?.role === "ADMIN" && <NavLink className="nav-link" to="/admin/user-approvals">用户审核</NavLink>}
            </nav>
          </div>
          <div className="topbar-actions">
            {session ? (
              <button className="session-button desktop-only" onClick={handleLogout} type="button">退出 {session.nickname || session.username}</button>
            ) : (
              <button className="session-button desktop-only" onClick={openAuthDialog} type="button">登录 / 注册</button>
            )}
            <div className="avatar-ring" title={session?.username || "未登录用户"}>
              <div className="avatar-core">{(session?.nickname || session?.username || "DL").slice(0, 2).toUpperCase()}</div>
            </div>
          </div>
        </div>
      </header>
      <div className={"mobile-drawer-backdrop " + (mobileMenuOpen ? "open" : "")} onClick={onToggleMobileMenu} />
      <aside className={"mobile-drawer " + (mobileMenuOpen ? "open" : "")}> 
        <div className="drawer-header">
          <span>导航菜单</span>
          <button className="icon-button" onClick={onToggleMobileMenu} aria-label="关闭菜单">x</button>
        </div>
        <div className="drawer-links">
          {navPages
            .filter((page) => !(session && page.path === "/"))
            .map((page) => (
              <NavLink
                key={page.path}
                className={({ isActive }) => "drawer-link " + (isActive ? "active" : "")}
                to={page.path}
                end={page.end}
                onClick={onCloseMobileMenu}
              >
                {page.label}
              </NavLink>
            ))}
          {session?.role === "ADMIN" && <NavLink className="drawer-link" to="/admin/user-approvals" onClick={onCloseMobileMenu}>用户审核</NavLink>}
          {session ? (
            <button className="drawer-link" onClick={handleLogout} type="button">退出登录</button>
          ) : (
            <button className="drawer-link" onClick={openAuthDialog} type="button">登录 / 注册</button>
          )}
        </div>
      </aside>
    </>
  );
}

function AuthDialog({ onClose }) {
  const navigate = useNavigate();
  const { handleLoggedIn } = useSession();
  const [mode, setMode] = React.useState("login");
  const [form, setForm] = React.useState({ username: "", password: "", nickname: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (mode === "register") {
        await registerUser({
          username: form.username.trim(),
          password: form.password,
          nickname: form.nickname.trim()
        });
        setSuccessMessage("注册申请已提交，请等待管理员审核通过后再登录。");
        setMode("login");
        return;
      }

      const nextSession = await loginUser({
        username: form.username.trim(),
        password: form.password
      });
      handleLoggedIn(nextSession);
      navigate("/search");
    } catch (err) {
      setError(err.message || "提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog-card" onClick={(event) => event.stopPropagation()}>
        <div className="dialog-header">
          <div>
            <p className="eyebrow">Account</p>
            <h2>{mode === "login" ? "登录账号" : "注册账号"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭弹窗">x</button>
        </div>

        <div className="dialog-tabs">
          <button className={"dialog-tab " + (mode === "login" ? "active" : "")} onClick={() => setMode("login")} type="button">登录</button>
          <button className={"dialog-tab " + (mode === "register" ? "active" : "")} onClick={() => setMode("register")} type="button">注册</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-stack">
            <span>用户名</span>
            <input value={form.username} onChange={(event) => updateField("username", event.target.value)} placeholder="请输入用户名" minLength={3} required />
          </label>
          {mode === "register" && (
            <label className="field-stack">
              <span>昵称</span>
              <input value={form.nickname} onChange={(event) => updateField("nickname", event.target.value)} placeholder="请输入昵称，最多 50 个字符" maxLength={50} />
            </label>
          )}
          <label className="field-stack">
            <span>密码</span>
            <input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} placeholder="请输入密码" minLength={6} required />
          </label>
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button auth-submit" disabled={submitting} type="submit">
            {submitting ? "提交中..." : mode === "login" ? "登录" : "提交注册"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ResourceState({ loading, error, empty, children }) {
  if (loading) {
    return <div className="content-card">正在加载数据...</div>;
  }

  if (error) {
    return <div className="content-card">{error}</div>;
  }

  if (empty) {
    return <div className="content-card">暂时还没有内容。</div>;
  }

  return children;
}

export function HomePage() {
  const { session, sessionReady } = useSession();

  if (sessionReady && session) {
    return <Navigate to="/search" replace />;
  }

  return (
    <section className="front-page">
      <div className="front-page-center">
        <h1 className="front-page-title">个人博客网站</h1>
      </div>
    </section>
  );
}

function ArticleCard({ article }) {
  return (
    <article className="content-card hover-lift">
      <div className="card-meta-row">
        <span className="accent-badge">{article.categoryName || "未分类"}</span>
        <span className="meta-text">{formatDate(article.createTime)} | {formatViewCount(article.viewCount)}</span>
      </div>
      <NavLink className="card-title article-link" to={"/article/" + article.id}>{article.title}</NavLink>
      <p className="card-excerpt">{article.summary || "这篇文章暂时还没有摘要内容。"}</p>
      <div className="divider" />
      <div className="tag-row">
        {buildTagList(article.tags).map((tag) => (
          <span key={tag} className="tag-pill">{tag}</span>
        ))}
      </div>
    </article>
  );
}

function insertComment(currentComments, createdComment) {
  if (!createdComment.parentId) {
    return [createdComment, ...currentComments];
  }

  return currentComments.map((comment) => {
    const matchRoot = comment.id === createdComment.parentId;
    const matchChild = (comment.replies || []).some((reply) => reply.id === createdComment.parentId);
    if (!matchRoot && !matchChild) {
      return comment;
    }

    return {
      ...comment,
      replies: [createdComment, ...(comment.replies || [])]
    };
  });
}

function CommentItem({ comment, onReply }) {
  return (
    <div className="comment-thread-card">
      <div className="inline-comment-item root-comment-item">
        <div className="inline-comment-avatar">{getDisplayName(comment.user).slice(0, 2).toUpperCase()}</div>
        <div className="inline-comment-body">
          <div className="inline-comment-meta">
            <span className="inline-comment-user">{getDisplayName(comment.user)}</span>
            <span>{formatDate(comment.createTime)}</span>
          </div>
          <p>{comment.content}</p>
          <div className="inline-comment-actions">
            <button className="ghost-button compact-button" onClick={() => onReply(comment)} type="button">回复</button>
          </div>
        </div>
      </div>
      {(comment.replies?.length || 0) > 0 && (
        <div className="comment-replies-panel">
          <div className="comment-replies-title">全部回复</div>
          <div className="comment-replies-list">
            {comment.replies.map((reply) => (
              <div className="inline-comment-item child-comment-item" key={reply.id}>
                <div className="inline-comment-avatar">{getDisplayName(reply.user).slice(0, 2).toUpperCase()}</div>
                <div className="inline-comment-body">
                  <div className="inline-comment-meta">
                    <span className="inline-comment-user">{getDisplayName(reply.user)}</span>
                    <span>{formatDate(reply.createTime)}</span>
                  </div>
                  <p>
                    {reply.replyToUser && <span className="reply-to-prefix">@{getDisplayName(reply.replyToUser)} </span>}
                    {reply.content}
                  </p>
                  <div className="inline-comment-actions">
                    <button className="ghost-button compact-button" onClick={() => onReply(reply)} type="button">回复</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ArticlePage() {
  const { articleId } = useParams();
  const { session, sessionReady, openAuthDialog } = useSession();
  const detail = useAsyncResource(React.useCallback(() => getArticleDetail(articleId), [articleId]), null);
  const comments = useAsyncResource(React.useCallback(() => getArticleComments(articleId), [articleId]), []);
  const article = detail.data;
  const [commentContent, setCommentContent] = React.useState("");
  const [submitError, setSubmitError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [replyTarget, setReplyTarget] = React.useState(null);

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!session) {
      openAuthDialog();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const createdComment = await submitComment(articleId, {
        content: commentContent.trim(),
        parentId: replyTarget?.id ?? null
      });
      comments.setData((current) => insertComment(current || [], createdComment));
      setCommentContent("");
      setReplyTarget(null);
    } catch (err) {
      setSubmitError(err.message || "评论提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="article-page-shell">
      <ResourceState loading={detail.loading} error={detail.error} empty={!article}>
        {article && (
          <div className="article-two-pane">
            <aside className="article-center-pane">
              <div className="article-center-inner">
                <p className="article-center-label">文章中心</p>
                <h2 className="article-center-title">{article.title}</h2>
                <p className="article-center-summary">{article.summary || "这篇文章还没有补充摘要内容。"}</p>

                <div className="article-center-nav">
                  <a href="#article-overview">文章概览</a>
                  <a href="#article-content">正文内容</a>
                  <a href="#article-comments">评论区</a>
                </div>

                <div className="article-center-meta">
                  <div className="article-center-meta-item">
                    <span>分类</span>
                    <strong>{article.categoryName || "未分类"}</strong>
                  </div>
                  <div className="article-center-meta-item">
                    <span>标签</span>
                    <strong>{buildTagList(article.tags).join(" ") || "暂无标签"}</strong>
                  </div>
                  <div className="article-center-meta-item">
                    <span>发布时间</span>
                    <strong>{formatDate(article.createTime)}</strong>
                  </div>
                  <div className="article-center-meta-item">
                    <span>阅读信息</span>
                    <strong>{estimateReadTime(article.content)}</strong>
                  </div>
                </div>
              </div>
            </aside>

            <article className="article-content-pane">
              <div className="article-content-inner">
                <header className="article-header" id="article-overview">
                  <h1>{article.title}</h1>
                  <div className="meta-cluster">
                    <span>{formatDate(article.createTime)}</span>
                    <span>{estimateReadTime(article.content)}</span>
                    <span>{formatViewCount(article.viewCount)}</span>
                    <span className="accent-text">{buildTagList(article.tags).join(" ")}</span>
                  </div>
                </header>

                <div className="hero-visual">
                  <div className="hero-visual-overlay">
                    <span>{article.categoryName || "未分类"}</span>
                    <strong>{article.summary || "这篇文章还没有补充摘要内容。"}</strong>
                  </div>
                </div>

                <section className="prose-section" id="article-content">
                  <div dangerouslySetInnerHTML={{ __html: article.content || "<p>暂无正文内容。</p>" }} />
                </section>

                <section className="comments-section embedded-comments" id="article-comments">
                  <div className="comments-heading">
                    <h2>评论区</h2>
                    <span className="meta-text">
                      {!sessionReady
                        ? "正在确认登录状态..."
                        : session
                          ? "欢迎 " + (session.nickname || session.username) + " 参与讨论"
                          : "登录后即可参与评论"}
                    </span>
                  </div>

                  <form className="comment-form-card" onSubmit={handleCommentSubmit}>
                    <h3>{replyTarget ? "回复评论" : "发布评论"}</h3>
                    {replyTarget && (
                      <div className="reply-banner">
                        <span>正在回复 @{getDisplayName(replyTarget.user)}</span>
                        <button className="ghost-button" onClick={() => setReplyTarget(null)} type="button">取消回复</button>
                      </div>
                    )}
                    <textarea
                      placeholder={session ? "写下你的想法..." : "请先登录后再评论"}
                      rows={5}
                      value={commentContent}
                      onChange={(event) => setCommentContent(event.target.value)}
                      disabled={submitting}
                      required
                    />
                    {submitError && <p className="form-error">{submitError}</p>}
                    <div className="comment-form-actions">
                      <div className="format-actions">
                        {!session && <button className="ghost-button" onClick={openAuthDialog} type="button">先去登录</button>}
                      </div>
                      <button className="primary-button" disabled={submitting || !commentContent.trim()} type="submit">
                        {submitting ? "提交中..." : replyTarget ? "发布回复" : "发布评论"}
                      </button>
                    </div>
                  </form>

                  <ResourceState loading={comments.loading} error={comments.error} empty={!comments.data?.length}>
                    <div className="expanded-comments-list">
                      {comments.data.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onReply={(targetComment) => {
                            setReplyTarget(targetComment);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        />
                      ))}
                    </div>
                  </ResourceState>
                </section>
              </div>
            </article>
          </div>
        )}
      </ResourceState>
    </section>
  );
}
export function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, openAuthDialog } = useSession();
  const keyword = React.useMemo(() => new URLSearchParams(location.search).get("keyword")?.trim() || "", [location.search]);
  const tag = React.useMemo(() => new URLSearchParams(location.search).get("tag")?.trim() || "", [location.search]);
  const [activeTab, setActiveTab] = React.useState("all");
  const [myArticlesVersion, setMyArticlesVersion] = React.useState(0);
  const [filterMode, setFilterMode] = React.useState("latest");
  const [searchInput, setSearchInput] = React.useState(keyword);

  React.useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  React.useEffect(() => {
    if (!session && activeTab === "mine") {
      setActiveTab("all");
    }
  }, [activeTab, session]);

  React.useEffect(() => {
    if (tag) {
      setActiveTab("all");
    }
  }, [tag]);

  const allArticles = useAsyncResource(
    React.useCallback(() => {
      if (keyword) {
        return searchArticles(keyword, { page: 1, pageSize: 20 });
      }
      return getArticles({ page: 1, pageSize: 20, tag });
    }, [keyword, tag]),
    { records: [], total: 0 }
  );

  const myArticles = useAsyncResource(
    React.useCallback(() => {
      if (!session) {
        return Promise.resolve({ records: [], total: 0 });
      }
      return getMyArticles({ page: 1, pageSize: 50 });
    }, [session, myArticlesVersion]),
    { records: [], total: 0 }
  );

  const allRecords = React.useMemo(() => {
    if (keyword) {
      return (allArticles.data?.records || []).map((item) => ({
        id: item.articleId,
        title: item.title,
        summary: item.summary,
        categoryName: item.categoryName,
        tags: item.tags || [],
        createTime: item.createTime,
        viewCount: item.viewCount,
        status: 2
      }));
    }
    return allArticles.data?.records || [];
  }, [allArticles.data, keyword]);

  const myRecords = myArticles.data?.records || [];
  const baseRecords = activeTab === "all" ? allRecords : myRecords;

  const filteredRecords = React.useMemo(() => {
    const normalized = searchInput.trim().toLowerCase();
    let next = baseRecords.filter((article) => {
      if (!normalized) {
        return true;
      }
      const haystack = [
        article.title,
        article.summary,
        article.categoryName,
        ...(article.tags || []).map((item) => item.name || item)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });

    next = [...next].sort((left, right) => {
      if (filterMode === "oldest") {
        return new Date(left.createTime).getTime() - new Date(right.createTime).getTime();
      }
      if (filterMode === "popular") {
        return (right.viewCount || 0) - (left.viewCount || 0);
      }
      return new Date(right.createTime).getTime() - new Date(left.createTime).getTime();
    });

    return next;
  }, [baseRecords, filterMode, searchInput]);

  const publishedCount = filteredRecords.filter((article) => article.status !== 1).length;
  const draftCount = filteredRecords.filter((article) => article.status === 1).length;

  function applySearch() {
    const nextKeyword = searchInput.trim();
    const params = new URLSearchParams();
    if (nextKeyword) {
      params.set("keyword", nextKeyword);
    }
    if (!nextKeyword && tag) {
      params.set("tag", tag);
    }
    navigate(params.toString() ? "/search?" + params.toString() : "/search");
  }

  async function handleDeleteArticle(articleId) {
    const confirmed = window.confirm("确定要删除这篇文章吗？删除后无法恢复。");
    if (!confirmed) {
      return;
    }

    try {
      await deleteArticle(articleId);
      setMyArticlesVersion((current) => current + 1);
    } catch (err) {
      window.alert(err.message || "删除文章失败");
    }
  }

  function renderArticleRow(article, options = {}) {
    const isDraft = article.status === 1;
    const actionLabel = isDraft ? "继续编辑" : "编辑";
    const categoryName = article.categoryName || "未分类";
    const lowerCategory = categoryName.toLowerCase();
    const icon = isDraft ? "◻" : lowerCategory.includes("安全") ? "🛡" : lowerCategory.includes("数据库") ? "🗄" : "⌘";

    return (
      <article className={"manage-article-row" + (isDraft ? " is-draft" : "")} key={article.id}>
        <div className="manage-article-main">
          <div className="manage-article-icon">{icon}</div>
          <div className="manage-article-copy">
            <h3>{article.title}</h3>
            <div className="manage-article-meta">
              <span>{isDraft ? "草稿创建于 " + formatDate(article.createTime) : formatDate(article.createTime)}</span>
              {!isDraft && <span>{formatViewCount(article.viewCount)}</span>}
              <span className={"manage-article-tag" + (isDraft ? " muted" : "")}>{categoryName}</span>
            </div>
          </div>
        </div>
        <div className="manage-article-actions">
          {!options.hideView && <button className="manage-icon-button" type="button" onClick={() => navigate("/article/" + article.id)}>◫</button>}
          <button className="manage-row-button" type="button" onClick={() => navigate("/write/" + article.id)}>{actionLabel}</button>
          {options.canDelete && <button className="manage-row-button ghost danger" type="button" onClick={() => handleDeleteArticle(article.id)}>删除</button>}
        </div>
      </article>
    );
  }

  return (
    <section className="article-admin-page">
      <aside className="admin-rail">
        <div className="admin-rail-header">
          <div className="admin-avatar">博</div>
          <div>
            <h2>管理面板</h2>
            <p>管理你的内容</p>
          </div>
        </div>

        <button className="admin-create-button" type="button" onClick={() => navigate("/write")}>+ 新建文章</button>

        <nav className="admin-rail-nav">
          <button className={"admin-rail-link" + (activeTab === "all" ? " active" : "")} type="button" onClick={() => setActiveTab("all")}>全部文章</button>
          <button
            className={"admin-rail-link" + (activeTab === "mine" ? " active" : "")}
            type="button"
            onClick={() => {
              if (!session) {
                openAuthDialog();
                return;
              }
              setActiveTab("mine");
            }}
          >
            我的文章
          </button>
        </nav>
      </aside>

      <div className="article-admin-main">
        <header className="article-admin-topbar">
          <div className="article-admin-brand-row">
            <strong>博客后台</strong>
            <nav className="article-admin-tabs">
              <button type="button">概览</button>
              <button className="active" type="button">文章</button>
              <button type="button">数据统计</button>
            </nav>
          </div>
          <div className="article-admin-tools">
            <div className="admin-search-mini">
              <span>⌕</span>
              <input placeholder="搜索..." type="text" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") applySearch(); }} />
            </div>
            <button className="admin-tool-icon" type="button">◌</button>
            <div className="admin-mini-avatar">{(session?.nickname || session?.username || "A").slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <main className="article-admin-content">
          <div className="manage-articles-header">
            <div>
              <h1>管理文章</h1>
              <p>当前共有 {publishedCount} 篇已发布文章，{draftCount} 篇草稿。</p>
            </div>
            <label className="manage-sort-box">
              <span>⇅</span>
              <select value={filterMode} onChange={(event) => setFilterMode(event.target.value)}>
                <option value="latest">最新优先</option>
                <option value="oldest">最早优先</option>
                <option value="popular">最热优先</option>
              </select>
            </label>
          </div>

          <div className="manage-search-bar">
            <div className="manage-search-input">
              <span>⌕</span>
              <input
                placeholder="按标题、标签或内容搜索文章..."
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") applySearch(); }}
              />
            </div>
            <button className="manage-advanced-button" type="button" onClick={applySearch}>搜索</button>
          </div>

          <div className="manage-article-list">
            <ResourceState loading={activeTab === "all" ? allArticles.loading : myArticles.loading} error={activeTab === "all" ? allArticles.error : myArticles.error} empty={!filteredRecords.length}>
              {filteredRecords.map((article) => renderArticleRow(article, { canDelete: activeTab === "mine", hideView: false }))}
            </ResourceState>
          </div>

          <div className="manage-pagination">
            <button className="manage-page-button ghost" type="button">← 上一页</button>
            <div className="manage-page-numbers">
              <button className="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <span>...</span>
              <button type="button">8</button>
            </div>
            <button className="manage-page-button ghost" type="button">下一页 →</button>
          </div>
        </main>
      </div>
    </section>
  );
}
export function WritePage() {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const isEditMode = Boolean(articleId);
  const { session, sessionReady, openAuthDialog } = useSession();
  const categories = useAsyncResource(React.useCallback(() => getCategories(), []), []);
  const tags = useAsyncResource(React.useCallback(() => getTags(), []), []);
  const articleDetail = useAsyncResource(
    React.useCallback(() => {
      if (!articleId) {
        return Promise.resolve(null);
      }
      return getArticleDetail(articleId);
    }, [articleId]),
    null
  );
  const [form, setForm] = React.useState({
    title: "",
    summary: "",
    content: "",
    categoryName: "",
    tags: "",
    status: "2"
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editorMode, setEditorMode] = React.useState("edit");
  const textareaRef = React.useRef(null);

  const previewHtml = React.useMemo(() => markdownToHtml(form.content), [form.content]);

  React.useEffect(() => {
    if (!articleDetail.data) {
      return;
    }

    setForm({
      title: articleDetail.data.title || "",
      summary: articleDetail.data.summary || "",
      content: htmlToEditorMarkdown(articleDetail.data.content || ""),
      categoryName: articleDetail.data.categoryName || "",
      tags: (articleDetail.data.tags || []).map((tag) => tag.name).join(", "),
      status: articleDetail.data.status ? String(articleDetail.data.status) : "2"
    });
  }, [articleDetail.data]);

  function updateContent(value) {
    setForm((current) => ({ ...current, content: value }));
  }

  function insertAroundSelection(prefix, suffix = "", placeholder = "") {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const startSelection = textarea.selectionStart;
    const endSelection = textarea.selectionEnd;
    const selectedText = form.content.slice(startSelection, endSelection);
    const insertedText = prefix + (selectedText || placeholder) + suffix;
    const nextValue = form.content.slice(0, startSelection) + insertedText + form.content.slice(endSelection);

    updateContent(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = startSelection + prefix.length;
      const selectionEnd = selectionStart + (selectedText || placeholder).length;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  function insertBlock(template) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const startSelection = textarea.selectionStart;
    const endSelection = textarea.selectionEnd;
    const before = form.content.slice(0, startSelection);
    const after = form.content.slice(endSelection);
    const needsLeadingBreak = before && !before.endsWith("\n") ? "\n\n" : "";
    const needsTrailingBreak = after && !after.startsWith("\n") ? "\n\n" : "";
    const nextValue = before + needsLeadingBreak + template + needsTrailingBreak + after;
    const cursorPosition = (before + needsLeadingBreak + template).length;

    updateContent(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  }

  const editorTools = [
    { label: "H1", action: () => insertAroundSelection("# ", "", "一级标题") },
    { label: "H2", action: () => insertAroundSelection("## ", "", "二级标题") },
    { label: "加粗", action: () => insertAroundSelection("**", "**", "强调内容") },
    { label: "斜体", action: () => insertAroundSelection("*", "*", "补充说明") },
    { label: "引用", action: () => insertBlock("> 这里是一段引用内容") },
    { label: "行内代码", action: () => insertAroundSelection("`", "`", "const value = 1") },
    { label: "代码块", action: () => insertBlock("```js\nconsole.log(\"hello world\");\n```") },
    { label: "无序列表", action: () => insertBlock("- 列表项一\n- 列表项二\n- 列表项三") },
    { label: "有序列表", action: () => insertBlock("1. 第一步\n2. 第二步\n3. 第三步") },
    { label: "链接", action: () => insertAroundSelection("[", "](https://example.com)", "链接文字") }
  ];

  if (sessionReady && !session) {
    return (
      <section className="container search-layout">
        <div className="content-card">
          <h2>请先登录</h2>
          <p className="card-excerpt">发布和编辑文章需要登录后才能使用。</p>
          <button className="primary-button" onClick={openAuthDialog} type="button">去登录</button>
        </div>
      </section>
    );
  }

  if (isEditMode && articleDetail.loading) {
    return (
      <section className="container search-layout">
        <div className="content-card">正在加载文章内容...</div>
      </section>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: markdownToHtml(form.content),
        categoryName: form.categoryName.trim(),
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
        status: Number(form.status)
      };

      const savedArticle = isEditMode ? await updateArticle(articleId, payload) : await createArticle(payload);
      navigate("/article/" + savedArticle.id);
    } catch (err) {
      setError(err.message || (isEditMode ? "更新文章失败" : "发布文章失败"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container search-layout">
      <div className="section-heading">
        <h1>{isEditMode ? "编辑文章" : "发布文章"}</h1>
        <p>{isEditMode ? "现在可以像写 Markdown 一样编辑内容，保存时会自动转换为页面可展示的 HTML。" : "正文支持 Markdown 风格输入、代码模板和常用样式快捷插入，不需要手写 HTML。"}</p>
      </div>

      <form className="content-card admin-form" onSubmit={handleSubmit}>
        <label className="field-stack">
          <span>标题</span>
          <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="请输入文章标题" maxLength={200} required />
        </label>
        <label className="field-stack">
          <span>摘要</span>
          <textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="请输入文章摘要" rows={3} maxLength={500} />
        </label>
        <div className="field-stack">
          <div className="editor-header-row">
            <span>正文内容</span>
            <div className="editor-mode-tabs">
              <button className={editorMode === "edit" ? "editor-mode-tab active" : "editor-mode-tab"} onClick={() => setEditorMode("edit")} type="button">编辑</button>
              <button className={editorMode === "preview" ? "editor-mode-tab active" : "editor-mode-tab"} onClick={() => setEditorMode("preview")} type="button">预览</button>
            </div>
          </div>
          <div className="markdown-editor-shell">
            <div className="markdown-toolbar" role="toolbar" aria-label="正文快捷工具栏">
              {editorTools.map((tool) => (
                <button key={tool.label} className="markdown-tool-button" onClick={tool.action} type="button">
                  {tool.label}
                </button>
              ))}
            </div>
            <div className="markdown-editor-stage">
              <textarea
                className={editorMode === "preview" ? "markdown-editor hidden" : "markdown-editor"}
                ref={textareaRef}
                value={form.content}
                onChange={(event) => updateContent(event.target.value)}
                placeholder={"# 输入文章标题段落\n\n用 **加粗**、`代码`、```代码块```、引用、列表和链接快速排版。"}
                rows={16}
                required
              />
              <div className={editorMode === "edit" ? "markdown-preview hidden" : "markdown-preview"} dangerouslySetInnerHTML={{ __html: previewHtml || "<p>预览区域会显示这里。</p>" }} />
            </div>
            <p className="editor-helper-text">支持标题、加粗、斜体、引用、列表、行内代码、代码块和链接。点击上方按钮可快速插入模板。</p>
          </div>
        </div>
        <div className="admin-grid">
          <label className="field-stack">
            <span>分类</span>
            <input
              list="category-suggestions"
              value={form.categoryName}
              onChange={(event) => setForm((current) => ({ ...current, categoryName: event.target.value }))}
              placeholder="输入分类名称，不存在时可由后端创建"
              maxLength={50}
              required
            />
            <datalist id="category-suggestions">
              {categories.data.map((category) => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>
          </label>
          <label className="field-stack">
            <span>状态</span>
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="1">草稿</option>
              <option value="2">已发布</option>
            </select>
          </label>
        </div>
        <label className="field-stack">
          <span>标签</span>
          <input
            value={form.tags}
            onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            placeholder={"使用英文逗号分隔，例如：" + (tags.data.slice(0, 3).map((tag) => tag.name).join(", ") || "Java, Spring Boot")}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? (isEditMode ? "保存中..." : "发布中...") : isEditMode ? "保存文章" : "提交文章"}
        </button>
      </form>
    </section>
  );
}
export function AdminUserApprovalsPage() {
  const { session, sessionReady, openAuthDialog } = useSession();
  const [statusFilter, setStatusFilter] = React.useState("");
  const [reloadKey, setReloadKey] = React.useState(0);
  const [activeUserId, setActiveUserId] = React.useState(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState("");

  const approvals = useAsyncResource(React.useCallback(() => getRegisterApplications(statusFilter), [statusFilter, reloadKey]), []);
  const dashboard = useAsyncResource(React.useCallback(() => getAdminDashboard(), [reloadKey]), null);

  React.useEffect(() => {
    if (!approvals.data.length) {
      setActiveUserId(null);
      return;
    }

    setActiveUserId((current) => {
      if (current && approvals.data.some((item) => item.id === current)) {
        return current;
      }
      return approvals.data[0].id;
    });
  }, [approvals.data]);

  const activeUser = approvals.data.find((item) => item.id === activeUserId) || approvals.data[0] || null;

  function getApprovalStatusMeta(status) {
    if (status === 1) {
      return { label: "已通过", tone: "success" };
    }
    if (status === 2) {
      return { label: "已拒绝", tone: "error" };
    }
    return { label: "待审核", tone: "warning" };
  }

  async function refreshApprovals() {
    setReloadKey((current) => current + 1);
  }

  async function handleApprove(applicationId) {
    setActionLoading(true);
    setActionError("");
    try {
      await approveRegisterApplication(applicationId, "审核通过");
      await refreshApprovals();
    } catch (err) {
      setActionError(err.message || "审批通过失败");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(applicationId) {
    const reviewReason = window.prompt("请输入拒绝原因");
    if (reviewReason === null) {
      return;
    }

    setActionLoading(true);
    setActionError("");
    try {
      await rejectRegisterApplication(applicationId, reviewReason);
      await refreshApprovals();
    } catch (err) {
      setActionError(err.message || "拒绝申请失败");
    } finally {
      setActionLoading(false);
    }
  }

  if (!sessionReady) {
    return <section className="container admin-approvals-page"><div className="content-card">正在加载管理员身份...</div></section>;
  }

  if (!session) {
    return (
      <section className="container admin-approvals-page">
        <div className="content-card">
          <h2>请先登录</h2>
          <p className="card-excerpt">注册审核页面需要管理员登录后才能访问。</p>
          <button className="primary-button" onClick={openAuthDialog} type="button">去登录</button>
        </div>
      </section>
    );
  }

  if (session.role !== "ADMIN") {
    return (
      <section className="container admin-approvals-page">
        <div className="content-card">
          <h2>没有访问权限</h2>
          <p className="card-excerpt">当前账号不是管理员，无法访问用户审核页面。</p>
        </div>
      </section>
    );
  }

  const summaryCards = [
    { label: "待审核", value: String(dashboard.data?.pendingRegisterApplicationCount ?? 0), tone: "warning", icon: "PA" },
    { label: "已通过", value: String(approvals.data.filter((item) => item.status === 1).length), tone: "success", icon: "OK" },
    { label: "已拒绝", value: String(approvals.data.filter((item) => item.status === 2).length), tone: "error", icon: "NO" }
  ];

  return (
    <section className="admin-approvals-page">
      <div className="admin-approvals-shell">
        <aside className="admin-side-nav">
          <div className="admin-profile-card">
            <div className="admin-profile-icon">AD</div>
            <div>
              <p className="admin-profile-title">System Admin</p>
              <p className="admin-profile-subtitle">Root Access</p>
            </div>
          </div>
          <div className="admin-side-links">
            <button className="admin-side-link" type="button">Overview</button>
            <button className="admin-side-link active" type="button">Pending Approvals</button>
            <button className="admin-side-link" type="button">Verified Users</button>
            <button className="admin-side-link" type="button">Audit Logs</button>
          </div>
          <button className="primary-button admin-quick-action" type="button">Quick Review</button>
        </aside>

        <div className="admin-main-panel">
          <div className="section-heading">
            <h1>用户审核</h1>
            <p>处理新注册用户的申请，快速查看资料并完成通过或拒绝操作。</p>
          </div>

          <div className="approval-summary-grid">
            {summaryCards.map((item) => (
              <div className="approval-summary-card" key={item.label}>
                <div>
                  <p className="approval-summary-label">{item.label}</p>
                  <p className={"approval-summary-value " + item.tone}>{item.value}</p>
                </div>
                <span className={"approval-summary-icon " + item.tone}>{item.icon}</span>
              </div>
            ))}
          </div>

          <div className="approval-content-grid">
            <div className="approval-table-card">
              <div className="approval-table-toolbar">
                <div className="approval-filter-row">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="">全部状态</option>
                    <option value="0">待审核</option>
                    <option value="1">已通过</option>
                    <option value="2">已拒绝</option>
                  </select>
                </div>
              </div>

              <div className="approval-table-wrap">
                <ResourceState loading={approvals.loading || dashboard.loading} error={approvals.error || dashboard.error} empty={!approvals.data.length}>
                  <table className="approval-table">
                    <thead>
                      <tr>
                        <th>账号</th>
                        <th>昵称</th>
                        <th>申请时间</th>
                        <th>状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.data.map((user) => {
                        const statusMeta = getApprovalStatusMeta(user.status);
                        return (
                          <tr className={user.id === activeUserId ? "active" : ""} key={user.id} onClick={() => setActiveUserId(user.id)}>
                            <td>
                              <div className="approval-user-cell">
                                <div className="approval-user-avatar">{user.username.slice(0, 2).toUpperCase()}</div>
                                <div>
                                  <p className="approval-user-name">{user.username}</p>
                                  <p className="approval-user-nickname">用户 ID #{user.id}</p>
                                </div>
                              </div>
                            </td>
                            <td>{user.nickname || "未填写昵称"}</td>
                            <td className="approval-code">{formatDate(user.createTime)}</td>
                            <td><span className={"approval-status-badge " + statusMeta.tone}>{statusMeta.label}</span></td>
                            <td>
                              <div className="approval-row-actions">
                                <button type="button" onClick={() => setActiveUserId(user.id)}>查看</button>
                                {user.status === 0 && (
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleApprove(user.id);
                                    }}
                                    disabled={actionLoading}
                                  >
                                    通过
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ResourceState>
              </div>

              <div className="approval-pagination"><p>当前共 {approvals.data.length} 条申请记录</p><div /></div>
            </div>

            <aside className="approval-detail-card">
              <div className="approval-detail-header"><h2>申请详情</h2><span>INFO</span></div>
              <div className="approval-detail-body">
                {!activeUser ? (
                  <div className="content-card">请选择一条申请查看详情。</div>
                ) : (
                  <>
                    <div className="approval-detail-profile">
                      <div className="approval-detail-avatar">{activeUser.username.slice(0, 2).toUpperCase()}</div>
                      <h3>{activeUser.username}</h3>
                      <p>{(activeUser.nickname || "未填写昵称") + " · 申请于 " + formatDate(activeUser.createTime)}</p>
                    </div>

                    <div className="approval-detail-section">
                      <p className="approval-detail-label">审核状态</p>
                      <div className="approval-intro-card">{getApprovalStatusMeta(activeUser.status).label}</div>
                    </div>

                    <div className="approval-detail-meta-grid">
                      <div>
                        <p className="approval-detail-label">用户 ID</p>
                        <p className="approval-code">#{activeUser.id}</p>
                      </div>
                      <div>
                        <p className="approval-detail-label">审核时间</p>
                        <p>{activeUser.reviewTime ? formatDate(activeUser.reviewTime) : "尚未审核"}</p>
                      </div>
                    </div>

                    <div className="approval-detail-section">
                      <p className="approval-detail-label">审核备注</p>
                      <div className="approval-intro-card">{activeUser.reviewReason || "暂无审核备注"}</div>
                    </div>

                    {actionError && <p className="form-error">{actionError}</p>}

                    {activeUser.status === 0 && (
                      <div className="approval-detail-actions">
                        <button className="primary-button" type="button" onClick={() => handleApprove(activeUser.id)} disabled={actionLoading}>
                          {actionLoading ? "处理中..." : "通过申请"}
                        </button>
                        <button className="secondary-action-button" type="button" onClick={() => handleReject(activeUser.id)} disabled={actionLoading}>拒绝申请</button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="approval-security-bar"><span className="approval-security-dot" /><span>审批接口已接入后端</span></div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const location = useLocation();
  if (location.pathname === "/") {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">DevBlog</div>
          <p>2026 DevBlog. 面向开发者构建。</p>
        </div>
        <div className="footer-links">
          <NavLink to="/search">文章</NavLink>
          {!getStoredSession()?.token && <NavLink to="/">首页</NavLink>}
        </div>
      </div>
    </footer>
  );
}

export function NotFoundPage() {
  return <Navigate to="/" replace />;
}

export default AppLayout;
