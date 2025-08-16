import { Calendar, CheckCircle, Eye, Share2, Tag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { apiService } from "../services/api";
import type { BlogPost } from "../types";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchBlogPost();
    fetchRelatedPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const postData = await apiService.getBlogPost(slug!);
      setPost(postData);
      setError(null);
    } catch (err) {
      console.error("Error fetching blog post:", err);
      setError("ब्लग पोस्ट फेला परेन");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await apiService.getBlogPosts({
        is_published: true,
        ordering: "-published_at",
      });
      setRelatedPosts(response.results.slice(0, 3));
    } catch (err) {
      console.error("Error fetching related posts:", err);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && post) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled or share not supported
    }
  };

  if (loading) {
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 text-white">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-4">
              {error || "ब्लग पोस्ट फेला परेन"}
            </h1>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-300 text-black rounded-lg font-semibold hover:bg-yellow-200 transition"
            >
              ब्लगमा फर्कनुहोस्
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 text-white">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Link to="/" className="hover:text-yellow-300">गृहपृष्ठ</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-yellow-300">ब्लग</Link>
            <span>/</span>
            <span className="text-white">{post.title}</span>
          </div>
        </nav>

        <article className="max-w-4xl mx-auto">
          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/80 mb-6">
              <div className="inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author_name}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views_count} पटक हेरिएको</span>
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                <Share2 className="h-4 w-4" />
                <span>साझा गर्नुहोस्</span>
              </button>
            </div>

            {/* Copy toast */}
            {copied && (
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-100">
                <CheckCircle className="h-4 w-4" />
                लिंक कपी गरियो!
              </div>
            )}

            {/* Tags */}
            {(post.tags?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm"
                  >
                    <Tag className="h-3 w-3 opacity-80" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/20 bg-white/5">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-6 md:p-8 mb-12">
            <div
              className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white/80 prose-a:text-yellow-300 hover:prose-a:text-yellow-200 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Post Footer */}
          <footer className="bg-white/10 border border-white/20 backdrop-blur-lg rounded-2xl p-5 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-white/80">
                अन्तिम अपडेट: {formatDate(post.updated_at)}
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-300 text-black font-semibold hover:bg-yellow-200 transition"
              >
                <Share2 className="h-4 w-4" />
                साझा गर्नुहोस्
              </button>
            </div>
          </footer>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              अन्य पोस्टहरू
              <span className="block text-lg text-white/80 mt-1 font-semibold">
                Related Posts
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts
                .filter((p) => p.slug !== post.slug)
                .slice(0, 3)
                .map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="group rounded-2xl overflow-hidden bg-white/10 border border-white/20 backdrop-blur-lg shadow hover:bg-white/15 transition"
                  >
                    {relatedPost.featured_image ? (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-white/5" />
                    )}

                    <div className="p-4">
                      <h3 className="font-bold mb-2 group-hover:text-yellow-300 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>

                      <p className="text-sm text-white/80 mb-3 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Calendar className="h-3 w-3" />
                        {formatDate(
                          relatedPost.published_at || relatedPost.created_at
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPostPage;
