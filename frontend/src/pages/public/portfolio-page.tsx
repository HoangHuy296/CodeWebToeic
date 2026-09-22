import "./portfolio-page.css";

// Profile facts come from the supplied CV. The owner confirmed that the
// Master of Education (TESOL) programme is currently in progress.
const qualifications = [
  { value: "970", label: "TOEIC", detail: "07.01.2025" },
  { value: "7.5", label: "IELTS", detail: "24.08.2025" },
  { value: "120h", label: "Chứng chỉ TESOL", detail: "03.2026" },
  { value: "2018", label: "Bắt đầu giảng dạy", detail: "Trẻ em & người lớn" },
];

const experience = [
  {
    period: "12.2025 — nay",
    name: "Simple English Center",
    role: "Giáo viên tiếng Anh giao tiếp",
    description:
      "Kết hợp nghe chép chính tả, Repeat & Shadow, TPR và hoạt động thực hành để phát triển phát âm, khả năng nghe nói và sự tự tin trong giao tiếp.",
  },
  {
    period: "08.2024 — 08.2025",
    name: "Mini Hippo",
    role: "Giáo viên TOEIC toàn thời gian",
    description:
      "Điều chỉnh phương pháp và tài liệu theo nhu cầu học viên, hướng dẫn chiến thuật làm bài, theo dõi tiến bộ và phát triển năng lực tiếng Anh bên cạnh mục tiêu điểm số.",
  },
  {
    period: "2021 — nay",
    name: "Giảng dạy tự do",
    role: "Giáo viên TOEIC",
    description:
      "Hướng dẫn các kỹ năng cần thiết cho bài thi TOEIC, theo dõi và đánh giá sự tiến bộ của học viên trong suốt khóa học.",
  },
];

const earlierExperience = [
  {
    period: "06.2023 — 07.2024",
    name: "The Gold Beehive Kindergarten",
    detail:
      "Xây dựng môi trường sử dụng tiếng Anh qua trò chơi, bài hát, kể chuyện và hoạt động sáng tạo.",
  },
  {
    period: "04.2020 — 03.2021",
    name: "Helen Doron English Vietnam",
    detail:
      "Dạy tiếng Anh cho trẻ nhỏ; tạo cơ hội thực hành ngôn ngữ trong và ngoài lớp học.",
  },
  {
    period: "03.2019 — 03.2020",
    name: "Open English Center",
    detail:
      "Dạy người lớn và sinh viên, tập trung vào phát âm, giao tiếp và tình huống thực tế.",
  },
  {
    period: "03.2019",
    name: "American International School (AIES)",
    detail: "Giảng dạy tiếng Anh cho trẻ em.",
  },
  {
    period: "08.2018 — 02.2019",
    name: "Global Citizen English Academy",
    detail:
      "Dạy trẻ em và người lớn, chú trọng kỹ năng nói và hỗ trợ những khó khăn khi học tiếng Anh.",
  },
];

const approaches = [
  {
    number: "01",
    title: "Học từ điều bạn cần",
    text: "Phương pháp và tài liệu được điều chỉnh theo trình độ, nhu cầu và cách học của từng học viên.",
  },
  {
    number: "02",
    title: "Thực hành để tự tin hơn",
    text: "Luyện phát âm, nghe chép chính tả, shadowing và giao tiếp qua những tình huống gần gũi với cuộc sống.",
  },
  {
    number: "03",
    title: "Nhìn thấy mình tiến bộ",
    text: "Theo dõi quá trình học, nhận diện khó khăn và nhận phản hồi để biết mình cần luyện tập thêm ở đâu.",
  },
];

const classroomImages = [
  {
    src: "/portfolio/thuy-vy-group-ai.png",
    alt: "Ảnh cô Vy hướng dẫn ba học viên trưởng thành cùng xem bài tập tiếng Anh.",
    title: "Cùng hiểu bài, cùng tiến bộ",
    description:
      "Trao đổi, đặt câu hỏi và dành thời gian để hiểu từng phần của bài học.",
  },
  {
    src: "/portfolio/thuy-vy-individual-ai.png",
    alt: "Ảnh cô Vy hướng dẫn một học viên trưởng thành luyện phát âm.",
    title: "Tự tin từ những âm đầu tiên",
    description:
      "Lắng nghe, luyện phát âm và từng bước đưa tiếng Anh vào giao tiếp.",
  },
];

const contactActions = [
  {
    label: "Điện thoại",
    value: "0784 902 824",
    href: "tel:0784902824",
    icon: "phone",
  },
  {
    label: "Email",
    value: "trinhdinhthuyvy@gmail.com",
    href: "mailto:trinhdinhthuyvy@gmail.com",
    icon: "mail",
  },
] as const;

