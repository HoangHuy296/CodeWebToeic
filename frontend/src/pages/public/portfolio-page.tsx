import { Link } from 'react-router-dom';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    alt: 'Lop hoc TOEIC nhom nho',
    title: 'Small-group TOEIC coaching',
  },
  {
    src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hoc vien hoc voi laptop',
    title: 'Progress tracking after mock tests',
  },
  {
    src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Nhom hoc vien thao luan',
    title: '1-1 coaching for score targets',
  },
  {
    src: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Giang vien huong dan tren bang',
    title: 'Listening and Reading strategy class',
  },
];

const feedbacks = [
  {
    quote:
      'Em tang tu 405 len 645 sau 11 tuan. Diem khac biet lon nhat la em biet minh dang sai vi dau va sua theo he thong.',
    student: 'Ngoc Huyen',
    result: '405 -> 645',
  },
  {
    quote:
      'Thay khong day theo kieu mot chieu. Moi buoi deu co muc tieu ro, bai tap du, va review rat sat vao loi sai that cua em.',
    student: 'Minh Khoa',
    result: '520 -> 715',
  },
  {
    quote:
      'Hoc xong em khong chi co diem, ma con co study framework de tu hoc tiep. Day la diem em thay rat hiem.',
    student: 'Bao Tran',
    result: '470 -> 680',
  },
];

const teacherStrengths = [
  {
    title: 'Teaching system',
    text: 'Lo trinh TOEIC / IELTS duoc chia theo target score, skill gaps va weekly checkpoints.',
  },
  {
    title: 'Data-driven coaching',
    text: 'Theo doi error log, toc do lam bai, question groups va bien chung thanh action plan cho tung hoc vien.',
  },
  {
    title: 'Packaging mindset',
    text: 'Noi dung duoc dong goi thanh lesson, mock test, materials va homework de hoc vien hoc lien tuc.',
  },
  {
    title: 'Brand communication',
    text: 'Hinh anh, feedback va kenh lien he duoc gom lai de hoc vien moi tin tuong truoc khi dang ky.',
  },
];

const contactCards = [
  {
    role: 'Admin',
    name: 'IVYTS Admin',
    note: 'Ho tro dang ky, lich hoc, hoc phi va van hanh he thong.',
    actions: [
      { label: 'Facebook', href: 'https://facebook.com/', icon: 'fb' },
      { label: 'Zalo', href: 'https://zalo.me/0901000001', icon: 'zl' },
      { label: 'Phone', href: 'tel:0901000001', icon: 'ph' },
      { label: 'Mail', href: 'mailto:admin@ivyts.dev', icon: 'ml' },
    ],
  },
  {
    role: 'Teacher',
    name: 'Tran Minh Teacher',
    note: 'Nhan tu van muc tieu diem, danh gia trinh do va de xuat lo trinh hoc phu hop.',
    actions: [
      { label: 'Facebook', href: 'https://facebook.com/', icon: 'fb' },
      { label: 'Zalo', href: 'https://zalo.me/0901000002', icon: 'zl' },
      { label: 'Phone', href: 'tel:0901000002', icon: 'ph' },
      { label: 'Mail', href: 'mailto:teacher@ivyts.dev', icon: 'ml' },
    ],
  },
];

function SocialIcon({ icon }: { icon: string }) {
  if (icon === 'fb') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M14.5 8H17V4h-2.8C10.9 4 9 6 9 9.5V12H6v4h3v4h4v-4h3.2l.8-4H13V9.8c0-1.1.4-1.8 1.5-1.8Z" />
      </svg>
    );
  }

  if (icon === 'zl') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M5 6h14v3L9 18h10" />
        <path d="M5 18h14" />
      </svg>
    );
  }

  if (icon === 'ph') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M6.7 4h2.7l1.3 4-1.8 1.8a16 16 0 0 0 5.3 5.3l1.8-1.8 4 1.3v2.7c0 1.1-.9 2-2 2C10.8 20 4 13.2 4 6c0-1.1.9-2 2-2Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7.5 12 13l8-5.5" />
      <rect x="4" y="6" width="16" height="12" rx="2.5" />
    </svg>
  );
}

