import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-10 text-center">
      <h1 className="text-xl font-semibold text-stone-100">찾을 수 없습니다</h1>
      <p className="mt-2 text-stone-400">요청이 삭제되었거나 주소가 잘못되었습니다.</p>
      <Link href="/" className="mt-6 inline-block text-orange-400 hover:text-orange-300">
        피드로 돌아가기
      </Link>
    </div>
  );
}
