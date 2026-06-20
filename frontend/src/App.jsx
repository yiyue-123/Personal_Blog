import { useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";

const navPages = [
  { path: "/", label: "首页", end: true },
  { path: "/article", label: "文章" },
  { path: "/search", label: "搜索" },
  { path: "/topics", label: "专题" }
];

const articles = [
  {
    category: "Java",
    date: "2026-06-19",
    readTime: "12 分钟阅读",
    title: "用 Micrometer 掌握 Spring Boot 3 可观测性",
    excerpt:
      "深入理解 Spring Boot 3 的可观测性 API，在链路追踪、指标采集与运行时性能之间找到更稳妥的平衡点。",
    tags: ["#SpringBoot", "#后端", "#分布式追踪"]
  },
  {
    category: "React",
    date: "2026-06-15",
    readTime: "8 分钟阅读",
    title: "2026 年 React Server Components 的演进方向",
    excerpt:
      "从架构组织、缓存策略到内容交付，重新审视 RSC 在现代前端系统中的真正价值。",
    tags: ["#NextJS", "#前端", "#RSC"]
  },
  {
    category: "Kubernetes",
    date: "2026-06-10",
    readTime: "15 分钟阅读",
    title: "使用 KEDA 自动伸缩优化集群资源",
    excerpt:
      "用事件驱动的自动伸缩能力降低云成本，同时保留系统面对真实流量高峰时的弹性空间。",
    tags: ["#DevOps", "#云原生", "#FinOps"]
  },
  {
    category: "Python",
    date: "2026-06-05",
    readTime: "10 分钟阅读",
    title: "FastAPI 与 LiteStar：如何选对框架",
    excerpt:
      "从开发体验、吞吐表现和团队协作角度，对比两套现代 Python Web 框架的适用场景。",
    tags: ["#Python", "#AsyncIO", "#API"]
  }
];

const searchResults = [
  {
    title: "掌握基于 Spring Boot 3.2 的响应式微服务",
    excerpt:
      "围绕 Project Loom、可观测性和高吞吐服务设计，重新理解 Spring Boot 3.2 的工程能力。",
    date: "2026-06-19",
    readTime: "10 分钟阅读",
    labels: ["后端", "JAVA"]
  },
  {
    title: "优化 Spring Boot 中的依赖注入",
    excerpt:
      "通过延迟初始化和函数式 Bean 注册模式，降低启动时间并控制内存占用。",
    date: "2026-05-12",
    readTime: "8 分钟阅读",
    labels: ["性能", "SPRING"]
  },
  {
    title: "保护 REST API：Spring Boot 与 OAuth2 实战",
    excerpt:
      "用更清晰的资源服务器配置和 JWT 校验策略，建立更稳定的服务安全边界。",
    date: "2026-04-28",
    readTime: "15 分钟阅读",
    labels: ["安全", "AUTH"]
  }
];

const topicArticles = [
  {
    type: "指南",
    date: "2026-10-12",
    readTime: "12 分钟阅读",
    title: "用虚拟线程改造遗留 Java 服务",
    excerpt:
      "在不推翻整个平台的前提下，逐步把传统 Java 服务迁移到新一代并发模型上。",
    tags: ["JVM", "并发", "性能"]
  },
  {
    type: "教程",
    date: "2026-09-28",
    readTime: "8 分钟阅读",
    title: "用 JUnit 5 与 Mockito 编写高质量单测",
    excerpt:
      "围绕嵌套测试、动态测试和复杂对象图，组织一套更可维护的测试体系。",
    tags: ["测试", "JUnit"]
  },
  {
    type: "架构",
    date: "2026-09-15",
    readTime: "15 分钟阅读",
    title: "Spring Boot 3.3：用 GraalVM 进行原生编译",
    excerpt:
      "利用 native image 缩短冷启动时间，为云原生部署争取更高的弹性与效率。",
    tags: ["Spring", "GraalVM", "云原生"]
  },
  {
    type: "分析",
    date: "2026-08-30",
    readTime: "10 分钟阅读",
    title: "低延迟 Java 系统中的垃圾回收调优",
    excerpt:
      "拆解 ZGC 与 G1GC 的调优思路，定位低延迟业务里的停顿来源与权衡点。",
    tags: ["JVM", "GC", "性能"]
  }
];

const expandedComments = [
  {
    user: "cloud_native_guru",
    time: "5 小时前",
    text: "自动配置内部机制这段解释得很好，很多团队直到线上出问题才意识到自己对这层完全不熟。"
  },
  {
    user: "code_weaver",
    time: "45 分钟前",
    text: "native build 时动态代理和 reachability metadata 那块，你们最后是怎么收敛配置的？"
  },
  {
    user: "ops_lane",
    time: "32 分钟前",
    text: "如果后面会接 Elasticsearch，同步索引这块建议也补一下失败重试和补偿机制。"
  },
  {
    user: "byte_echo",
    time: "18 分钟前",
    text: "这篇的节奏很好，尤其缓存层和搜索层放在一起讲，读起来很顺。"
  },
  {
    user: "jvm_path",
    time: "刚刚",
    text: "想看你继续写一篇关于 Spring Boot 3 原生镜像启动优化的实战复盘。"
  }
];

function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
    </div>
  );
}

