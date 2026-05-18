import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../app/providers/auth-provider';
import { PageHero } from '../../components/common/page-hero';
import { QueryErrorState, QueryLoadingState } from '../../components/common/query-state';
import { getApiErrorMessage } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { messageApi } from '../../lib/message-api';
import type { SupportMessage } from '../../types/message';

function resolveReplyTarget(message: SupportMessage, currentUserId?: string | null) {
  if (message.senderUser?.id && message.senderUser.id !== currentUserId) {
    return message.senderUser;
  }

  if (message.recipientUser?.id && message.recipientUser.id !== currentUserId) {
    return message.recipientUser;
  }

  return undefined;
}

export function TeacherMessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | SupportMessage['status']>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [recipientUserId, setRecipientUserId] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [composeSuccess, setComposeSuccess] = useState('');

  const messagesQuery = useQuery({
    queryKey: ['teacher', 'messages'],
    queryFn: messageApi.list,
  });
  const recipientsQuery = useQuery({
    queryKey: ['teacher', 'message-recipients'],
    queryFn: messageApi.recipients,
  });
  const availableRecipients = recipientsQuery.data ?? [];
  const composeSubjectLength = composeSubject.trim().length;
  const composeContentLength = composeContent.trim().length;

  useEffect(() => {
    if (!recipientUserId && recipientsQuery.data && recipientsQuery.data.length > 0) {
      setRecipientUserId(recipientsQuery.data[0].id);
    }
  }, [recipientUserId, recipientsQuery.data]);

  const markMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'read' | 'replied' }) => messageApi.markRead(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'messages'] });
    },
  });
  const sendMutation = useMutation({
    mutationFn: (payload: { recipientUserId: string; subject: string; content: string }) => messageApi.sendInternal(payload),
    onSuccess: async (createdMessage) => {
      setComposeSubject('');
      setComposeContent('');
      setReplyContent('');
      setComposeSuccess('Tin nhan da duoc gui thanh cong.');
      setStatusFilter('all');
      setRoleFilter('all');
      setSearchKeyword('');
      setSelectedMessageId(createdMessage.id);
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'messages'] });
    },
  });

  useEffect(() => {
    if (availableRecipients.length === 0) {
      if (recipientUserId) {
        setRecipientUserId('');
      }
      return;
    }

    const recipientStillValid = availableRecipients.some((recipient) => recipient.id === recipientUserId);
    if (!recipientStillValid) {
      setRecipientUserId(availableRecipients[0].id);
    }
  }, [availableRecipients, recipientUserId]);

  const filteredMessages = (messagesQuery.data ?? []).filter((message) => {
    const matchesStatus = statusFilter === 'all' ? true : message.status === statusFilter;
    const counterpartyRole =
      (message.senderUser?.id && message.senderUser.id !== user?.id
        ? message.senderUser.role
        : message.recipientUser?.id && message.recipientUser.id !== user?.id
          ? message.recipientUser.role
          : message.recipientRole) ?? 'admin';
    const matchesRole = roleFilter === 'all' ? true : counterpartyRole === roleFilter;
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    const haystack = [message.subject, message.email, message.name, message.summary, message.content].join(' ').toLowerCase();
    const matchesKeyword = normalizedKeyword ? haystack.includes(normalizedKeyword) : true;
    return matchesStatus && matchesRole && matchesKeyword;
  });

  const selectedMessage =
    messagesQuery.data?.find((message) => message.id === selectedMessageId) ?? filteredMessages[0];
  const replyTarget = selectedMessage ? resolveReplyTarget(selectedMessage, user?.id) : undefined;

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="teacher messages"
        title="Inbox cho giang vien lam viec voi admin va hoc vien."
        description="Teacher co the theo doi conversation, reply truc tiep va gui tin nhan moi cho student da enroll trong khoa hoc cua minh hoac cho admin."
      />

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Inbox</h2>
          </div>

          <div className="mt-5 grid gap-3">
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="Tim theo role, email, topic, summary..."
              className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400"
              >
                <option value="all">Tat ca status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
                className="rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-400"
              >
                <option value="all">Tat ca roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {messagesQuery.isPending ? <div className="mt-6"><QueryLoadingState title="Dang tai inbox..." /></div> : null}
          {messagesQuery.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong tai duoc messages" description={getApiErrorMessage(messagesQuery.error)} />
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {filteredMessages.map((message) => {
              const counterparty =
                message.senderUser?.id && message.senderUser.id !== user?.id ? message.senderUser : message.recipientUser;
              return (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => setSelectedMessageId(message.id)}
                  className={[
                    'rounded-[1.5rem] border px-4 py-4 text-left transition',
                    selectedMessage?.id === message.id ? 'border-teal-300 bg-teal-50' : 'border-stroke bg-slate-50 hover:bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{message.subject}</p>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
                        message.status === 'unread' ? 'bg-amber-100 text-amber-800' : message.status === 'replied' ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-700',
                      ].join(' ')}
                    >
                      {message.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700">
                      {counterparty?.role ?? message.recipientRole ?? 'contact'}
                    </span>
                    <span>{counterparty?.email ?? message.email}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">{counterparty?.fullName ?? message.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{message.summary ?? message.content}</p>
                </button>
              );
            })}

            {!messagesQuery.isPending && filteredMessages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
                Chua co message nao phu hop voi bo loc hien tai.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Chi tiet message va reply</h2>
            <p className="mt-2 text-sm text-slate-600">Teacher co the xem conversation va phan hoi ngay tu detail pane truoc khi tao message moi.</p>
          </div>

          {markMutation.error ? (
            <div className="mt-6">
              <QueryErrorState title="Khong cap nhat duoc message" description={getApiErrorMessage(markMutation.error)} />
            </div>
          ) : null}

          {selectedMessage ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-[1.5rem] border border-stroke bg-slate-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-black tracking-tight text-slate-950">{selectedMessage.subject}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {(replyTarget?.fullName ?? selectedMessage.name) || 'Nguoi gui'} - {(replyTarget?.email ?? selectedMessage.email) || 'No email'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                      {selectedMessage.status}
                    </span>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-700">
                      {replyTarget?.role ?? selectedMessage.recipientRole ?? 'contact'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-500">
                  <p>Tao luc: {formatDateTime(selectedMessage.createdAt)}</p>
                  <p>Read at: {formatDateTime(selectedMessage.readAt)}</p>
                  <p>Replied at: {formatDateTime(selectedMessage.repliedAt)}</p>
                  <p>
                    Sender:{' '}
                    {selectedMessage.senderUser?.fullName ?? selectedMessage.senderUser?.email ?? selectedMessage.name}
                  </p>
                  <p>
                    Recipient:{' '}
                    {selectedMessage.recipientUser?.fullName ?? selectedMessage.recipientUser?.email ?? selectedMessage.email}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-stroke bg-white p-5">
                <p className="text-sm leading-8 text-slate-700">{selectedMessage.content}</p>
              </div>

              <form
                className="grid gap-3 rounded-[1.5rem] border border-stroke bg-slate-50 p-5"
                onSubmit={(event) => {
                  event.preventDefault();

                  if (!replyTarget?.id) {
                    return;
                  }

                  sendMutation.mutate(
                    {
                      recipientUserId: replyTarget.id,
                      subject: `RE: ${selectedMessage.subject}`,
                      content: replyContent,
                    },
                    {
                      onSuccess: async () => {
                        setReplyContent('');
                        await markMutation.mutateAsync({ id: selectedMessage.id, status: 'replied' });
                      },
                    },
                  );
                }}
              >
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Tra loi
                  <textarea
                    rows={4}
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    placeholder="Nhap noi dung phan hoi..."
                    className="rounded-[1.3rem] border border-stroke bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
                  />
                </label>
                <button
                  type="submit"
                  disabled={sendMutation.isPending || !replyTarget?.id || replyContent.trim().length < 3}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {sendMutation.isPending ? 'Dang gui phan hoi...' : 'Gui phan hoi'}
                </button>
              </form>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={markMutation.isPending}
                  onClick={() => markMutation.mutate({ id: selectedMessage.id, status: 'read' })}
                  className="rounded-2xl border border-stroke bg-white px-5 py-3 text-sm font-semibold text-slate-900"
                >
                  Danh dau da doc
                </button>
                <button
                  type="button"
                  disabled={markMutation.isPending}
                  onClick={() => markMutation.mutate({ id: selectedMessage.id, status: 'replied' })}
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  Danh dau da phan hoi
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stroke px-4 py-6 text-sm text-slate-500">
              Chua co message nao trong inbox.
            </div>
          )}

          <div className="mt-8 grid gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Gui tin nhan moi</h2>
              <p className="mt-2 text-sm text-slate-600">Teacher chi nhan va gui cho admin hoac student dang hoc trong khoa hoc cua minh.</p>
            </div>

            {recipientsQuery.isPending ? <QueryLoadingState title="Dang tai danh sach nguoi nhan..." /> : null}
            {recipientsQuery.error ? (
              <QueryErrorState title="Khong tai duoc nguoi nhan" description={getApiErrorMessage(recipientsQuery.error)} />
            ) : null}

            <form
              className="grid gap-4 rounded-[1.5rem] border border-stroke bg-slate-50 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                setComposeSuccess('');

                if (!recipientUserId || composeSubjectLength < 3 || composeContentLength < 10) {
                  return;
                }

                sendMutation.mutate({
                  recipientUserId,
                  subject: composeSubject,
                  content: composeContent,
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Nguoi nhan
                  <select
                    value={recipientUserId}
                    onChange={(event) => setRecipientUserId(event.target.value)}
                    disabled={availableRecipients.length === 0}
                    className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
                  >
                    {availableRecipients.length === 0 ? (
                      <option value="">Chua co nguoi nhan hop le</option>
                    ) : null}
                    {availableRecipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.fullName} - {recipient.role} - {recipient.email}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Topic
                  <input
                    value={composeSubject}
                    onChange={(event) => setComposeSubject(event.target.value)}
                    className="rounded-2xl border border-stroke bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Noi dung
                <textarea
                  rows={4}
                  value={composeContent}
                  onChange={(event) => setComposeContent(event.target.value)}
                  className="rounded-[1.3rem] border border-stroke bg-white px-4 py-3 text-sm outline-none focus:border-teal-400"
                />
              </label>

              {sendMutation.error ? (
                <QueryErrorState title="Khong gui duoc tin nhan" description={getApiErrorMessage(sendMutation.error)} />
              ) : null}
              {composeSuccess ? (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
                  {composeSuccess}
                </div>
              ) : null}
              {composeSubjectLength > 0 && composeSubjectLength < 3 ? (
                <p className="text-sm text-amber-700">Topic can it nhat 3 ky tu.</p>
              ) : null}
              {composeContentLength > 0 && composeContentLength < 10 ? (
                <p className="text-sm text-amber-700">Noi dung can it nhat 10 ky tu.</p>
              ) : null}

              <button
                type="submit"
                disabled={
                  sendMutation.isPending ||
                  availableRecipients.length === 0 ||
                  !recipientUserId
                }
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {sendMutation.isPending ? 'Dang gui...' : 'Gui tin nhan'}
              </button>
            </form>
          </div>
        </article>
      </section>
    </div>
  );
}
