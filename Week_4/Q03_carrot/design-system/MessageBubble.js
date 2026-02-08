// MessageBubble 컴포넌트
// 채팅 메시지 말풍선 (보낸 메시지 / 받은 메시지)

function MessageBubble({
  message,
  isMine = false,
  timestamp,
  showAvatar = true,
  avatarSrc,
  isRead = false
}) {
  const { useState } = React;

  // 메시지 타입별 렌더링
  const renderMessageContent = () => {
    if (message.type === 'image') {
      return (
        <img
          src={message.content}
          alt="Image message"
          className="max-w-full rounded-lg cursor-pointer"
          style={{ maxWidth: '200px' }}
        />
      );
    }

    if (message.type === 'product') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3 max-w-xs">
          <img
            src={message.content.image}
            alt={message.content.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {message.content.title}
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {message.content.price?.toLocaleString()}원
            </p>
          </div>
        </div>
      );
    }

    // 텍스트 메시지
    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.content}
      </p>
    );
  };

  return (
    <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
      {/* 아바타 (받은 메시지만) */}
      {!isMine && showAvatar && (
        <Avatar src={avatarSrc} size="sm" className="flex-shrink-0" />
      )}
      {!isMine && !showAvatar && (
        <div className="w-8" /> // 아바타 공간 유지
      )}

      {/* 메시지 내용 */}
      <div className={`flex items-end gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
        <div
          className={`
            px-3 py-2 rounded-2xl max-w-xs
            ${isMine
              ? 'bg-orange-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
            }
          `}
        >
          {renderMessageContent()}
        </div>

        {/* 시간 & 읽음 표시 */}
        <div className="flex flex-col items-end gap-0.5 pb-0.5">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {timestamp}
          </span>
          {isMine && (
            <span className={`text-xs ${isRead ? 'text-gray-400' : 'text-orange-500'}`}>
              {isRead ? '읽음' : '1'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
