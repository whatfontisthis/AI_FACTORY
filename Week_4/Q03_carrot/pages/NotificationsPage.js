// NotificationsPage 컴포넌트
// 알림 목록 페이지

function NotificationsPage() {
  const { useState, useEffect } = React;
  const { navigate } = useRouter();
  const { userProfile, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 알림 아이콘 매핑
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'favorite':
        return { icon: 'fas fa-heart', color: 'text-red-500', bg: 'bg-red-100' };
      case 'chat':
        return { icon: 'fas fa-comment-dots', color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'transaction':
        return { icon: 'fas fa-shopping-bag', color: 'text-green-500', bg: 'bg-green-100' };
      default:
        return { icon: 'fas fa-bell', color: 'text-orange-500', bg: 'bg-orange-100' };
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 알림 로드
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !userProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${window.API_BASE_URL}/api/notifications/${userProfile.id}`
        );
        const data = await response.json();

        if (data.success) {
          setNotifications(data.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, userProfile?.id]);

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification) => {
    // 읽음 처리
    if (!notification.is_read) {
      try {
        await fetch(
          `${window.API_BASE_URL}/api/notifications/${notification.id}/read`,
          { method: 'PATCH' }
        );
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // 관련 페이지로 이동
    if (notification.reference_type === 'product' && notification.reference_id) {
      navigate(`/product/${notification.reference_id}`);
    } else if (notification.reference_type === 'chat_room' && notification.reference_id) {
      navigate(`/chat/${notification.reference_id}`);
    }
  };

  // 모두 읽음 처리
  const handleMarkAllRead = async () => {
    if (!userProfile?.id) return;

    try {
      await fetch(
        `${window.API_BASE_URL}/api/notifications/read-all/${userProfile.id}`,
        { method: 'PATCH' }
      );
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <i className="far fa-bell text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-xl font-bold text-gray-700 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-500 text-center mb-6">알림을 확인하려면 로그인해주세요.</p>
        <Button variant="primary" onClick={() => navigate('/my')}>로그인하기</Button>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="lg" color="orange" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i className="fas fa-chevron-left text-gray-700 text-2xl"></i>
            </button>
            <h1 className="text-lg font-bold text-gray-900">알림</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-orange-500 font-medium"
            >
              모두 읽음
            </button>
          )}
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="bg-white">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <i className="far fa-bell-slash text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-center">알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => {
              const iconStyle = getNotificationIcon(notification.type);

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-4 py-4 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-orange-50' : ''
                  }`}
                >
                  {/* 아이콘 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyle.bg}`}>
                    <i className={`${iconStyle.icon} ${iconStyle.color}`}></i>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </span>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className={`text-sm mt-0.5 line-clamp-2 ${!notification.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>

                  {/* 화살표 */}
                  <i className="fas fa-chevron-right text-gray-300 text-sm flex-shrink-0 mt-3"></i>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
