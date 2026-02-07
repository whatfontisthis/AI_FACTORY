import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCart } from '@/hooks/useCart';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { totalItems } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top bar */}
      <div className="bg-coupang-blue">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-white/90">
          <span>Welcome to 셀팡!</span>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="font-medium text-white">{user.displayName}님</span>
                <Link to="/orders" className="hover:underline">주문내역</Link>
                <button onClick={clearAuth} className="hover:underline">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">로그인</Link>
                <Link to="/login" className="hover:underline">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-4">
        <Link to="/" className="shrink-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-coupang-blue">cellpang</h1>
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="스마트폰, 노트북, 이어폰 등을 검색해보세요!"
            className="flex-1 rounded-l-lg border-2 border-r-0 border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-coupang-blue"
          />
          <button
            type="submit"
            className="rounded-r-lg bg-coupang-blue px-7 py-3 text-white transition-colors hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-5">
          <Link
            to="/cart"
            className="relative flex flex-col items-center gap-0.5 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-coupang-blue"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="text-[10px] font-medium">장바구니</span>
            {totalItems > 0 && (
              <span className="absolute -right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-coupang-red text-[10px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
