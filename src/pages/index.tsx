import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

export async function getStaticProps() {
  const novelsDir = path.join(process.cwd(), "src/content/novels");
  const files = fs.readdirSync(novelsDir);
  const novels = files.map((file) => {
    const filePath = path.join(novelsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const { data, content: summary } = matter(content);
    return {
      id: file.replace(/\.md$/, ""),
      title: data.title,
      tags: data.tags,
      summary: summary.slice(0, 40) + "...",
      date: data.date,
      slug: file.replace(/\.md$/, ""),
    };
  });
  return { props: { novels } };
}

export default function Home({ novels }: any) {
  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">EroNews Generator</h1>
      <ul>
        {novels.map((novel: any) => (
          <li key={novel.id} className="mb-4">
            <Link href={`/${novel.slug}`} className="block hover:underline">
              <strong>{novel.title}</strong>
            </Link>
            <div className="text-xs text-gray-500 mb-1">{novel.date}</div>
            <div className="mb-1">
              {novel.tags.map((tag: string) => (
                <span key={tag} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs mr-2">#{tag}</span>
              ))}
            </div>
            <div className="text-gray-700">{novel.summary}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
