import { Calendar, Eye, Tag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiService } from "../services/api";
import type { BlogPost, PaginatedResponse } from "../types";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogPosts();
    fetchFeaturedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<BlogPost> = await apiService.getBlogPosts({
        is_published: true,
        ordering: "-published_at",
        page: currentPage,
      });
      setPosts(response.results);
      setTotalPages(Math.max(1, Math.ceil(response.count / 10))); // assuming 10 per page
      setError(null);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
      setError("ब्लग पोस्टहरू लोड गर्न सकिएन");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const featured = await apiService.getFeaturedBlogPosts();
      setFeaturedPosts((featured || []).slice(0, 3));
    } catch (err) {
      console.error("Error fetching featured posts:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            हाम्रो ब्लग
            <span className="block text-2xl md:text-3xl text-white/80 mt-2 font-semibold">
              Our Blog
            </span>
          </h1>
          <p className="text-white/80 max-w-3xl mx-auto mt-4 leading-relaxed">
            कपडा र फ्यासनको संसारमा नवीनतम जानकारी, टिप्स र ट्रेन्डहरू
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">
              विशेष पोस्टहरू
              <span className="block text-xl text-white/80 mt-1 font-semibold">
                Featured Posts
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-lg shadow hover:bg-white/15 transition"
                >
                  {post.featured_image ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5" />
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-4 text-sm text-white/80 mb-2">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_at || post.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views_count}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-white/80 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span className="inline-flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {post.author_name}
                      </span>

                      {(post.tags?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-4 w-4 opacity-70" />
                          {post.tags![0]}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center">
            सबै पोस्टहरू
            <span className="block text-xl text-white/80 mt-1 font-semibold">
              All Posts
            </span>
          </h2>

          {error ? (
            <div className="max-w-2xl mx-auto mb-10 p-4 rounded-xl bg-red-500/20 border border-red-400/30 text-red-100 text-center">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-white/80">
              कुनै ब्लग पोस्ट फेला परेन
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group rounded-2xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-lg shadow hover:bg-white/15 transition"
                  >
                    {post.featured_image ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5" />
                    )}

                    <div className="p-5">
                      <div className="flex items-center gap-4 text-sm text-white/80 mb-2">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views_count}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-white/80 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-white/80">
                        <span className="inline-flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {post.author_name}
                        </span>

                        {(post.tags?.length ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-4 w-4 opacity-70" />
                            {post.tags![0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-50"
                  >
                    अघिल्लो
                  </button>

                  <span className="px-4 py-2 rounded-full bg-yellow-300 text-black font-semibold">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 disabled:opacity-50"
                  >
                    अर्को
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
