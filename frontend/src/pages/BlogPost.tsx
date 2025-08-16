import { Calendar, Eye, Share2, Tag, User } from "lucide-react";
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

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
      fetchRelatedPosts();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const postData = await apiService.getBlogPost(slug!);
      setPost(postData);
    } catch (err) {
      setError('ब्लग पोस्ट फेला परेन');
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await apiService.getBlogPosts({
        is_published: true,
        ordering: '-published_at',
      });
      setRelatedPosts(response.results.slice(0, 3));
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ne-NP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('लिंक कपी गरियो!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'ब्लग पोस्ट फेला परेन'}
            </h1>
            <Link
              to="/blog"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-pink-600">गृहपृष्ठ</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-pink-600">ब्लग</Link>
            <span>/</span>
            <span className="text-gray-800">{post.title}</span>
          </div>
        </nav>

        <article className="max-w-4xl mx-auto">
          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author_name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(post.published_at || post.created_at)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views_count} पटक हेरिएको</span>
              </div>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-pink-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>साझा गर्नुहोस्</span>
              </button>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-pink-600 prose-strong:text-gray-800"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Post Footer */}
          <footer className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                अन्तिम अपडेट: {formatDate(post.updated_at)}
              </div>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
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
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              अन्य पोस्टहरू
              <span className="block text-lg text-gray-600 mt-1">Related Posts</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.filter(p => p.slug !== post.slug).slice(0, 3).map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {relatedPost.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(relatedPost.published_at || relatedPost.created_at)}
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