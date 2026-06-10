import { useState } from 'react';
import { useClient } from 'sanity';
import { useIntentLink } from 'sanity/router';

interface Post {
  _id: string;
  title: string;
  articleNumber: number;
  slug: { current: string };
}

function PostResultCard({ post }: { post: Post }) {
  const href = useIntentLink({ intent: 'edit', params: { id: post._id } });
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        background: '#f9f9f9',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: '0.5rem',
        border: '1px solid #eee',
      }}
    >
      <span style={{
        minWidth: 32,
        height: 32,
        background: '#6155F1',
        color: '#fff',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: 700,
        flexShrink: 0,
      }}>
        #{post.articleNumber}
      </span>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{post.title}</span>
    </a>
  );
}

export function ArticleNumberFilter() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    const num = parseInt(input, 10);
    if (isNaN(num)) return;
    setLoading(true);
    setSearched(true);
    const data = await client.fetch<Post[]>(
      `*[_type == "post" && articleNumber == $num] | order(articleNumber asc) {
        _id, title, articleNumber, slug
      }`,
      { num }
    );
    setResults(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 480 }}>
      <h3 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666', marginBottom: '0.75rem' }}>
        Find by Article Number
      </h3>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="number"
          min={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. 42"
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !input}
          style={{
            padding: '0.5rem 1rem',
            background: '#6155F1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: loading || !input ? 0.5 : 1,
          }}
        >
          {loading ? '...' : 'Find'}
        </button>
      </div>

      {searched && results.length === 0 && !loading && (
        <p style={{ fontSize: '0.875rem', color: '#999' }}>No article found with number {input}.</p>
      )}

      {results.map(post => (
        <PostResultCard key={post._id} post={post} />
      ))}
    </div>
  );
}
