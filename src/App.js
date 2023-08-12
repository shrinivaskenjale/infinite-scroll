import axios from "axios";
import Filter from "./components/Filter";
import Posts from "./components/Posts";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

// To implement infinite scroll, we need to add intersection observer on last item of the list.
// We can't use useEffect and useRef to do this. Because since refs do not trigger render, useEffect won't run again after inital render and hence intersection observer will remain attached to only last list item of initial render even after fetching the second page.
// We can easily add ref prop with callback to last item in the list by comparing index of the items with size of the list. Inside this callback, we can attach intersection observer to dom node that we get access to.

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage, pages) => {
      if (pages.length < 100 / perPage) {
        return pages.length + 1;
      }
      return null;
    },
    staleTime: Infinity,
  });

  const observerRef = useRef();

  const lastPostRef = useCallback(
    (lastPost) => {
      if (isFetchingNextPage) {
        return;
      }

      // Remove old observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create new observer
      // Callback is called for each target element if any of the target crosses the threshold of intersection while entering or leaving the root element.
      // No options argument => root element becomes viewport
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // isIntersection === true => transition into a state of intersection
          // isIntersection === false => transition is from intersecting to not-intersecting
          if (entry.isIntersecting && hasNextPage) {
            console.log("reached end");
            fetchNextPage();
          }
        });
      });

      // Observe last post
      if (lastPost) {
        observerRef.current.observe(lastPost);
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  function handleChange(e) {
    setSearchTerm(e.target.value);
  }

  if (status === "error") {
    return <p className="center">Error: {error.message}</p>;
  }

  const posts = [];
  if (data) {
    for (let page of data.pages) {
      for (let post of page) {
        if (post.title.includes(searchTerm) || post.body.includes(searchTerm))
          posts.push(post);
      }
    }
  }

  return (
    <main className="section" id="top">
      <div className="section-title">
        <h1>My Posts</h1>
      </div>
      <div className="section-center">
        <Filter onChange={handleChange} searchTerm={searchTerm} />
        <Posts posts={posts} lastPostRef={lastPostRef} />
        {isFetching && <div className="loading">Loading...</div>}

        <div className="actions">
          {hasNextPage && (
            <button onClick={() => fetchNextPage()} className="btn">
              Load next page
            </button>
          )}
          <a href="#top" className="btn">
            Back to top
          </a>
        </div>
      </div>
    </main>
  );
}

const perPage = 5;

const fetchPosts = async ({ pageParam = 1 }) => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/posts",
    {
      params: {
        _limit: perPage,
        _page: pageParam,
      },
    }
  );
  return response.data;
};
