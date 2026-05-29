import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminUser } from '../../types/admin';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { adminApi } from '../../lib/admin-api';
import { getApiErrorMessage } from '../../lib/api';

function createDraft(user?: AdminUser) {
  return {
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'student',
    phone: user?.phone ?? '',
    avatarUrl: user?.avatarUrl ?? '',
    bio: user?.bio ?? '',
    isActive: user?.isActive ?? true,
  };
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.users,
  });
  const selectedUserQuery = useQuery({
    queryKey: ['admin', 'users', selectedUserId],
    queryFn: () => adminApi.user(selectedUserId!),
    enabled: Boolean(selectedUserId),
  });
  const [draft, setDraft] = useState(createDraft());

  useEffect(() => {
    if (usersQuery.data && !selectedUserId && usersQuery.data.length > 0) {
      setSelectedUserId(usersQuery.data[0].id);
    }
  }, [selectedUserId, usersQuery.data]);

  useEffect(() => {
    if (selectedUserQuery.data) {
      setDraft(createDraft(selectedUserQuery.data));
    }
  }, [selectedUserQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateUser(selectedUserId!, draft),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => adminApi.deactivateUser(selectedUserId!),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'users', selectedUserId] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });

  const users = (usersQuery.data ?? []).filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold tracking-[0.35em] text-teal-700 uppercase">admin users</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Workspace quan tri user theo mo hinh master-detail.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
          Admin co the loc user theo role, mo chi tiet ho so, cap nhat role, so dien thoai, avatar va vo hieu hoa tai khoan
          ngay tren cung mot man hinh.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Danh sach nguoi dung</h2>
              <p className="mt-2 text-sm text-slate-600">Chon mot user o cot trai de mo panel chinh sua.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tim theo ten hoac email"
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
              />
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400"
              >
                <option value="all">Tat ca role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {usersQuery.isPending ? <QueryLoadingState title="Dang tai danh sach user..." /> : null}
          {usersQuery.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong tai duoc users" description={getApiErrorMessage(usersQuery.error)} />
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelectedUserId(user.id)}
                className={[
                  'rounded-[1.5rem] border px-4 py-4 text-left transition',
                  selectedUserId === user.id
                    ? 'border-teal-300 bg-teal-50'
                    : 'border-stroke bg-slate-50 hover:border-slate-300 hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{user.fullName}</p>
                    <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {user.role}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">
                      {user.ownedCourseCount}{' '}
                      {user.role === 'student' ? 'khoa hoc da dang ky' : 'khoa hoc so huu'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>{user.phone || 'Chua co phone'}</span>
                  <span className={user.isActive ? 'text-teal-700' : 'text-rose-600'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </button>
            ))}

            {users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
                Khong co user phu hop voi bo loc hien tai.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Ho so va phan quyen</h2>
              <p className="mt-2 text-sm text-slate-600">Panel nay dang bind truc tiep voi `GET/PATCH /api/admin/users/:id`.</p>
            </div>
          </div>

          {selectedUserQuery.isPending ? <div className="mt-6"><QueryLoadingState title="Dang tai chi tiet user..." /></div> : null}
          {selectedUserQuery.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong tai duoc user" description={getApiErrorMessage(selectedUserQuery.error)} />
            </div>
          ) : null}

          {selectedUserQuery.data ? (
            <form
              className="mt-6 grid gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                updateMutation.mutate();
              }}
            >
              <div className="grid gap-4 rounded-[1.6rem] border border-stroke bg-slate-50/90 p-4 sm:p-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Ho ten
                    <input
                      value={draft.fullName}
                      onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
                      className="w-full rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-400"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Role
                    <select
                      value={draft.role}
                      onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as AdminUser['role'] }))}
                      className="w-full rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-400"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    Email
                    <input
                      value={draft.email}
                      onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                      className="w-full rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-400"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    So dien thoai
                    <input
                      value={draft.phone}
                      onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                      className="w-full rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-400"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Avatar URL
                  <input
                    value={draft.avatarUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, avatarUrl: event.target.value }))}
                    className="w-full rounded-2xl border border-stroke bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-400"
                  />
                </label>

                <div className="grid gap-3 rounded-2xl border border-white/80 bg-white px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tong quan</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {draft.role === 'student' ? 'So khoa hoc da enroll hop le' : 'So khoa hoc dang duoc user so huu'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:justify-items-end">
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {selectedUserQuery.data.ownedCourseCount} khoa hoc
                    </span>
                    <label className="flex items-center gap-3 rounded-full border border-stroke bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                        className="size-4 rounded border-stroke text-teal-700"
                      />
                      Tai khoan hoat dong
                    </label>
                  </div>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Bio
                  <textarea
                    rows={5}
                    value={draft.bio}
                    onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
                    className="w-full rounded-[1.3rem] border border-stroke bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-400"
                  />
                </label>
              </div>

              {(updateMutation.error || deactivateMutation.error) ? (
                <QueryErrorState
                  title="Khong luu duoc user"
                  description={getApiErrorMessage(updateMutation.error ?? deactivateMutation.error)}
                />
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateMutation.isPending ? 'Dang luu...' : 'Cap nhat user'}
                </button>
                <button
                  type="button"
                  disabled={deactivateMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Vo hieu hoa tai khoan nay?')) {
                      deactivateMutation.mutate();
                    }
                  }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deactivateMutation.isPending ? 'Dang xu ly...' : 'Deactivate account'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
              Chon mot user de xem va chinh sua chi tiet.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
