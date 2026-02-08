// app.js - 앱 진입점
// 라우터 및 전역 상태 관리

const { useState, useEffect, useCallback, createContext, useContext } = React;

// ==================== 라우터 컨텍스트 ====================
const RouterContext = createContext();

function useRouter() {
  return useContext(RouterContext);
}

function useParams() {
  const { params } = useContext(RouterContext);
  return params;
}

// 전역으로 접근 가능하도록 설정
window.useRouter = useRouter;
window.useParams = useParams;

// ==================== 라우터 컴포넌트 ====================
function Router({ children }) {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');
  const [params, setParams] = useState({});

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || '/';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path) => {
    if (typeof path === 'number') {
      window.history.go(path);
    } else {
      window.location.hash = path;
    }
  }, []);

  const value = { currentPath, navigate, params, setParams };

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
}

// ==================== Route 매칭 함수 ====================
function matchRoute(pattern, path) {
  // /product/:id 같은 동적 라우트 지원
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function Routes({ children }) {
  const { currentPath, setParams } = useRouter();

  let matchedRoute = null;
  let matchedParams = {};

  React.Children.forEach(children, (child) => {
    if (!matchedRoute && child.props.path) {
      const params = matchRoute(child.props.path, currentPath);
      if (params !== null) {
        matchedRoute = child;
        matchedParams = params;
      }
    }
  });

  useEffect(() => {
    setParams(matchedParams);
  }, [currentPath]);

  return matchedRoute || <NotFoundPage />;
}

function Route({ path, element }) {
  return element;
}

// ==================== 404 페이지 ====================
function NotFoundPage() {
  const { navigate } = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <i className="fas fa-exclamation-triangle text-6xl text-orange-500 mb-6"></i>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-600 mb-8 text-center">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Button variant="primary" onClick={() => navigate('/')}>
        홈으로 돌아가기
      </Button>
    </div>
  );
}

// ==================== 라우트 정의 ====================
const routes = [
  { path: '/', element: <FeedPage /> },
  { path: '/search', element: <SearchResultPage /> },
  { path: '/product/:id', element: <ProductDetailPage /> },
  { path: '/create', element: <CreateProductPage /> },
  { path: '/favorites', element: <FavoritesPage /> },
  { path: '/chat', element: <ChatPage /> },
  { path: '/chat/:id', element: <ChatRoomPage /> },
  { path: '/my', element: <MyPage /> },
  { path: '/notifications', element: <NotificationsPage /> },
];

// ==================== App 컴포넌트 ====================
function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path) => {
    window.location.hash = path;
  };

  // 하단 네비게이션을 보여야 하는 페이지인지 확인
  const showBottomNav = ['/', '/favorites', '/chat', '/my'].some(path =>
    currentPath === path
  );

  // 채팅방 페이지에서는 하단 네비게이션 숨김
  const isChatRoom = currentPath.startsWith('/chat/');
  const shouldShowBottomNav = showBottomNav && !isChatRoom;

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* 메인 콘텐츠 */}
        <main>
          <Routes>
            {routes.map((route, i) => (
              <Route key={i} path={route.path} element={route.element} />
            ))}
          </Routes>
        </main>

        {/* 하단 네비게이션 */}
        {shouldShowBottomNav && (
          <BottomNav currentPath={currentPath} onNavigate={handleNavigate} />
        )}
      </div>
    </Router>
  );
}

// ==================== 렌더링 ====================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
