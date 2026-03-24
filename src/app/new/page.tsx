import NewRequestForm from "./NewRequestForm";

export const dynamic = "force-dynamic";

export default function NewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-50">코디 요청하기</h1>
        <p className="mt-2 text-stone-400">
          체형과 원하는 분위기를 적고, 필요하면 사진을 첨부하세요. 다른 유저가 댓글처럼 코디를
          추천합니다.
        </p>
      </div>
      <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-6">
        <NewRequestForm />
      </div>
    </div>
  );
}
