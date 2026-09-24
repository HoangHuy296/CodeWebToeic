import { useTranslation } from "react-i18next";
import "./portfolio-page.css";

interface Qualification {
  value: string;
  label: string;
  detail: string;
}

interface Approach {
  number: string;
  title: string;
  text: string;
}

interface ClassroomImage {
  alt: string;
  title: string;
  description: string;
}

interface EducationItem {
  meta: string;
  title: string;
  school: string;
  text: string;
}

interface ExperienceItem {
  period: string;
  name: string;
  role: string;
  description: string;
}

interface EarlierExperienceItem {
  period: string;
  name: string;
  detail: string;
}

// Real photos, provided by the site owner — filenames don't change with language.
const classroomImageSrcs = ["/portfolio/thuy-vy-group-ai.png", "/portfolio/thuy-vy-individual-ai.png"];

const contactIcons = ["phone", "mail"] as const;

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
  const { t } = useTranslation("portfolio");

  const qualifications = t("qualifications", { returnObjects: true }) as Qualification[];
  const approaches = t("approaches", { returnObjects: true }) as Approach[];
  const classroomImagesText = t("classroomImages", { returnObjects: true }) as ClassroomImage[];
  const classroomImages = classroomImagesText.map((item, index) => ({ ...item, src: classroomImageSrcs[index] }));
  const education = t("education", { returnObjects: true }) as EducationItem[];
  const experience = t("experience", { returnObjects: true }) as ExperienceItem[];
  const earlierExperience = t("earlierExperience", { returnObjects: true }) as EarlierExperienceItem[];

  const contactActions = [
    { label: t("contact.phoneLabel"), value: "0784 902 824", href: "tel:0784902824", icon: contactIcons[0] },
    { label: t("contact.emailLabel"), value: "trinhdinhthuyvy@gmail.com", href: "mailto:trinhdinhthuyvy@gmail.com", icon: contactIcons[1] },
  ] as const;

  return (
    <div className="vy-portfolio">
      <section className="vy-hero" aria-labelledby="vy-name">
        <div className="vy-hero-copy">
          <p className="vy-eyebrow">
            <span className="vy-status-dot" /> {t("hero.eyebrow")}
          </p>
          <p className="vy-hello">{t("hero.hello")}</p>
          <h1 id="vy-name">
            {t("hero.nameLine1")}
            <br />
            <span>{t("hero.nameLine2")}</span>
          </h1>
          <p className="vy-hero-tagline">
            {t("hero.tagline1")}
            <br />
            {t("hero.tagline2")}
          </p>
          <p className="vy-hero-description">
            {t("hero.description")}
          </p>
          <div className="vy-hero-actions">
            <a className="vy-button vy-button-primary" href="#connect">
              {t("hero.ctaPrimary")} <ArrowIcon />
            </a>
            <a className="vy-text-link" href="#teaching">
              {t("hero.ctaSecondary")} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="vy-subjects" aria-label={t("hero.subjectsLabel")}>
            <span>{t("hero.subject1")}</span>
            <span>{t("hero.subject2")}</span>
            <span>{t("hero.subject3")}</span>
          </div>
        </div>
        <div className="vy-hero-visual">
          <img
            className="vy-hero-photo"
            src="/portfolio/thuy-vy-teaching.jpg"
            alt={t("hero.photoAlt")}
            width="2560"
            height="1920"
            fetchPriority="high"
          />
          <div className="vy-photo-note">
            <span className="vy-note-mark" aria-hidden="true">
              ✳
            </span>
            <span>
              {t("hero.photoNote1")}
              <br />
              <strong>{t("hero.photoNote2")}</strong>
            </span>
          </div>
          <span className="vy-photo-index">{t("hero.photoIndex")}</span>
        </div>
      </section>

      <section
        className="vy-qualifications"
        aria-label={t("qualificationsLabel")}
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
            alt={t("about.portraitAlt")}
            width="2560"
            height="1706"
            loading="lazy"
          />
          <figcaption>
            <span>{t("about.portraitCaption1")}</span>
            <span>{t("about.portraitCaption2")}</span>
          </figcaption>
        </figure>
        <div className="vy-about-copy">
          <p className="vy-eyebrow">{t("about.eyebrow")}</p>
          <h2 id="vy-about-title">
            {t("about.heading1")}
            <br />
            <span>{t("about.heading2")}</span>
          </h2>
          <p>
            {t("about.paragraph1")}
          </p>
          <p>
            {t("about.paragraph2")}
          </p>
          <div className="vy-about-signature">
            <span className="vy-signature">{t("about.signatureName")}</span>
            <span>{t("about.signatureRole")}</span>
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
            <p className="vy-eyebrow">{t("teaching.eyebrow")}</p>
            <h2 id="vy-teaching-title">
              {t("teaching.heading1")}
              <br />
              <span>{t("teaching.heading2")}</span>
            </h2>
          </div>
          <p>
            {t("teaching.subheading")}
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
          {t("teaching.imageDisclosure")}
        </p>
      </section>

      <section
        className="vy-section vy-background"
        aria-labelledby="vy-background-title"
      >
        <div className="vy-education">
          <p className="vy-eyebrow">{t("background.eyebrow")}</p>
          <h2 id="vy-background-title">
            {t("background.heading1")}
            <br />
            <span>{t("background.heading2")}</span>
          </h2>
          {education.map((item, index) => (
            <article className="vy-education-item" key={item.title}>
              <p className="vy-meta">
                {item.meta} {index === 0 ? <span className="vy-studying">{t("background.studyingLabel")}</span> : null}
              </p>
              <h3>{item.title}</h3>
              <p className="vy-school">{item.school}</p>
              <p>{item.text}</p>
            </article>
          ))}
          <div className="vy-community">
            <span aria-hidden="true">↗</span>
            <p>
              <strong>{t("background.communityNoteBold")}</strong> {t("background.communityNoteText")}
            </p>
          </div>
        </div>
        <div className="vy-experience">
          <p className="vy-eyebrow">{t("experienceLabel")}</p>
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
              {t("earlierExperienceSummary")} <span aria-hidden="true">+</span>
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
          <p className="vy-eyebrow">{t("contact.eyebrow")}</p>
          <h2 id="vy-contact-title">
            {t("contact.heading1")}
            <br />
            <span>{t("contact.heading2")}</span>
          </h2>
          <p>
            {t("contact.paragraph")}
          </p>
        </div>
        <div className="vy-contact-cards">
          <article
            className="vy-contact-card"
            aria-labelledby="vy-contact-card-name"
          >
            <p className="vy-contact-card-role">{t("contact.cardRole")}</p>
            <h3 id="vy-contact-card-name">{t("contact.cardName")}</h3>
            <p className="vy-contact-card-note">
              {t("contact.cardNote")}
            </p>
            <div className="vy-contact-card-actions">
              {contactActions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  className="vy-social-link"
                >
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
            <p className="vy-contact-location">{t("contact.location")}</p>
          </article>
        </div>
      </section>
      <p className="vy-profile-note">
        {t("profileNote")}
      </p>
    </div>
  );
}
