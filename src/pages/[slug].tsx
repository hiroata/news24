import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from 'next/router';
import ReactMarkdown from "react-markdown";

export const getStaticPaths: GetStaticPaths = async () => {
  const novelsDir = path.join(process.cwd(), "src/content/novels");
  const files = fs.readdirSync(novelsDir);
  const paths = files.map((file) => ({
    params: { slug: file.replace(/\.md$/, "") },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const filePath = path.join(process.cwd(), "src/content/novels", `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  return {
    props: {
      novel: {
        ...data,
        body: content,
        id: slug,
      },
    },
  };
};

export default function NovelDetail({ novel }: any) {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-2">{novel.title}</h1>
      <div className="text-sm text-gray-500 mb-2">{novel.date}</div>
      <div className="mb-4">
        {novel.tags.map((tag: string) => (
          <span key={tag} className="inline-block bg-pink-100 text-pink-700 rounded px-2 py-1 mr-2 text-xs">#{tag}</span>
        ))}
      </div>
      <article className="prose prose-pink">
        <ReactMarkdown>{novel.body}</ReactMarkdown>
      </article>
    </main>
  );
}
