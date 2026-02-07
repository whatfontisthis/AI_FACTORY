const banners = [
  {
    id: 1,
    title: '로켓배송 특가',
    subtitle: '오늘 주문하면 내일 도착!',
    bg: 'bg-gradient-to-r from-coupang-blue to-blue-400',
  },
  {
    id: 2,
    title: '로켓와우 회원 전용',
    subtitle: '무료배송 + 로켓프레시 할인',
    bg: 'bg-gradient-to-r from-purple-600 to-pink-500',
  },
  {
    id: 3,
    title: '오늘의 골드박스',
    subtitle: '매일 새로운 초특가 딜!',
    bg: 'bg-gradient-to-r from-coupang-red to-orange-400',
  },
];

export function Banner() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="grid gap-3 md:grid-cols-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`${banner.bg} cursor-pointer rounded-xl p-6 text-white transition-transform hover:scale-[1.02]`}
          >
            <h2 className="text-lg font-bold">{banner.title}</h2>
            <p className="mt-1 text-sm opacity-90">{banner.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
