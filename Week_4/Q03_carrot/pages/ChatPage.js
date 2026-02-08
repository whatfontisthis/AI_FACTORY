// ChatPage 컴포넌트
// 채팅 목록 페이지

function ChatPage() {
  const { useState, useEffect } = React;
  const { navigate } = useRouter();
  const { userProfile, isAuthenticated } = useAuth();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 채팅방 목록 로드
  useEffect(() => {
    const fetchChats = async () => {
      if (!isAuthenticated || !userProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${window.API_BASE_URL}/api/chat/rooms/user/${userProfile.id}`
        );
        const data = await response.json();

        if (data.success) {
          setChats(data.data);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [isAuthenticated, userProfile?.id]);

  // 채팅방으로 이동
  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  // 시간 포맷
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return '어제';
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <h1 className="text-lg font-bold">채팅</h1>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <i className="far fa-comment-dots text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">로그인이 필요합니다</h2>
          <p className="text-gray-500 text-center mb-6">
            채팅 기능을 이용하려면 로그인해주세요.
          </p>
          <Button variant="primary" onClick={() => navigate('/my')}>
            로그인하기
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <h1 className="text-lg font-bold">채팅</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" color="orange" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <h1 className="text-lg font-bold">채팅</h1>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16">
          <i className="far fa-comment-dots text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">채팅 내역이 없어요</h2>
          <p className="text-gray-500 text-center">
            상품에서 채팅하기를 눌러 대화를 시작해보세요!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              className="flex items-center gap-3 p-4 active:bg-gray-50 cursor-pointer"
            >
              <div className="relative">
                <Avatar
                  src={chat.other_user_profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.other_user_nickname || '사용자')}&background=ff6f00&color=fff`}
                  size="lg"
                />
                {chat.unread_count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{chat.unread_count}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{chat.other_user_nickname || '사용자'}</h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(chat.last_message_at || chat.updated_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.last_message || '대화를 시작해보세요'}
                </p>
              </div>
              {chat.product_id && (
                <img
                  src={(() => {
                    const images = Array.isArray(chat.product_images) ? chat.product_images : [];
                    const firstImage = images[0];
                    if (!firstImage) return `https://picsum.photos/seed/product${chat.product_id}/100/100`;
                    return firstImage.startsWith('http') ? firstImage : `${window.API_BASE_URL}${firstImage}`;
                  })()}
                  alt={chat.product_title || 'Product'}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
