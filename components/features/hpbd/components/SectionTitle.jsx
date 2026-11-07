export default function SectionTitle({ small, title, subtitle, light = false }) {
  return (
    <header className={`section-title ${light ? "section-title--light" : ""}`} data-parallax="heading">
      <span>{small}</span>

      <h2>{title}</h2>

      <p>{subtitle}</p>
    </header>
  );
}
