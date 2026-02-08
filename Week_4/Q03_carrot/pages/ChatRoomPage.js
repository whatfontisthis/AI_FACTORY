// ChatRoomPage 컴포넌트
// 1:1 채팅 화면 (판매자 ↔ 구매자)

function ChatRoomPage() {
  const { useState, useEffect, useRef } = React;
  const { navigate } = useRouter();
  const { id } = useParams(); // 채팅방 ID
  const { userProfile, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [tempIncrease, setTempIncrease] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const channelRef = useRef(null);

  // 채팅방 정보 및 메시지 로드
  useEffect(() => {
    const fetchChatData = async () => {
      if (!isAuthenticated || !userProfile?.id || !id) {
        setLoading(false);
        return;
      }

      try {
        // 채팅방 정보 가져오기
        const roomResponse = await fetch(`${window.API_BASE_URL}/api/chat/rooms/${id}`);
        const roomData = await roomResponse.json();

        if (roomData.success) {
          const room = roomData.data;
          // 상대방 정보 설정
          const isUser1 = room.user1_id === userProfile.id;
          const otherUser = isUser1 ? room.user2 : room.user1;
          const otherUserId = isUser1 ? room.user2_id : room.user1_id;

          // 상대방 프로필 이미지 URL 처리
          const otherName = otherUser?.nickname || '사용자';
          let otherAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherName)}&background=ff6f00&color=fff`;
          if (otherUser?.profile_image_url) {
            otherAvatar = otherUser.profile_image_url.startsWith('http')
              ? otherUser.profile_image_url
              : `${window.API_BASE_URL}${otherUser.profile_image_url}`;
          }

          setChatInfo({
            id: room.id,
            user: {
              id: otherUserId,
              name: otherUser?.nickname || `사용자 ${otherUserId}`,
              avatar: otherAvatar
            },
            product: room.product_id ? {
              id: room.product_id,
              title: room.product_title || '상품',
              price: room.product_price || 0,
              status: room.product_status || 'available',
              seller_id: room.product_user_id,
              image: (() => {
                const images = Array.isArray(room.product_images) ? room.product_images : [];
                const firstImage = images[0];
                if (!firstImage) return `https://picsum.photos/seed/product${room.product_id}/100/100`;
                return firstImage.startsWith('http') ? firstImage : `${window.API_BASE_URL}${firstImage}`;
              })()
            } : null
          });
        }

        // 메시지 가져오기
        const messagesResponse = await fetch(`${window.API_BASE_URL}/api/chat/rooms/${id}/messages`);
        const messagesData = await messagesResponse.json();

        if (messagesData.success) {
          const formattedMessages = messagesData.data.map(msg => ({
            id: msg.id,
            type: 'text',
            content: msg.content,
            isMine: msg.sender_id === userProfile.id,
            timestamp: new Date(msg.created_at).toLocaleTimeString('ko-KR', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            isRead: msg.is_read
          }));
          setMessages(formattedMessages);
        }

        // 메시지 읽음 처리
        await fetch(`${window.API_BASE_URL}/api/chat/messages/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room_id: parseInt(id), user_id: userProfile.id })
        });

      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id, isAuthenticated, userProfile?.id]);

  // Supabase Realtime 연결
  useEffect(() => {
    if (!isAuthenticated || !userProfile?.id || !id || !window.supabase) return;

    const channelName = `chat-room-${id}`;
    const channel = window.supabase.channel(channelName);
    channelRef.current = channel;

    // 새 메시지 브로드캐스트 수신
    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        const msg = payload;
        // 본인이 보낸 메시지는 이미 로컬에 추가되어 있으므로 무시
        if (msg.sender_id === userProfile.id) return;

        const newMsg = {
          id: msg.id || Date.now(),
          type: 'text',
          content: msg.content,
          isMine: false,
          timestamp: msg.created_at
            ? new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            : new Date().toLocaleTimeString('ko-KR', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }),
          isRead: msg.is_read || false
        };
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Supabase Realtime connected to', channelName);
        }
      });

    return () => {
      channel.unsubscribe();
      console.log('❌ Supabase Realtime disconnected from', channelName);
    };
  }, [id, isAuthenticated, userProfile?.id]);

  // 스크롤 자동 조정 (새 메시지 추가 시)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 키보드 표시 감지 (모바일)
  useEffect(() => {
    const handleResize = () => {
      // viewport height 변화로 키보드 감지
      const currentHeight = window.innerHeight;
      const isSmaller = currentHeight < window.screen.availHeight * 0.75;
      setIsKeyboardVisible(isSmaller);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 키보드 나타날 때 스크롤 조정
  useEffect(() => {
    if (isKeyboardVisible) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isKeyboardVisible]);

  // 메시지 전송
  const handleSend = async () => {
    if (!inputValue.trim() || !userProfile?.id) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    // 로컬에 먼저 추가 (낙관적 업데이트)
    const tempMessage = {
      id: Date.now(),
      type: 'text',
      content: messageContent,
      isMine: true,
      timestamp: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isRead: false
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      // REST API로 메시지 저장 (데이터베이스에 저장)
      const response = await fetch(`${window.API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: parseInt(id),
          sender_id: userProfile.id,
          content: messageContent
        })
      });

      const data = await response.json();

      // Supabase Realtime으로 브로드캐스트 (실시간 전송)
      if (channelRef.current && data.success && data.data) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {
            id: data.data.id,
            sender_id: userProfile.id,
            content: messageContent,
            created_at: data.data.created_at,
            is_read: false
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // 포커스 유지
    inputRef.current?.focus();
  };

  // Enter 키 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 뒤로가기
  const handleBack = () => {
    navigate(-1);
  };

  // 메뉴 열기
  const handleMenu = () => {
    alert('메뉴 기능 (신고, 차단, 나가기 등)');
  };

  // 거래완료 처리 (판매자/구매자 모두 가능)
  const handleTransactionComplete = async () => {
    if (!chatInfo?.product?.id || !userProfile?.id) return;

    // seller_id가 없으면 거래 완료 불가
    if (!chatInfo.product.seller_id) {
      alert('상품 정보를 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    // 판매자인지 구매자인지 확인
    const isSeller = chatInfo.product.seller_id === userProfile.id;
    // 구매자 ID 결정: 판매자가 클릭하면 상대방이 구매자, 구매자가 클릭하면 본인이 구매자
    const buyerId = isSeller ? chatInfo.user.id : userProfile.id;

    const confirmMsg = isSeller
      ? '이 상품의 거래를 완료하시겠습니까?\n구매자에게 거래 완료가 알림됩니다.'
      : '이 상품의 거래를 완료하시겠습니까?\n판매자에게 거래 완료가 알림됩니다.';

    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(
        `${window.API_BASE_URL}/api/products/${chatInfo.product.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'sold',
            buyer_id: buyerId
          })
        }
      );

      // 상대방에게 알림 메시지 전송
      const notifyMsg = isSeller
        ? '판매자가 거래를 완료했습니다. 🎉'
        : '구매자가 거래를 완료했습니다. 🎉';

      // 로컬에 먼저 메시지 추가 (낙관적 업데이트)
      const localNotifyMsg = {
        id: Date.now(),
        type: 'text',
        content: notifyMsg,
        isMine: true,
        timestamp: new Date().toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isRead: false
      };
      setMessages(prev => [...prev, localNotifyMsg]);

      // REST API로 메시지 저장
      const msgResponse = await fetch(`${window.API_BASE_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: parseInt(id),
          sender_id: userProfile.id,
          content: notifyMsg
        })
      });

      const msgData = await msgResponse.json();

      // Supabase Realtime으로 브로드캐스트
      if (channelRef.current && msgData.success && msgData.data) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {
            id: msgData.data.id,
            sender_id: userProfile.id,
            content: notifyMsg,
            created_at: msgData.data.created_at,
            is_read: false
          }
        });
      }

      const data = await response.json();

      if (data.success) {
        setTempIncrease(2);
        setPurchaseComplete(true);
        setShowPurchaseModal(true);

        // Update local chatInfo to reflect sold status
        setChatInfo(prev => ({
          ...prev,
          product: {
            ...prev.product,
            status: 'sold'
          }
        }));
      } else {
        alert(data.message || '거래완료 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('거래완료 처리 중 오류가 발생했습니다.');
    }
  };

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <i className="far fa-comment-dots text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-xl font-bold text-gray-700 mb-2">로그인이 필요합니다</h2>
        <p className="text-gray-500 text-center mb-6">채팅을 이용하려면 로그인해주세요.</p>
        <Button variant="primary" onClick={() => navigate('/my')}>로그인하기</Button>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <Spinner size="lg" color="orange" />
      </div>
    );
  }

  // 채팅방 정보가 없는 경우
  if (!chatInfo) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <i className="fas fa-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-xl font-bold text-gray-700 mb-2">채팅방을 찾을 수 없습니다</h2>
        <Button variant="primary" onClick={() => navigate('/chat')}>채팅 목록으로</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleBack}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fas fa-chevron-left text-gray-700 text-2xl"></i>
          </button>
          <Avatar src={chatInfo.user.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <h2 className="font-medium text-gray-900 truncate">{chatInfo.user.name}</h2>
          </div>
        </div>
        <button
          onClick={handleMenu}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <i className="fas fa-bars text-gray-700"></i>
        </button>
      </div>

      {/* 상품 정보 카드 */}
      {chatInfo.product && (
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="bg-white rounded-lg p-3 flex gap-3 items-center">
          <img
            src={chatInfo.product.image}
            alt={chatInfo.product.title}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-900 truncate font-medium">
                {chatInfo.product.title}
              </p>
              {(chatInfo.product.status === 'sold' || purchaseComplete) && (
                <span className="px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full flex-shrink-0">
                  거래완료
                </span>
              )}
            </div>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {chatInfo.product.price.toLocaleString()}원
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => {
                if (chatInfo.product?.id) {
                  navigate(`/product/${chatInfo.product.id}`);
                }
              }}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              상품보기
            </button>
            {chatInfo.product.status !== 'sold' && !purchaseComplete ? (
              <button
                onClick={handleTransactionComplete}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                거래완료
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
              >
                거래완료
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 메시지 영역 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar"
        style={{
          paddingBottom: isKeyboardVisible ? '20px' : '80px',
          minHeight: 0
        }}
      >
        <div className="space-y-3">
          {messages.map((msg, index) => {
            // 이전 메시지와 같은 발신자인지 확인
            const prevMsg = messages[index - 1];
            const showAvatar = !prevMsg || prevMsg.isMine !== msg.isMine;

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.isMine}
                timestamp={msg.timestamp}
                showAvatar={showAvatar}
                avatarSrc={chatInfo.user.avatar}
                isRead={msg.isRead}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
        <div className="flex items-end gap-2">
          {/* 추가 기능 버튼 */}
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            onClick={() => alert('이미지/파일 첨부 기능')}
          >
            <i className="fas fa-plus text-xl"></i>
          </button>

          {/* 메시지 입력창 */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows="1"
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
              onInput={(e) => {
                // 자동 높이 조정
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          {/* 전송 버튼 */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`
              p-2 rounded-full w-10 h-10 flex items-center justify-center transition-all flex-shrink-0
              ${inputValue.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>

      {/* 거래완료 확인 모달 */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-fire text-3xl text-orange-500"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              거래가 완료되었습니다!
            </h3>
            <p className="text-gray-600 mb-4">
              상대방에게 거래 완료가 알림되었어요.
            </p>
            <div className="bg-orange-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">매너온도가 올라갔어요</p>
              <p className="text-2xl font-bold text-orange-500">
                +{tempIncrease}°C <span className="text-lg">🔥</span>
              </p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
