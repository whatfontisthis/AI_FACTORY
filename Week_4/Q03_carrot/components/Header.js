// Header 컴포넌트
// 상단 헤더 (위치 표시 + 검색 버튼)

function Header() {
  const { useRouter } = window;
  const { navigate } = useRouter();
  const { userProfile } = useAuth();

  // 사용자의 주소가 있으면 사용, 없으면 기본값
  const location = userProfile?.address || '내 근처';

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* 위치 */}
        <button className="flex items-center gap-2 text-gray-900 font-medium active:opacity-70">
          <span className="text-base">{location}</span>
          <i className="fas fa-chevron-down text-xs"></i>
        </button>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-4">
          <button className="text-gray-700 active:opacity-70">
            <i className="far fa-bell text-xl"></i>
          </button>
          <button className="text-gray-700 active:opacity-70">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
