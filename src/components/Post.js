export default function Post({ lastPostRef, post }) {
  return (
    <article className="post" ref={lastPostRef}>
      <div className="number">{post.id}</div>
      <h2>{post.title}</h2>
      <p>{post.body}</p>
    </article>
  );
}
