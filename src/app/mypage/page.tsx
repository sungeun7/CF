import MyPageClient from "./MyPageClient";

export default function MyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">마이페이지</h1>
      <MyPageClient />
    </div>
  );
}
