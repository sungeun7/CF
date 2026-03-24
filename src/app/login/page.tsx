import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-stone-100">로그인</h1>
      <p className="text-sm text-stone-400">
        로그인 후 추천을 남길 때 사진과 링크를 함께 첨부할 수 있습니다.
      </p>
      <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5">
        <LoginForm />
      </div>
    </div>
  );
}
