import { useNavigate } from 'react-router-dom';

export default function AuthRequired() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0E0A22] font-sans text-white">
      {/* نفس توهجات الخلفية المستخدمة في باقي الصفحات */}
      <div className="pointer-events-none fixed -right-60 -top-72 h-[820px] w-[820px] rounded-full bg-[#7C3AED] opacity-40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-80 -left-48 h-[860px] w-[860px] rounded-full bg-gradient-to-tr from-[#0E7490] to-[#14B8A6] opacity-25 blur-3xl" />

      <div
        dir="rtl"
        className="relative z-10 flex min-h-screen items-center justify-center px-4"
      >
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          {/* أيقونة القفل — نفس التدرج البنفسجي/الوردي */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] shadow-lg shadow-purple-700/40">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* العنوان بكلمة متدرجة — نفس أسلوب "Good morning, Alex" و"Pending Tasks" */}
          <h1 className="mb-2 text-2xl font-bold tracking-[-0.01em] text-white">
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent">
              تسجيل الدخول
            </span>{' '}
            مطلوب
          </h1>

          <p className="mb-6 text-[13.5px] leading-relaxed text-white/40">
            هذه الصفحة تعرض مهامك ومشاريعك الخاصة، ولا يمكننا عرضها لأنك لم
            تسجّل الدخول بعد. سجّل الدخول إلى حسابك أو أنشئ حسابًا جديدًا
            للمتابعة.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-[1.02]"
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-[13px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}