function SocialIcon({ icon }: { icon: "phone" | "mail" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon === "phone" ? (
        <path d="M6.7 4h2.7l1.3 4-1.8 1.8a16 16 0 0 0 5.3 5.3l1.8-1.8 4 1.3v2.7c0 1.1-.9 2-2 2C10.8 20 4 13.2 4 6c0-1.1.9-2 2-2Z" />
      ) : (
        <>
          <path d="m4 7.5 8 5.5 8-5.5" />
          <rect x="4" y="6" width="16" height="12" rx="2.5" />
        </>
      )}
    </svg>
  );
}

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" />
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}

export function PortfolioPage() {
  return (
    <div className="vy-portfolio">
      <section className="vy-hero" aria-labelledby="vy-name">
        <div className="vy-hero-copy">
          <p className="vy-eyebrow">
            <span className="vy-status-dot" /> GẶP GỠ GIẢNG VIÊN CỦA BẠN
          </p>
          <p className="vy-hello">Xin chào, mình là</p>
          <h1 id="vy-name">
            Trịnh Đình
            <br />
            <span>Thúy Vy.</span>
          </h1>
          <p className="vy-hero-tagline">
            Cùng bạn học tiếng Anh,
            <br />
            tự tin hơn mỗi ngày.
          </p>
          <p className="vy-hero-description">
            Từ những âm đầu tiên đến mục tiêu TOEIC, cô Vy đồng hành bằng sự
            kiên nhẫn, bài học gần gũi và lộ trình phù hợp với bạn.
          </p>
          <div className="vy-hero-actions">
            <a className="vy-button vy-button-primary" href="#connect">
              Trò chuyện với cô Vy <ArrowIcon />
            </a>
            <a className="vy-text-link" href="#teaching">
              Khám phá cách học <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="vy-subjects" aria-label="Lĩnh vực giảng dạy">
            <span>TOEIC</span>
            <span>Tiếng Anh giao tiếp</span>
            <span>Phát âm</span>
          </div>
        </div>
        <div className="vy-hero-visual">
          <img
            className="vy-hero-photo"
            src="/portfolio/thuy-vy-teaching.jpg"
            alt="Cô Trịnh Đình Thúy Vy hướng dẫn khẩu hình phát âm bên laptop — ảnh gốc được cung cấp."
            width="2560"
            height="1920"
            fetchPriority="high"
          />
          <div className="vy-photo-note">
            <span className="vy-note-mark" aria-hidden="true">
              ✳
            </span>
            <span>
              Một chút kiên trì.
              <br />
              <strong>Một bước tự tin.</strong>
            </span>
          </div>
          <span className="vy-photo-index">THÚY VY / ENGLISH TEACHER</span>
        </div>
      </section>

      <section
        className="vy-qualifications"
        aria-label="Chứng chỉ và kinh nghiệm theo CV"
      >
        {qualifications.map((item) => (
          <div className="vy-qualification" key={item.label}>
            <span className="vy-qualification-value">{item.value}</span>
            <div>
              <h2>{item.label}</h2>
              <p>{item.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section
        className="vy-section vy-about"
        id="about"
        aria-labelledby="vy-about-title"
      >
        <figure className="vy-about-visual">
          <img
            src="/portfolio/thuy-vy-portrait.jpg"
            alt="Chân dung cô Vy với kính gọng tròn, mỉm cười giữa không gian xanh — ảnh gốc được cung cấp."
            width="2560"
            height="1706"
            loading="lazy"
          />
          <figcaption>
            <span>Một chút về cô Vy</span>
            <span>TP. Hồ Chí Minh</span>
          </figcaption>
        </figure>
        <div className="vy-about-copy">
          <p className="vy-eyebrow">NGƯỜI ĐỒNG HÀNH</p>
          <h2 id="vy-about-title">
            Lắng nghe bạn.
            <br />
            <span>Hiểu cách bạn học.</span>
          </h2>
          <p>
            Giảng dạy tiếng Anh từ năm 2018, cô Vy đã làm việc với trẻ em, sinh
            viên và người lớn. Mỗi trải nghiệm giúp cô hiểu hơn những khó khăn
            của người học và cách tạo một lớp học khuyến khích mọi người lên
            tiếng.
          </p>
          <p>
            Với TOEIC và tiếng Anh giao tiếp, cô chú trọng thực hành, điều chỉnh
            bài học theo nhu cầu và theo sát quá trình tiến bộ. Ngoài giờ dạy,
            cô yêu âm nhạc, tìm hiểu trò chơi ESL và tiếp tục học hỏi về phương
            pháp giảng dạy.
          </p>
          <div className="vy-about-signature">
            <span className="vy-signature">Thúy Vy</span>
            <span>English teacher · Lifelong learner</span>
          </div>
        </div>
      </section>

      <section
        className="vy-section"
        id="teaching"
        aria-labelledby="vy-teaching-title"
      >
        <div className="vy-section-heading">
          <div>
            <p className="vy-eyebrow">CÁCH CÔ VY ĐỒNG HÀNH</p>
            <h2 id="vy-teaching-title">
              Học có định hướng.
              <br />
              <span>Thực hành có niềm vui.</span>
            </h2>
          </div>
          <p>
            Một không gian để bạn thoải mái hỏi, thử, sửa và tiếp tục tiến về
            phía trước.
          </p>
        </div>
        <ol className="vy-approaches">
          {approaches.map((item) => (
            <li key={item.number}>
              <span className="vy-approach-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
        <div className="vy-classroom-grid">
          {classroomImages.map((item) => (
            <figure className="vy-classroom" key={item.src}>
              <div className="vy-classroom-image">
                <img
                  src={item.src}
                  alt={item.alt}
                  width="1536"
                  height="1024"
                  loading="lazy"
                />
              </div>
              <figcaption>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="vy-image-disclosure">
          Hai hình ảnh lớp học cô Vy minh họa hoạt động học tập lớp học thực tế.
        </p>
      </section>

      <section
        className="vy-section vy-background"
        aria-labelledby="vy-background-title"
      >
        <div className="vy-education">
          <p className="vy-eyebrow">NỀN TẢNG CHUYÊN MÔN</p>
          <h2 id="vy-background-title">
            Luôn học hỏi
            <br />
            <span>để dạy tốt hơn.</span>
          </h2>
          <article className="vy-education-item">
            <p className="vy-meta">
              2026 <span className="vy-studying">Đang theo học</span>
            </p>
            <h3>Master of Education (TESOL)</h3>
            <p className="vy-school">
              Open University × Edith Cowan University
            </p>
            <p>
              Chương trình về giảng dạy ngôn ngữ, thiết kế khóa học và tài liệu,
              kiểm tra và đánh giá người học.
            </p>
          </article>
          <article className="vy-education-item">
            <p className="vy-meta">2016 — 2020</p>
            <h3>Ngôn ngữ & Văn học Anh</h3>
            <p className="vy-school">Đại học Khoa học Xã hội và Nhân văn</p>
            <p>
              Định hướng giảng dạy ngôn ngữ, với nền tảng ngôn ngữ học, phương
              pháp và thực hành giảng dạy.
            </p>
          </article>
          <div className="vy-community">
            <span aria-hidden="true">↗</span>
            <p>
              <strong>Tiếng Anh cũng là sự kết nối.</strong> Năm 2019, cô tham
              gia hỗ trợ phiên dịch tại Friends for Street Children và tình
              nguyện dạy giao tiếp cho học sinh trong chương trình hè.
            </p>
          </div>
        </div>
        <div className="vy-experience">
          <p className="vy-eyebrow">HÀNH TRÌNH GIẢNG DẠY</p>
          <div className="vy-timeline">
            {experience.map((item) => (
              <article className="vy-timeline-item" key={item.name}>
                <p className="vy-meta">{item.period}</p>
                <h3>{item.name}</h3>
                <p className="vy-role">{item.role}</p>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
          <details className="vy-earlier-experience">
            <summary>
              Thêm kinh nghiệm giảng dạy <span aria-hidden="true">+</span>
            </summary>
            <div>
              {earlierExperience.map((item) => (
                <article key={item.name}>
                  <p className="vy-meta">{item.period}</p>
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section
        className="vy-contact"
        id="connect"
        aria-labelledby="vy-contact-title"
      >
        <div className="vy-contact-copy">
          <p className="vy-eyebrow">BẮT ĐẦU TỪ MỘT CUỘC TRÒ CHUYỆN</p>
          <h2 id="vy-contact-title">
            Mục tiêu của bạn là gì?
            <br />
            <span>Cùng cô Vy tìm hướng đi.</span>
          </h2>
          <p>
            Chia sẻ trình độ hiện tại, điều bạn muốn cải thiện và thời gian có
            thể dành cho tiếng Anh để trao đổi về cách học phù hợp.
          </p>
        </div>
        <div className="vy-contact-cards">
          <article className="vy-contact-card" aria-labelledby="vy-contact-card-name">
            <p className="vy-contact-card-role">Giảng viên</p>
            <h3 id="vy-contact-card-name">Trịnh Đình Thúy Vy</h3>
            <p className="vy-contact-card-note">
              Trao đổi về mục tiêu TOEIC, phát âm và tiếng Anh giao tiếp để tìm
              cách học phù hợp với bạn.
            </p>
            <div className="vy-contact-card-actions">
              {contactActions.map((action) => (
                <a key={action.href} href={action.href} className="vy-social-link">
                  <span className="vy-social-link-main">
                    <span className="vy-social-icon">
                      <SocialIcon icon={action.icon} />
                    </span>
                    <span className="vy-social-link-text">
                      <strong>{action.label}</strong>
                      <small>{action.value}</small>
                    </span>
                  </span>
                  <ArrowIcon diagonal />
                </a>
              ))}
            </div>
            <p className="vy-contact-location">TP. Hồ Chí Minh</p>
          </article>
        </div>
      </section>
      <p className="vy-profile-note">
        Thông tin học vấn, kinh nghiệm và chứng chỉ được giới thiệu theo CV của
        giảng viên.
      </p>
    </div>
  );
}
