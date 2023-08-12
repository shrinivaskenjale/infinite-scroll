import Post from "./Post";

export default function Posts({ posts, lastPostRef }) {
  const renderedPosts = posts.map((post, index) => {
    if (index + 1 === posts.length) {
      return <Post key={post.id} post={post} lastPostRef={lastPostRef} />;
    }
    return <Post key={post.id} post={post} />;
  });
  return <div className="posts">{renderedPosts}</div>;
}
