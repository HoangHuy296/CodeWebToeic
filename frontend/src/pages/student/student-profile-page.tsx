import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/auth-provider';
import { useNotifications } from '../../app/providers/notification-provider';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { authApi } from '../../lib/auth-api';
import { getApiErrorMessage } from '../../lib/api';
import { enrollmentApi, enrollmentQueryKeys } from '../../lib/enrollment-api';

function ProfileModal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            Dong
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function StudentProfilePage() {
  const { user, syncAuthPayload, syncCurrentUser } = useAuth();
  const { pushClientNotification } = useNotifications();
  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKeys.mine,
    queryFn: enrollmentApi.mine,
  });
  const [profileDraft, setProfileDraft] = useState({
    fullName: '',
    avatarUrl: '',
    bio: '',
  });
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({
    newEmail: '',
    verificationCode: '',
    previewCode: '',
    expiresAt: '',
  });
  const [phoneDraft, setPhoneDraft] = useState({
    newPhone: '',
    otpCode: '',
    previewCode: '',
    expiresAt: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isRequestingEmail, setIsRequestingEmail] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [isRequestingPhone, setIsRequestingPhone] = useState(false);
  const [isConfirmingPhone, setIsConfirmingPhone] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileDraft({
        fullName: user.fullName,
        avatarUrl: user.avatarUrl ?? '',
        bio: user.bio ?? '',
      });
      setEmailDraft((current) => ({ ...current, newEmail: user.email }));
      setPhoneDraft((current) => ({ ...current, newPhone: user.phone ?? '' }));
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileError('Chi ho tro upload file anh cho avatar.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Avatar local khong duoc vuot qua 2MB.');
      event.target.value = '';
      return;
    }

    setIsUploadingAvatar(true);
    setProfileError(null);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('Khong doc duoc file anh.'));
        reader.readAsDataURL(file);
      });

      setProfileDraft((current) => ({ ...current, avatarUrl: dataUrl }));
    } catch (error) {
      setProfileError(getApiErrorMessage(error));
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const enrolledCourseIds = (enrollmentsQuery.data ?? []).map((enrollment) => enrollment.course.id);
  const displayedCourseIds = user.role === 'student' ? enrolledCourseIds : user.ownedCourseIds;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:items-center">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-deep))] text-2xl font-black text-white shadow-[0_16px_38px_rgba(15,118,110,0.24)]">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
              ) : (
                user.fullName.slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-700">student profile</p>
              <h1 className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950 lg:text-[2rem]">{user.fullName}</h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Ho so nay update truc tiep vao MongoDB. Email va phone duoc tach thanh workflow xac nhan rieng de giam rui ro doi nham thong tin lien he.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="min-w-0 rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email hien tai</p>
              <p className="mt-3 min-h-[2.75rem] break-all text-sm font-black tracking-tight text-slate-950">{user.email}</p>
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                className="btn-brand mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
              >
                CRUD email
              </button>
            </article>

            <article className="min-w-0 rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">So dien thoai</p>
              <p className="mt-3 min-h-[2.75rem] break-all text-sm font-black tracking-tight text-slate-950">{user.phone || 'Chua cap nhat'}</p>
              <button
                type="button"
                onClick={() => setPhoneModalOpen(true)}
                className="btn-brand mt-4 inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
              >
                CRUD phone
              </button>
            </article>

            <article className="min-w-0 rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {user.role === 'student' ? 'Enrolled course IDs' : 'Owned course IDs'}
              </p>
              <p className="mt-3 break-all text-sm font-black tracking-tight text-slate-950">{String(displayedCourseIds.length)}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.88fr)]">
        <article className="min-w-0 rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">profile editor</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Cap nhat thong tin ca nhan</h2>
            </div>
          </div>

          <form
            className="mt-6 grid gap-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSavingProfile(true);
              setProfileError(null);
              setProfileSuccess(null);

              try {
                const updatedUser = await authApi.updateProfile(profileDraft);
                syncCurrentUser(updatedUser);
                setProfileSuccess('Cap nhat thong tin ca nhan thanh cong.');
              } catch (error) {
                setProfileError(getApiErrorMessage(error));
              } finally {
                setIsSavingProfile(false);
              }
            }}
          >
            <div className="grid gap-4">
              <div className="min-w-0 rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Avatar preview</p>
                <div className="mt-4 flex justify-center">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-deep))] text-2xl font-black text-white shadow-[0_16px_34px_rgba(76,29,149,0.2)]">
                    {profileDraft.avatarUrl ? (
                      <img src={profileDraft.avatarUrl} alt={profileDraft.fullName || user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      (profileDraft.fullName || user.fullName).slice(0, 1).toUpperCase()
                    )}
                  </div>
                </div>
                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Preview avatar hien tai truoc khi luu vao database.
                </p>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Ho ten
                <input
                  value={profileDraft.fullName}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, fullName: event.target.value }))}
                  className="w-full rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Avatar URL
                <input
                  value={profileDraft.avatarUrl}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, avatarUrl: event.target.value }))}
                  className="w-full rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Upload avatar tu may
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="w-full rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                />
                <span className="text-xs font-medium leading-5 text-slate-500">
                  Ho tro upload file anh local duoi 2MB. He thong se luu chuoi anh vao `avatarUrl`.
                </span>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Bio
                <textarea
                  rows={5}
                  value={profileDraft.bio}
                  onChange={(event) => setProfileDraft((current) => ({ ...current, bio: event.target.value }))}
                  className="min-h-[6.5rem] w-full max-w-full rounded-[1.3rem] border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
                />
              </label>
            </div>

            {profileError ? <QueryErrorState title="Khong cap nhat duoc profile" description={profileError} /> : null}
            {profileSuccess ? <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{profileSuccess}</p> : null}
            {isUploadingAvatar ? <p className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">Dang doc avatar local...</p> : null}

            <div className="sticky bottom-3 z-10 -mx-2 rounded-[1.4rem] border border-white/70 bg-white/92 px-5 py-4 shadow-[0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sticky action bar</p>
                  <p className="mt-1 text-sm text-slate-600">Luu profile sau khi kiem tra avatar, ho ten va bio.</p>
                </div>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-brand rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                >
                  {isSavingProfile ? 'Dang cap nhat...' : 'Luu thong tin ca nhan'}
                </button>
              </div>
            </div>
          </form>
        </article>

        <div className="grid min-w-0 gap-6">
          <article className="min-w-0 rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">password</p>
            <h2 className="mt-2 text-[1.75rem] font-black tracking-tight text-slate-950">Cap nhat mat khau</h2>

            <form
              className="mt-6 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setPasswordError(null);
                setPasswordSuccess(null);

                if (passwordDraft.newPassword !== passwordDraft.confirmPassword) {
                  setPasswordError('Mật khẩu xác nhận không khớp.');
                  return;
                }

                setIsSavingPassword(true);
                try {
                  await authApi.changePassword({
                    currentPassword: passwordDraft.currentPassword,
                    newPassword: passwordDraft.newPassword,
                  });
                  setPasswordSuccess('Đổi mật khẩu thành công.');
                  setPasswordDraft({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                } catch (error) {
                  setPasswordError(getApiErrorMessage(error));
                } finally {
                  setIsSavingPassword(false);
                }
              }}
            >
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Mat khau hien tai
                <input
                  type="password"
                  value={passwordDraft.currentPassword}
                  onChange={(event) => setPasswordDraft((current) => ({ ...current, currentPassword: event.target.value }))}
                  placeholder="Mat khau hien tai"
                  className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
                />
              </label>
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Mat khau moi
                  <input
                    type="password"
                    value={passwordDraft.newPassword}
                    onChange={(event) => setPasswordDraft((current) => ({ ...current, newPassword: event.target.value }))}
                    placeholder="Mat khau moi"
                    className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Nhap lai mat khau moi
                  <input
                    type="password"
                    value={passwordDraft.confirmPassword}
                    onChange={(event) => setPasswordDraft((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="Nhap lai mat khau moi"
                    className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
                  />
                </label>
              </div>

              {passwordError ? <QueryErrorState title="Khong doi duoc mat khau" description={passwordError} /> : null}
              {passwordSuccess ? <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{passwordSuccess}</p> : null}

              <button
                type="submit"
                disabled={isSavingPassword}
                className="btn-brand rounded-2xl px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
              >
                {isSavingPassword ? 'Dang doi mat khau...' : 'Cap nhat mat khau'}
              </button>
            </form>
          </article>

          <article className="min-w-0 rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
              {user.role === 'student' ? 'enrolled course ids' : 'owned course ids'}
            </p>
            <h2 className="mt-2 text-[1.75rem] font-black tracking-tight text-slate-950">
              {user.role === 'student' ? 'Du lieu khoa hoc da dang ky' : 'Du lieu khoa hoc dang so huu'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {user.role === 'student'
                ? 'Trang nay doc truc tiep tu enrollments API de khop voi /student/my-courses. Moi item hien course id va ten khoa hoc ma hoc vien da enroll.'
                : 'Day la field doc truc tiep tu database de profile page bao phu day du schema hien tai.'}
            </p>

            {user.role === 'student' && enrollmentsQuery.isPending ? (
              <div className="mt-5">
                <QueryLoadingState title="Dang tai khoa hoc da dang ky..." />
              </div>
            ) : null}

            {user.role === 'student' && enrollmentsQuery.error ? (
              <div className="mt-5">
                <QueryErrorState
                  title="Khong tai duoc danh sach khoa hoc da dang ky"
                  description={getApiErrorMessage(enrollmentsQuery.error)}
                />
              </div>
            ) : null}

            <div className="mt-5 grid max-h-[30rem] gap-3 overflow-y-auto pr-1">
              {user.role === 'student' ? (
                (enrollmentsQuery.data ?? []).length > 0 ? (
                  (enrollmentsQuery.data ?? []).map((enrollment) => (
                    <div key={enrollment.id} className="min-w-0 rounded-[1.3rem] border border-stroke bg-slate-50 px-4 py-4">
                      <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {enrollment.course.id}
                      </p>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="min-w-0 break-words text-sm font-black tracking-tight text-slate-950">
                          {enrollment.course.title ?? 'Course'}
                        </p>
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
                          {enrollment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-stroke px-4 py-5 text-sm text-slate-500">
                    Tai khoan student hien chua enroll khoa hoc nao.
                  </div>
                )
              ) : user.ownedCourseIds.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.ownedCourseIds.map((courseId) => (
                    <span
                      key={courseId}
                      className="max-w-full rounded-full border border-stroke bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600"
                    >
                      {courseId}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stroke px-4 py-5 text-sm text-slate-500">
                  Tai khoan nay hien chua so huu khoa hoc nao.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      {emailModalOpen ? (
        <ProfileModal
          title="Xac nhan thay doi email"
          description="Workflow MVP: gui ma xac nhan toi email moi. Trong moi truong dev, he thong hien preview code de test nhanh truoc khi hook vao provider email that."
          onClose={() => {
            setEmailModalOpen(false);
            setEmailError(null);
            setEmailSuccess(null);
          }}
        >
          <div className="grid gap-4">
            <input
              type="email"
              value={emailDraft.newEmail}
              onChange={(event) => setEmailDraft((current) => ({ ...current, newEmail: event.target.value }))}
              placeholder="Nhap email moi"
              className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isRequestingEmail}
                onClick={async () => {
                  setIsRequestingEmail(true);
                  setEmailError(null);
                  setEmailSuccess(null);

                  try {
                    const result = await authApi.requestEmailChange(emailDraft.newEmail);
                    setEmailDraft((current) => ({
                      ...current,
                      previewCode: result.verificationPreviewCode,
                      expiresAt: result.expiresAt,
                    }));
                    setEmailSuccess(`Da tao yeu cau doi email cho ${result.deliveryTarget}.`);
                  } catch (error) {
                    const message = getApiErrorMessage(error);
                    setEmailError(message);
                    pushClientNotification({
                      title: 'Gui email xac nhan that bai',
                      message,
                      severity: 'error',
                      entityType: 'profile',
                    });
                  } finally {
                    setIsRequestingEmail(false);
                  }
                }}
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {isRequestingEmail ? 'Dang gui...' : 'Gui email xac nhan'}
              </button>
            </div>

            {emailDraft.previewCode ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                Dev preview code: <span className="font-black">{emailDraft.previewCode}</span>
                <br />
                Het han luc: {new Date(emailDraft.expiresAt).toLocaleString('vi-VN')}
              </div>
            ) : null}

            <input
              value={emailDraft.verificationCode}
              onChange={(event) => setEmailDraft((current) => ({ ...current, verificationCode: event.target.value }))}
              placeholder="Nhap ma xac nhan 6 so"
              className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
            />

            {emailError ? <QueryErrorState title="Khong doi duoc email" description={emailError} /> : null}
            {emailSuccess ? <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{emailSuccess}</p> : null}

            <button
              type="button"
              disabled={isConfirmingEmail}
              onClick={async () => {
                setIsConfirmingEmail(true);
                setEmailError(null);
                setEmailSuccess(null);

                try {
                  const payload = await authApi.confirmEmailChange(emailDraft.newEmail, emailDraft.verificationCode);
                  syncAuthPayload(payload);
                  setEmailSuccess('Cap nhat email thanh cong.');
                  setEmailDraft({
                    newEmail: payload.user.email,
                    verificationCode: '',
                    previewCode: '',
                    expiresAt: '',
                  });
                  setEmailModalOpen(false);
                } catch (error) {
                  setEmailError(getApiErrorMessage(error));
                } finally {
                  setIsConfirmingEmail(false);
                }
              }}
              className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isConfirmingEmail ? 'Dang xac nhan...' : 'Xac nhan doi email'}
            </button>
          </div>
        </ProfileModal>
      ) : null}

      {phoneModalOpen ? (
        <ProfileModal
          title="Xac nhan thay doi so dien thoai"
          description="Workflow MVP: gui ma OTP toi so moi. Trong moi truong dev, page hien preview OTP de test nhanh truoc khi ket noi SMS provider."
          onClose={() => {
            setPhoneModalOpen(false);
            setPhoneError(null);
            setPhoneSuccess(null);
          }}
        >
          <div className="grid gap-4">
            <input
              value={phoneDraft.newPhone}
              onChange={(event) => setPhoneDraft((current) => ({ ...current, newPhone: event.target.value }))}
              placeholder="Nhap so dien thoai moi"
              className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
            />

            <button
              type="button"
              disabled={isRequestingPhone}
              onClick={async () => {
                setIsRequestingPhone(true);
                setPhoneError(null);
                setPhoneSuccess(null);

                try {
                  const result = await authApi.requestPhoneChange(phoneDraft.newPhone);
                  setPhoneDraft((current) => ({
                    ...current,
                    previewCode: result.verificationPreviewCode,
                    expiresAt: result.expiresAt,
                  }));
                  setPhoneSuccess(`Da tao yeu cau OTP cho ${result.deliveryTarget}.`);
                } catch (error) {
                  const message = getApiErrorMessage(error);
                  setPhoneError(message);
                  pushClientNotification({
                    title: 'Gui OTP that bai',
                    message,
                    severity: 'error',
                    entityType: 'profile',
                  });
                } finally {
                  setIsRequestingPhone(false);
                }
              }}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isRequestingPhone ? 'Dang gui OTP...' : 'Gui OTP'}
            </button>

            {phoneDraft.previewCode ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                Dev preview OTP: <span className="font-black">{phoneDraft.previewCode}</span>
                <br />
                Het han luc: {new Date(phoneDraft.expiresAt).toLocaleString('vi-VN')}
              </div>
            ) : null}

            <input
              value={phoneDraft.otpCode}
              onChange={(event) => setPhoneDraft((current) => ({ ...current, otpCode: event.target.value }))}
              placeholder="Nhap OTP 6 so"
              className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 outline-none transition focus:border-teal-400"
            />

            {phoneError ? <QueryErrorState title="Khong doi duoc phone" description={phoneError} /> : null}
            {phoneSuccess ? <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">{phoneSuccess}</p> : null}

            <button
              type="button"
              disabled={isConfirmingPhone}
              onClick={async () => {
                setIsConfirmingPhone(true);
                setPhoneError(null);
                setPhoneSuccess(null);

                try {
                  const updatedUser = await authApi.confirmPhoneChange(phoneDraft.newPhone, phoneDraft.otpCode);
                  syncCurrentUser(updatedUser);
                  setPhoneSuccess('Cap nhat so dien thoai thanh cong.');
                  setPhoneDraft({
                    newPhone: updatedUser.phone ?? '',
                    otpCode: '',
                    previewCode: '',
                    expiresAt: '',
                  });
                  setPhoneModalOpen(false);
                } catch (error) {
                  setPhoneError(getApiErrorMessage(error));
                } finally {
                  setIsConfirmingPhone(false);
                }
              }}
              className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {isConfirmingPhone ? 'Dang xac nhan...' : 'Xac nhan doi so dien thoai'}
            </button>
          </div>
        </ProfileModal>
      ) : null}
    </div>
  );
}
