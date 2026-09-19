/** The fixed gradient behind everything. Its hue shifts with scroll depth. */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__layer backdrop__layer--blue" />
      <div className="backdrop__layer backdrop__layer--violet" />
      <div className="backdrop__grain" />
    </div>
  );
}