export function PortfolioPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-[0_26px_80px_rgba(15,23,42,0.16)] lg:px-10 lg:py-10">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[linear-gradient(135deg,rgba(20,184,166,0.22),rgba(245,158,11,0.16),transparent)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-teal-200">teacher profile</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight lg:text-6xl">
              Nang luc giang vien, feedback hoc vien va kenh ket noi cua IVYTS 1997.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-300 lg:text-base">
              Day la trang gioi thieu phong cach giang day, ket qua hoc vien va cach lien he nhanh voi admin hoac teacher truoc khi chon lo trinh TOEIC / IELTS.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
              >
                Xem khoa hoc
              </Link>
              <a
                href="#connect"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
              >
                Ket noi ngay
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Hoc vien tang diem', value: '150+' },
                { label: 'Lessons va mock tests', value: '40+' },
                { label: 'Feedback score', value: '4.9/5' },
              ].map((item) => (
                <article key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/7 px-4 py-4 backdrop-blur">
                  <p className="text-2xl font-black tracking-tight text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">{item.label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {galleryImages.slice(0, 4).map((image, index) => (
              <article
                key={image.src}
                className={[
                  'overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/8 backdrop-blur',
                  index === 0 ? 'sm:translate-y-10' : '',
                  index === 1 ? 'sm:-translate-y-3' : '',
                  index === 2 ? 'sm:translate-y-2' : '',
                ].join(' ')}
              >
                <img src={image.src} alt={image.alt} className="h-56 w-full object-cover" />
                <div className="p-4">
                  <p className="text-sm font-semibold text-white">{image.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[2rem] border border-stroke bg-[linear-gradient(160deg,rgba(20,184,166,0.12),rgba(255,255,255,0.94))] p-7 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">classroom evidence</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Khong gian hoc tap co cau truc va co dau vet tien bo.</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            Hinh anh tap trung vao lop hoc, buoi coaching, review bai thi va nhung diem cham giup hoc vien tin vao chat luong giang day.
          </p>
          <div className="mt-6 grid gap-4">
            {[
              'Lop nhom nho giup teacher theo sat loi sai cua tung hoc vien.',
              'Mock test va error log duoc dung lam co so cho buoi review.',
              'Profile giang vien the hien ro phong cach coaching va muc tieu diem.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          {galleryImages.map((image, index) => (
            <article
              key={`${image.title}-${index}`}
              className={index === 1 ? 'sm:mt-12' : index === 2 ? 'sm:-mt-8' : ''}
            >
              <div className="overflow-hidden rounded-[1.8rem] border border-stroke bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                <img src={image.src} alt={image.alt} className="h-64 w-full object-cover" />
                <div className="p-5">
                  <p className="text-lg font-black tracking-tight text-slate-950">{image.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{image.alt}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <article className="rounded-[2rem] border border-stroke bg-white p-7 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">student feedback</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Feedback hoc vien duoc gan voi ket qua cu the.</h2>
            </div>
            <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              4.9/5 rating
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {feedbacks.map((feedback) => (
              <article key={feedback.student} className="rounded-[1.6rem] border border-stroke bg-slate-50 p-5">
                <p className="text-sm leading-8 text-slate-700">"{feedback.quote}"</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black tracking-tight text-slate-950">{feedback.student}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hoc vien TOEIC</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                    {feedback.result}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-stroke bg-slate-950 p-7 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">teacher strengths</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Nang luc giang vien nam o lo trinh, du lieu va cach feedback.</h2>

          <div className="mt-6 grid gap-4">
            {teacherStrengths.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                <p className="text-lg font-black tracking-tight text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section
        id="connect"
        className="overflow-hidden rounded-[2.2rem] border border-stroke bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(240,253,250,0.92),rgba(255,251,235,0.92))] p-7 shadow-[0_20px_60px_rgba(15,23,42,0.07)]"
      >
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-700">social connect</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Ket noi nhanh voi admin va giang vien.</h2>
            <p className="mt-4 text-sm leading-8 text-slate-600">
              Chon kenh lien he phu hop de duoc tu van target score, lich hoc, hoc phi hoac lo trinh TOEIC / IELTS.
            </p>

            <div className="mt-6 rounded-[1.6rem] border border-white/70 bg-white/85 p-5">
              <p className="text-sm font-semibold text-slate-900">Thong tin nen gui khi lien he</p>
              <ul className="mt-3 grid gap-3 text-sm leading-7 text-slate-600">
                <li>Muc tieu diem TOEIC / IELTS va deadline can dat.</li>
                <li>Ket qua gan nhat neu da tung lam mock test.</li>
                <li>Khung gio hoc phu hop va hinh thuc online / offline mong muon.</li>
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {contactCards.map((person) => (
              <article key={person.role} className="rounded-[1.8rem] border border-stroke bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">{person.role}</p>
                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">{person.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{person.note}</p>

                <div className="mt-6 grid gap-3">
                  {person.actions.map((action) => (
                    <a
                      key={`${person.role}-${action.label}`}
                      href={action.href}
                      target={action.href.startsWith('http') ? '_blank' : undefined}
                      rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="flex items-center justify-between rounded-2xl border border-stroke bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-200 hover:bg-teal-50"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950 shadow-sm">
                          <SocialIcon icon={action.icon} />
                        </span>
                        {action.label}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">connect</span>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
