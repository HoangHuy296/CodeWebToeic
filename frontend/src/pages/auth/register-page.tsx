import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/auth-provider';
import { getApiErrorMessage } from '../../lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">Dang ky</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Tao tai khoan hoc vien moi</h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Register hien tao `student` account theo dung backend phase auth da xay.
      </p>

      <form
        className="mt-8 grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setIsSubmitting(true);
          setError(null);

          try {
            await register(form);
            navigate('/student/dashboard', { replace: true });
          } catch (submitError) {
            setError(getApiErrorMessage(submitError));
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Ho va ten</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={form.fullName}
            onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">So dien thoai</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Mat khau</span>
          <input
            className="h-12 rounded-2xl border border-stroke bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>

        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 rounded-2xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Dang xu ly...' : 'Tao tai khoan'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Da co tai khoan?{' '}
        <Link to="/login" className="font-semibold text-teal-700">
          Dang nhap
        </Link>
      </p>
    </div>
  );
}

