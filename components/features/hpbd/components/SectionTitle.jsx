export default function SectionTitle({ small, title, subtitle, light = false }) {
  return (
    <header className={`section-title ${light ? "section-title--light" : ""}`}>
      <span data-parallax="decoration">{small}</span>

      <h2 data-parallax="heading">{title}</h2>

      <p  data-parallax="text">{subtitle}</p>
    </header>
  );
}
