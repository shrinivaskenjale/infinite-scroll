export default function Filter({ onChange, searchTerm }) {
  return (
    <div className="filter">
      <input
        type="text"
        placeholder="Filter posts"
        onChange={onChange}
        value={searchTerm}
      />
    </div>
  );
}