function Header({ mobileMenuOpen, onToggleMobileMenu, onCloseMobileMenu }) {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand-group">
            <button className="icon-button mobile-only" onClick={onToggleMobileMenu} aria-label="切换菜单">
              =
            </button>
            <NavLink className="brand" to="/">
              DevBlog
            </NavLink>
            <nav className="desktop-nav">
              {navPages.map((page) => (
                <NavLink
                  key={page.path}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to={page.path}
                  end={page.end}
                >
                  {page.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="topbar-actions">
            <div className="search-pill desktop-only">
              <input placeholder="输入关键词..." type="text" />
              <span className="search-divider" />
              <NavLink className="search-trigger" to="/search">
                搜索
              </NavLink>
            </div>
            <button className="icon-button desktop-only" aria-label="状态">
              *
            </button>
            <div className="avatar-ring">
              <div className="avatar-core">DL</div>
            </div>
          </div>
        </div>
      </header>
      <div className={`mobile-drawer-backdrop ${mobileMenuOpen ? "open" : ""}`} onClick={onToggleMobileMenu} />
      <aside className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <span>页面导航</span>
          <button className="icon-button" onClick={onToggleMobileMenu} aria-label="关闭菜单">
            x
          </button>
        </div>
        <div className="drawer-links">
          {navPages.map((page) => (
            <NavLink
              key={page.path}
              className={({ isActive }) => `drawer-link ${isActive ? "active" : ""}`}
              to={page.path}
              end={page.end}
              onClick={onCloseMobileMenu}
            >
              {page.label}
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
}

export function HomePage() {
  return (
    <section className="container container-wide">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Latest Notes for Builders</p>
          <h1 className="display-title">开发者博客首页</h1>
          <p className="hero-copy">
            这一版先专注于页面实现，优先还原设计系统中的结构、间距、层次和整体视觉语言。
          </p>
        </div>
        <div className="hero-orb-grid">
          <div className="orb-card">
            <span className="orb-label">运行时</span>
            <strong>Spring Boot 3.3</strong>
          </div>
          <div className="orb-card">
            <span className="orb-label">前端</span>
            <strong>React + Vite</strong>
          </div>
          <div className="orb-card">
            <span className="orb-label">主题风格</span>
            <strong>GitHub Dark + Neon Mint</strong>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <h2>最新文章</h2>
      </div>

      <div className="article-grid">
        {articles.map((article) => (
          <ArticleCard key={article.title} article={article} />
        ))}
      </div>

      <section className="newsletter-card">
        <div>
          <h3>保持同步</h3>
          <p>每周一封聚焦架构、性能优化和开发工作流的技术简报。</p>
        </div>
        <div className="newsletter-form">
          <input type="email" placeholder="email@example.com" />
          <button className="primary-button">订阅</button>
        </div>
      </section>
    </section>
  );
}

function ArticleCard({ article }) {
  return (
    <article className="content-card hover-lift">
      <div className="card-meta-row">
        <span className="accent-badge">{article.category}</span>
        <span className="meta-text">
          {article.date} | {article.readTime}
        </span>
      </div>
      <h3 className="card-title">{article.title}</h3>
      <p className="card-excerpt">{article.excerpt}</p>
      <div className="divider" />
      <div className="tag-row">
        {article.tags.map((tag) => (
          <span key={tag} className="tag-pill">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export function ArticlePage() {
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  return (
    <section className="container article-layout">
      <article className="article-column">
        <header className="article-header">
          <h1>面向规模化系统的现代后端架构</h1>
          <div className="meta-cluster">
            <span>2026-06-21</span>
            <span>15 分钟阅读</span>
            <span className="accent-text">#Java #SpringBoot #架构</span>
          </div>
        </header>

        <div className="hero-visual">
          <div className="hero-visual-overlay">
            <span>数据流</span>
            <strong>模块化单体 + 搜索索引 + 多层缓存</strong>
          </div>
        </div>

        <section className="prose-section">
          <p>
            在现代软件系统中，可扩展后端并不是工具堆叠的结果，而是一种对结构和边界的克制。这个页面延续了设计稿中的长文阅读节奏，
            通过更舒展的正文排版、克制的强调色和代码优先的内容块组织阅读体验。
          </p>
          <blockquote>架构复杂度不应超过业务领域本身的复杂度。</blockquote>
        </section>

        <section className="prose-section">
          <h2>后端架构</h2>
          <p>
            文章详情页采用 720px 的正文宽度约束，并为桌面端保留目录侧栏，这样后续接入真实 Markdown 或 CMS 数据时无需重新调整页面结构。
          </p>
          <div className="info-panel">
            <h3>核心选型</h3>
            <ul>
              <li>Spring Boot 3.2：提供更完善的可观测性与原生支持。</li>
              <li>MyBatis-Plus：以更轻量的方式完成持久层映射。</li>
              <li>Spring Security + JWT：构建无状态认证体系。</li>
            </ul>
          </div>
        </section>

        <section className="prose-section">
          <h2>数据流设计</h2>
          <p>
            代码区域沿用了设计稿里的分层方式：语言栏、操作按钮和正文区域分离，后续切换成真正的语法高亮组件也不会影响布局。
          </p>
          <div className="code-block-shell">
            <div className="code-block-header">
              <span>JAVA</span>
              <button className="ghost-button">复制</button>
            </div>
            <pre className="code-block">
              <code>{`@Service
public class ArticleService {
  private final ArticleMapper articleMapper;
  private final SearchService searchService;

  @Transactional
  public ArticleDTO createArticle(ArticleCreateDTO dto) {
    String cleanHtml = Jsoup.clean(dto.getContent(), Safelist.relaxed());
    Article article = new Article();
    article.setTitle(dto.getTitle());
    article.setContent(cleanHtml);
    articleMapper.insert(article);
    searchService.syncIndex(article.getId());
    return convertToDTO(article);
  }
}`}</code>
            </pre>
          </div>
        </section>

        <nav className="article-pager">
          <NavLink to="/">&lt;- 上一篇：Micrometer 监控实践</NavLink>
          <NavLink to="/topics">下一篇：Redis 深入实践 -&gt;</NavLink>
        </nav>

        <section className="comments-section embedded-comments">
          <div className="comments-heading">
            <h2>评论区</h2>
            <div className="sort-switch">
              <button>最早</button>
              <span>/</span>
              <button className="active">最新</button>
            </div>
          </div>

          <div className="root-comment-shell">
            <div className="root-comment-card">
              <div className="comment-head">
                <div className="comment-avatar">DE</div>
                <div>
                  <div className="comment-user">dev_architect</div>
                  <div className="meta-text">2 小时前</div>
                </div>
              </div>
              <p className="comment-text">
                关于 native image 的这一段特别有共鸣。我们在线上函数计算场景里接入 Spring Boot 3 和 GraalVM 后，
                冷启动时间确实改善得很明显。
              </p>
              <div className="root-comment-footer">
                <span className="root-comment-meta">共 5 条讨论</span>
                <button className="expand-comments-button" onClick={() => setCommentsExpanded((open) => !open)}>
                  {commentsExpanded ? "收起" : "展开"}
                </button>
              </div>
            </div>

            {commentsExpanded && (
              <div className="expanded-comments-list">
                {expandedComments.map((comment, index) => (
                  <div className="inline-comment-item" key={`${comment.user}-${index}`}>
                    <div className="inline-comment-avatar">{comment.user.slice(0, 2).toUpperCase()}</div>
                    <div className="inline-comment-body">
                      <div className="inline-comment-meta">
                        <span className="inline-comment-user">{comment.user}</span>
                        <span>{comment.time}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="comment-form-card">
            <h3>参与讨论</h3>
            <textarea placeholder="写下你对这篇架构文章的看法..." rows={5} />
            <div className="comment-form-actions">
              <div className="format-actions">
                <button className="ghost-button">B</button>
                <button className="ghost-button">I</button>
                <button className="ghost-button">{"</>"}</button>
                <button className="ghost-button">链接</button>
              </div>
              <button className="primary-button">发布评论</button>
            </div>
          </div>
        </section>
      </article>

      <aside className="toc-column">
        <div className="sticky-card">
          <p className="eyebrow">本页目录</p>
          <div className="toc-links">
            <a href="#article">后端架构</a>
            <a href="#article">数据流设计</a>
            <a href="#article">性能优化</a>
            <a href="#article">安全策略</a>
          </div>
        </div>
      </aside>
    </section>
  );
}

export function SearchPage() {
  return (
    <section className="container search-layout">
      <div className="search-header">
        <div className="search-input-wrap">
          <span className="search-icon">搜索</span>
          <input value="Spring Boot" readOnly />
          <span className="search-shortcut">CMD + K</span>
        </div>
        <div className="filter-row">
          {["Java", "Spring Boot", "Redis", "Elasticsearch"].map((filter, index) => (
            <button key={filter} className={`filter-chip ${index === 1 ? "active" : ""}`}>
              {filter}
            </button>
          ))}
        </div>
        <p className="search-count">共找到 12 条与 “Spring Boot” 相关的结果</p>
      </div>

      <div className="search-results">
        {searchResults.map((result) => (
          <article className="content-card hover-lift" key={result.title}>
            <h3 className="card-title search-title">{result.title}</h3>
            <p className="card-excerpt">{result.excerpt}</p>
            <div className="card-footer-meta">
              <span className="meta-text">
                {result.date} | {result.readTime}
              </span>
              <div className="mini-label-row">
                {result.labels.map((label) => (
                  <span key={label} className="mini-label">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TopicsPage() {
  return (
    <section className="container search-layout">
      <div className="section-heading">
        <h1>探索专题</h1>
        <p>按技术栈、主题和工程方向浏览整理好的技术内容。</p>
      </div>

      <div className="topic-chip-row">
        {[
          ["JAVA", 24, true],
          ["Rust", 18, false],
          ["TypeScript", 42, false],
          ["Kubernetes", 12, false],
          ["Architecture", 31, false],
          ["DevOps", 15, false]
        ].map(([name, count, active]) => (
          <button key={name} className={`topic-chip ${active ? "active" : ""}`}>
            <span>{name}</span>
            <span>({count})</span>
          </button>
        ))}
      </div>

      <div className="section-heading compact">
        <h2>#Java 相关文章</h2>
      </div>

      <div className="article-grid">
        {topicArticles.map((article) => (
          <article className="content-card hover-lift" key={article.title}>
            <div className="card-meta-row">
              <span className="eyebrow accent-text">{article.type}</span>
              <span className="meta-text">
                {article.date} | {article.readTime}
              </span>
            </div>
            <h3 className="card-title">{article.title}</h3>
            <p className="card-excerpt">{article.excerpt}</p>
            <div className="divider" />
            <div className="tag-row">
              {article.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">DevBlog</div>
          <p>2026 DevBlog. 面向开发者构建。</p>
        </div>
        <div className="footer-links">
          <NavLink to="/">RSS 订阅</NavLink>
          <NavLink to="/topics">GitHub</NavLink>
          <NavLink to="/article">隐私政策</NavLink>
        </div>
      </div>
    </footer>
  );
}

export function NotFoundPage() {
  return <Navigate to="/" replace />;
}

export default AppLayout;
