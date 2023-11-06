import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { GraphQLClient, gql } from "graphql-request"
import styles from "../../styles/Slug.module.css"
import Link from 'next/link'

const graphcms = new GraphQLClient("https://api-ap-northeast-1.hygraph.com/v2/clolhsiu28dsi01t7di3oeetd/master");

//特定のブログ情報を取得するAPIを叩く
const QUERY = gql`
  query Post($slug: String!) {
    post(where: {slug: $slug}) {
      id
      title
      slug
      datePublished
      author{
        id
        name
        avatar{
          url
        }
      }
      content{
        html
      }
      photo{
        id
        url
      }
    }
  }
`;

//GraphQLのクエリでslug一覧を取得するAPIを叩く
const SLUGLIST = gql`
{
  posts{
    slug
  }
}
`

export async function getStaticPaths() {
  //APIを取得
  const { posts } = await graphcms.request(SLUGLIST);
  return{
    paths: 
      // { params: { slug: "nextjs-graphql" } },
      // { params: { slug: "nextjs-ssg-ssr" } },
      posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false,
  };
}

//getStaticPropsでSSGを実装
export async function getStaticProps({ params }) {
  const slug = params.slug;
  //APIを取得
  const data = await graphcms.request(QUERY, { slug });
  const post = data.post;
  return {
    props: {
      post,
    },
  };
}

const inter = Inter({ subsets: ['latin'] })

export default function Home({ post }) {
  return (
    <main className={styles.blog}>
      <h2>{post.title}</h2>
      <img src={post.photo.url} alt='' className={styles.photo} />
      <div className={styles.title}>
        <div className={styles.authorText}>
          <h6>By {post.author.name}</h6>
          <h6 className={styles.date}>{post.datePublished}</h6>
        </div>
      </div>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: post.content.html }}
      ></div>
      <div className={styles.backButton}>
        <Link href="/">
          <span>←もどる</span>
        </Link>
      </div>
    </main>
  );
}
