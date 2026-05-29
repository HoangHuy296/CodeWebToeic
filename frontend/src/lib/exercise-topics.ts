export interface ExercisePackItem {
  slug: string;
  title: string;
  summary: string;
}

export interface ExerciseTopicSection {
  id: string;
  title: string;
  description: string;
  packs: ExercisePackItem[];
}

export interface ExerciseTopic {
  slug: string;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
  keywords: string[];
  sections: ExerciseTopicSection[];
}

export const exerciseTopics: ExerciseTopic[] = [
  {
    slug: 'grammar-by-topic',
    label: 'Bai tap theo chu diem ngu phap',
    shortLabel: 'Chu diem ngu phap',
    description:
      'Tong hop bai tap theo tung chu diem ngu phap TOEIC va IELTS de hoc vien luyen chuyen sau tung manh kien thuc.',
    accent: 'from-sky-500/20 via-cyan-400/10 to-emerald-400/20',
    keywords: ['grammar', 'ngu phap', 'practice set', 'mini test'],
    sections: [
      {
        id: 'tenses',
        title: 'Thi dong tu',
        description: 'Present, past, perfect, passive va cac bai tap bien doi cau.',
        packs: [
          { slug: 'present-tenses', title: 'Thi hien tai', summary: '15 cau tron bo ve hien tai don, tiep dien va hoan thanh.' },
          { slug: 'past-tenses', title: 'Thi qua khu', summary: 'Tong hop qua khu don, tiep dien va perfect trong ngu canh TOEIC.' },
          { slug: 'passive-voice', title: 'Cau bi dong', summary: 'Luyen nhanh chuyen doi active - passive theo cong viec van phong.' },
        ],
      },
      {
        id: 'modals',
        title: 'Dong tu khuyet thieu',
        description: 'Can, could, should, may, might, must, have to trong email va thong bao cong viec.',
        packs: [
          { slug: 'advice-obligation', title: 'Advice va obligation', summary: 'Phan biet should, ought to, must va have to.' },
          { slug: 'probability', title: 'Possibility va certainty', summary: 'Luyen may, might, could, must trong business English.' },
        ],
      },
      {
        id: 'relative-clauses',
        title: 'Menh de quan he',
        description: 'Who, whom, whose, which, that trong ngu canh hoc thuat va doanh nghiep.',
        packs: [
          { slug: 'relative-basic', title: 'Nen tang', summary: 'Rut gon va noi cau bang dai tu quan he.' },
          { slug: 'relative-advanced', title: 'Nang cao', summary: 'Mau cau phuc hop cho reading va sentence completion.' },
        ],
      },
    ],
  },
  {
    slug: 'grammar-by-test-pack',
    label: 'Bai tap ngu phap theo bo de',
    shortLabel: 'Ngu phap theo bo de',
    description:
      'Phan ngu phap duoc dong goi theo bo de va nam thi de hoc vien luyen theo tung de sat de thi that.',
    accent: 'from-violet-500/20 via-fuchsia-400/10 to-rose-400/20',
    keywords: ['grammar', 'full test', 'mini test', 'toeic'],
    sections: [
      {
        id: 'toeic-2026',
        title: 'Bo de TOEIC 2026',
        description: 'Chia theo bo 1, bo 2, bo 3 voi cau hoi sentence completion chuan doanh nghiep.',
        packs: [
          { slug: 'toeic-2026-set-1', title: 'Bo 1', summary: '15 cau sentence completion va error recognition.' },
          { slug: 'toeic-2026-set-2', title: 'Bo 2', summary: 'Cac cau ngu phap de bai xu ly meeting, finance va HR.' },
          { slug: 'toeic-2026-set-3', title: 'Bo 3', summary: 'Tang do kho, bo sung cau cau truc va lien tu.' },
        ],
      },
      {
        id: 'toeic-2025',
        title: 'Bo de TOEIC 2025',
        description: 'Ngu phap theo bo de nam truoc de hoc vien doi chieu xu huong ra de.',
        packs: [
          { slug: 'toeic-2025-set-1', title: 'Bo 1', summary: 'Part 5 grammar fundamentals.' },
          { slug: 'toeic-2025-set-2', title: 'Bo 2', summary: 'Lien tu, gioi tu va word form.' },
        ],
      },
    ],
  },
  {
    slug: 'vocabulary-by-test-pack',
    label: 'Bai tap tu vung theo bo de',
    shortLabel: 'Tu vung theo bo de',
    description:
      'Tap trung vao collocations, word families va business vocabulary theo tung bo de TOEIC/IELTS.',
    accent: 'from-amber-500/20 via-orange-400/10 to-rose-400/20',
    keywords: ['vocabulary', 'reading', 'practice set', 'ielts', 'toeic'],
    sections: [
      {
        id: 'business-vocabulary',
        title: 'Tu vung business core',
        description: 'Procurement, logistics, HR, accounting, customer service va sales.',
        packs: [
          { slug: 'business-pack-1', title: 'Business pack 1', summary: 'Email, meeting, schedule, project status.' },
          { slug: 'business-pack-2', title: 'Business pack 2', summary: 'Marketing, campaign, shipment, budget.' },
        ],
      },
      {
        id: 'ielts-academic',
        title: 'Tu vung IELTS Academic',
        description: 'Mau tu vung cho reading, writing task 1 va task 2.',
        packs: [
          { slug: 'academic-pack-1', title: 'Academic pack 1', summary: 'Education, environment, technology.' },
          { slug: 'academic-pack-2', title: 'Academic pack 2', summary: 'Health, economy, urban issues.' },
        ],
      },
    ],
  },
  {
    slug: 'reading-by-skill',
    label: 'Bai tap reading theo ky nang',
    shortLabel: 'Reading theo ky nang',
    description:
      'Tong hop bai tap reading theo ky nang scan, skim, paraphrase va tim evidence trong van ban TOEIC/IELTS.',
    accent: 'from-cyan-500/20 via-sky-400/10 to-blue-400/20',
    keywords: ['reading', 'practice set', 'mini test', 'toeic', 'ielts'],
    sections: [
      {
        id: 'scan-skim',
        title: 'Scan va skim',
        description: 'Doc nhanh de tim thong tin, y chinh va vi tri evidence.',
        packs: [
          { slug: 'scan-pack-1', title: 'Scan pack 1', summary: 'Loc ngay date, names, prices va deadlines trong email va notice.' },
          { slug: 'skim-pack-1', title: 'Skim pack 1', summary: 'Nhan dien topic sentence, summary line va muc dich doan van.' },
        ],
      },
      {
        id: 'paraphrase',
        title: 'Paraphrase recognition',
        description: 'Luyen doi chieu cach dien dat giua cau hoi va van ban goc.',
        packs: [
          { slug: 'paraphrase-pack-1', title: 'Paraphrase pack 1', summary: 'Matching synonym va phrase rewriting cho reading part 7.' },
        ],
      },
    ],
  },
  {
    slug: 'listening-by-skill',
    label: 'Bai tap listening theo ky nang',
    shortLabel: 'Listening theo ky nang',
    description:
      'Tap trung vao distractor, note-taking, short response va conference talk trong de TOEIC.',
    accent: 'from-emerald-500/20 via-teal-400/10 to-cyan-400/20',
    keywords: ['listening', 'mini test', 'full test', 'toeic'],
    sections: [
      {
        id: 'distractors',
        title: 'Distractor patterns',
        description: 'Nhan dien dap an nghe co ve quen tai nhung khong dung.',
        packs: [
          { slug: 'distractor-pack-1', title: 'Distractor pack 1', summary: 'Part 2 question-response voi bay ve am va keyword.' },
          { slug: 'distractor-pack-2', title: 'Distractor pack 2', summary: 'Part 3 short talks voi thong tin xuat hien som nhung sai.' },
        ],
      },
      {
        id: 'note-taking',
        title: 'Note-taking',
        description: 'Lay keyword, con so va timeline ma khong mat track bai nghe.',
        packs: [
          { slug: 'note-pack-1', title: 'Note pack 1', summary: 'Luyen ghi note cho meeting, schedule va travel announcement.' },
        ],
      },
    ],
  },
  {
    slug: 'writing-by-task',
    label: 'Bai tap writing theo dang task',
    shortLabel: 'Writing theo task',
    description:
      'Bai tap nho cho thesis sentence, idea development, cohesion va business email writing.',
    accent: 'from-rose-500/20 via-orange-400/10 to-amber-400/20',
    keywords: ['writing', 'practice set', 'ielts', 'business-english'],
    sections: [
      {
        id: 'ielts-task-2',
        title: 'IELTS Task 2',
        description: 'Thesis, topic sentence, example support va conclusion.',
        packs: [
          { slug: 'task2-thesis', title: 'Task 2 thesis', summary: 'Luyen viet thesis sentence ro position va co huong phat trien.' },
          { slug: 'task2-support', title: 'Task 2 support', summary: 'Them example va giai thich de doan van co suc nang.' },
        ],
      },
      {
        id: 'business-emails',
        title: 'Business emails',
        description: 'Subject line, request email, follow-up va tone control.',
        packs: [
          { slug: 'email-pack-1', title: 'Email pack 1', summary: 'Cac mau request va follow-up trong moi truong CRM.' },
        ],
      },
    ],
  },
  {
    slug: 'mixed-skill-sprints',
    label: 'Bai tap tong hop theo sprint',
    shortLabel: 'Sprint tong hop',
    description:
      'Nhung bo bai tap ngan ket hop grammar, reading, listening va vocabulary de hoc vien luyen theo sprint 15-20 phut.',
    accent: 'from-indigo-500/20 via-blue-400/10 to-cyan-400/20',
    keywords: ['mixed', 'mini test', 'practice set', 'full test'],
    sections: [
      {
        id: 'weekly-sprints',
        title: 'Weekly sprints',
        description: 'Bo bai tong hop cho nhung ngay can luyen nhanh de giu nhip hoc.',
        packs: [
          { slug: 'sprint-week-1', title: 'Sprint week 1', summary: 'Grammar + reading + vocabulary trong 15 phut.' },
          { slug: 'sprint-week-2', title: 'Sprint week 2', summary: 'Listening + grammar + error log review trong 20 phut.' },
        ],
      },
      {
        id: 'diagnostic-sprints',
        title: 'Diagnostic sprints',
        description: 'Do nhanh diem yeu truoc khi vao bo de dai hon.',
        packs: [
          { slug: 'diagnostic-pack-1', title: 'Diagnostic 1', summary: 'Scan nhanh cac diem yeu ve reading va grammar.' },
        ],
      },
    ],
  },
];

export function getExerciseTopicBySlug(slug: string) {
  return exerciseTopics.find((topic) => topic.slug === slug);
}
