import { notFound } from 'next/navigation';
import { articles, getArticleBySlug } from '@/lib/journal-data';
import { ArticleContent } from '@/components/customer/ArticleContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return { title: article ? `${article.title} · MARIASCLUB™` : 'Article Not Found' };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleContent article={article} />;
}
